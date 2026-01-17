import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TransactionRow } from "@vibenance/parser";
import { AlertTriangle, Check, ChevronDown, Plus, X } from "lucide-react";
import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import { Dialog } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { AccountDialog } from "@/modules/accounts/components/account-dialog";
import { TransactionPreviewTable } from "@/modules/transactions/components/transaction-preview-table";
import { orpc } from "@/utils/orpc";

export function ImportTransactions({ fileId }: { fileId: string }) {
	const [selectedAccountId, setSelectedAccountId] = useState<string>("");
	const [activeTab, setActiveTab] = useState<string>("new");
	const [selectedNewRows, setSelectedNewRows] = useState<TransactionRow[]>([]);
	const [selectedSimilarRows, setSelectedSimilarRows] = useState<
		TransactionRow[]
	>([]);
	const [warningDismissed, setWarningDismissed] = useState(false);

	const queryClient = useQueryClient();

	const { data: previewData } = useQuery(
		orpc.transaction.previewImport.queryOptions({
			input: fileId,
			queryKey: ["import-transaction", "data"],
		}),
	);

	const importMutation = useMutation(
		orpc.transaction.create.mutationOptions({}),
	);

	const handleImport = () => {
		if (!previewData) return;

		let transactionsToImport: TransactionRow[] = [];
		let selectedRows: TransactionRow[] = [];

		if (activeTab === "new") {
			transactionsToImport = previewData.new || [];
			selectedRows = selectedNewRows;
		} else if (activeTab === "similar") {
			transactionsToImport = previewData.similar || [];
			selectedRows = selectedSimilarRows;
		} else {
			return;
		}

		const finalTransactions =
			selectedRows.length > 0 ? selectedRows : transactionsToImport;

		const transactionData = finalTransactions.map((transaction) => {
			const timestamp = new Date(
				transaction.date.getFullYear(),
				transaction.date.getMonth(),
				transaction.date.getDate(),
				transaction.time?.getHours() || 0,
				transaction.time?.getMinutes() || 0,
				transaction.time?.getSeconds() || 0,
				transaction.time?.getMilliseconds() || 0,
			);

			return {
				...transaction,
				timestamp: timestamp,
			};
		});

		const payload = {
			accountId: selectedAccountId,
			fileImportId: fileId,
			transactions: transactionData,
		};

		importMutation.mutate(payload, {
			onSuccess: () => {
				toast.success(
					`Successfully imported ${payload.transactions.length} transactions`,
				);
			},
			onError: (error) => {
				toast.error(`Failed to import transactions: ${error.message}`);
			},
			onSettled: () => {
				queryClient.invalidateQueries({
					queryKey: ["import-transaction", "data"],
				});
			},
		});
	};

	const canImport = activeTab !== "duplicate" && selectedAccountId !== "";

	const handleTabChange = (value: string) => {
		setActiveTab(value);
		if (value !== "similar") {
			setWarningDismissed(false);
		}
	};

	return (
		<Tabs
			value={activeTab}
			onValueChange={handleTabChange}
			defaultValue="new"
			className="w-full flex-col justify-start gap-6"
		>
			<div className="flex items-center justify-between px-4 lg:px-6">
				<div className="flex gap-2">
					<Label htmlFor="view-selector" className="sr-only">
						View
					</Label>
					<Select value={activeTab} onValueChange={handleTabChange}>
						<SelectTrigger
							className="flex @4xl/main:hidden w-fit"
							size="sm"
							id="view-selector"
						>
							<SelectValue placeholder="Select a view" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="new">
								New ({previewData?.new?.length || 0})
							</SelectItem>
							<SelectItem value="similar">
								Similar ({previewData?.similar?.length || 0})
							</SelectItem>
							<SelectItem value="duplicate">
								Duplicate ({previewData?.existing?.length || 0})
							</SelectItem>
						</SelectContent>
					</Select>
					<TabsList className="@4xl/main:flex hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1">
						<TabsTrigger value="new">
							New ({previewData?.new?.length || 0})
						</TabsTrigger>
						<TabsTrigger value="similar">
							Similar ({previewData?.similar?.length || 0})
						</TabsTrigger>
						<TabsTrigger value="duplicate">
							Duplicate ({previewData?.existing?.length || 0})
						</TabsTrigger>
					</TabsList>
					<SelectAccount
						value={selectedAccountId}
						setValue={setSelectedAccountId}
					/>
				</div>
				<Button
					onClick={handleImport}
					disabled={!canImport || importMutation.isPending}
				>
					{importMutation.isPending ? "Importing..." : "Import Transactions"}
				</Button>
			</div>
			<TabsContent
				value="new"
				className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
			>
				<TransactionPreviewTable
					data={(previewData?.new || []) as TransactionRow[]}
					onSelectionChange={setSelectedNewRows}
				/>
			</TabsContent>
			<TabsContent
				value="similar"
				className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
			>
				{!warningDismissed && (
					<Card className="border-yellow-500/50 bg-yellow-500/10">
						<CardContent className="flex items-center gap-2">
							<AlertTriangle className="h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-500" />
							<p className="text-yellow-800 dark:text-yellow-200">
								Warning: Importing these transactions may create duplicates.
								Please review carefully before importing.
							</p>
							<Button
								variant="ghost"
								size="icon"
								className="ml-auto h-6 w-6 shrink-0 text-yellow-800 hover:bg-yellow-500/20 dark:text-yellow-200"
								onClick={() => setWarningDismissed(true)}
								aria-label="Dismiss warning"
							>
								<X className="h-3.5 w-3.5" />
							</Button>
						</CardContent>
					</Card>
				)}
				<TransactionPreviewTable
					data={(previewData?.similar || []) as TransactionRow[]}
					onSelectionChange={setSelectedSimilarRows}
				/>
			</TabsContent>
			<TabsContent
				value="duplicate"
				className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
			>
				<TransactionPreviewTable
					data={(previewData?.existing || []) as TransactionRow[]}
				/>
			</TabsContent>
		</Tabs>
	);
}

export function SelectAccount({
	value,
	setValue,
}: {
	value: string;
	setValue: (value: string) => void;
}) {
	const [popoverOpen, setPopoverOpen] = React.useState(false);
	const [dialogOpen, setDialogOpen] = React.useState(false);

	const { data: bankAccounts } = useQuery(
		orpc.bankAccount.getAll.queryOptions({ queryKey: ["account"] }),
	);

	const handleCreateNew = () => {
		setPopoverOpen(false);
		setDialogOpen(true);
	};

	return (
		<>
			<Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={popoverOpen}
						className="w-50 justify-between"
					>
						{value
							? bankAccounts?.find((account) => account.id === value)?.name
							: "Select account"}
						<ChevronDown className="opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-50 p-0">
					<Command>
						<CommandInput placeholder="Search account" className="h-9" />
						<CommandList>
							<CommandEmpty>No framework found.</CommandEmpty>
							<CommandGroup>
								{bankAccounts?.map((account) => (
									<CommandItem
										key={account.id}
										value={account.id}
										onSelect={(currentValue) => {
											setValue(currentValue === value ? "" : currentValue);
											setPopoverOpen(false);
										}}
									>
										{account.name}
										<Check
											className={cn(
												"ml-auto",
												value === account.id ? "opacity-100" : "opacity-0",
											)}
										/>
									</CommandItem>
								))}
							</CommandGroup>
							<CommandSeparator />
							<CommandGroup>
								<CommandItem onSelect={handleCreateNew}>
									<Plus className="mr-2 h-4 w-4" />
									Create new account
								</CommandItem>
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<AccountDialog mode="create" onOpenChange={setDialogOpen} />
			</Dialog>
		</>
	);
}
