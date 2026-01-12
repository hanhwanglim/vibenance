import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { TransactionRow } from "@vibenance/parser";
import { Check, ChevronDown, Plus } from "lucide-react";
import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { AccountDialog } from "@/modules/accounts/components/account-dialog";
import { TransactionPreviewTable } from "@/modules/transactions/components/transaction-preview-table";
import { orpc } from "@/utils/orpc";

export function ImportTransactions({ fileId }: { fileId: string }) {
	const navigate = useNavigate();

	const [selectedAccountId, setSelectedAccountId] = useState<string>("");

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

		const transactionData = previewData.map((transaction) => {
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
				navigate({ to: "/transactions" });
			},
			onError: (error) => {
				toast.error(`Failed to import transactions: ${error.message}`);
			},
		});
	};

	return (
		<>
			<div className="flex items-center gap-4">
				<SelectAccount
					value={selectedAccountId}
					setValue={setSelectedAccountId}
				/>
				<Button
					onClick={handleImport}
					disabled={!selectedAccountId || importMutation.isPending}
				>
					{importMutation.isPending ? "Importing..." : "Import Transactions"}
				</Button>
			</div>
			<TransactionPreviewTable data={(previewData || []) as TransactionRow[]} />
		</>
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
