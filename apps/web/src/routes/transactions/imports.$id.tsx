import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
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
import { authClient } from "@/lib/auth-client";
import { TransactionPreviewTable } from "@/modules/transactions/components/transaction-preview-table";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/transactions/imports/$id")({
	component: RouteComponent,
	beforeLoad: async ({ params }) => {
		const session = await authClient.getSession();
		if (!session.data) redirect({ to: "/login", throw: true });

		const fileId = Number(params.id);
		const file = orpc.file.get.queryOptions({ input: fileId });

		if (!file) {
			redirect({ to: "/transactions", throw: true });
		}

		return { session, file };
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
		orpc.file.preview.queryOptions({ input: Number(id) }),
	);

	const importMutation = useMutation(
		orpc.transaction.create.mutationOptions({}),
	);

	const handleImport = () => {
		const payload = {
			accountId: Number(selectedAccountId),
			fileImportId: Number(id),
			transactions: previewData,
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
			<TransactionPreviewTable fileId={Number(id)} data={previewData || []} />
		</div>
	);
}
