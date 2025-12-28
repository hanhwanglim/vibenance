import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import type { TransactionRow } from "@vibenance/parser";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { TransactionPreviewTable } from "@/modules/transactions/components/transaction-preview-table";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_app/transactions/imports/$id")({
	component: RouteComponent,
	beforeLoad: async ({ params }) => {
		const file = orpc.file.get.queryOptions({ input: params.id });
		if (!file) redirect({ to: "/transactions", throw: true });
		return { file };
	},
});

function RouteComponent() {
	const { id } = Route.useParams();
	const navigate = useNavigate();

	const [selectedAccountId, setSelectedAccountId] = useState<string>("");

	const { data: bankAccounts } = useQuery(
		orpc.bankAccount.getAll.queryOptions(),
	);

	const { data: previewData } = useQuery(
		orpc.transaction.previewImport.queryOptions({ input: id }),
	);

	const importMutation = useMutation(
		orpc.transaction.create.mutationOptions({}),
	);

	const handleImport = () => {
		if (!previewData) return;

		const payload = {
			accountId: selectedAccountId,
			fileImportId: id,
			transactions: previewData as TransactionRow[],
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
		<div className="flex flex-col gap-4 p-4">
			<div className="flex items-center gap-4">
				<Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
					<SelectTrigger className="w-[250px]">
						<SelectValue placeholder="Select Bank Account" />
					</SelectTrigger>
					<SelectContent>
						{bankAccounts?.map((bankAccount) => (
							<SelectItem
								key={`${bankAccount.name}-${bankAccount.id}`}
								value={String(bankAccount.id)}
							>
								{bankAccount.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Button
					onClick={handleImport}
					disabled={!selectedAccountId || importMutation.isPending}
				>
					{importMutation.isPending ? "Importing..." : "Import Transactions"}
				</Button>
			</div>
			<TransactionPreviewTable data={(previewData || []) as TransactionRow[]} />
		</div>
	);
}
