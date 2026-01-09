import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BankAccountSelect } from "@vibenance/db/schema/account";
import { PiggyBank } from "lucide-react";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { orpc } from "@/utils/orpc";
import { AccountCard } from "./account-card";
import { AccountDialog } from "./account-dialog";

const ACCOUNT_TYPE_LABELS: Record<BankAccountSelect["type"], string> = {
	savings: "Savings",
	current: "Current",
	checking: "Checking",
	credit_card: "Credit Card",
	investment: "Investment",
	loan: "Loan",
	other: "Other",
};

export function AccountList() {
	const queryClient = useQueryClient();
	const [editingAccount, setEditingAccount] =
		useState<BankAccountSelect | null>(null);
	const { data: accounts } = useQuery(orpc.bankAccount.getAll.queryOptions());

	const groupedAccounts = accounts?.reduce(
		(acc, account) => {
			if (!acc[account.type]) {
				acc[account.type] = [];
			}
			acc[account.type].push(account);
			return acc;
		},
		{} as Record<BankAccountSelect["type"], BankAccountSelect[]>,
	);

	const { mutate: deleteAccount } = useMutation(
		orpc.bankAccount.delete.mutationOptions({}),
	);

	const handleEdit = (account: BankAccountSelect) => {
		setEditingAccount(account);
	};

	const handleDelete = (account: BankAccountSelect) => {
		if (
			!confirm(
				`Are you sure you want to delete "${account.name}"? This action cannot be undone.`,
			)
		) {
			return;
		}

		deleteAccount(account.id, {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["account"] });
				toast.success("Account deleted successfully");
			},
			onError: (error) => toast.error(`Unable to delete account: ${error}`),
		});
	};

	if (accounts?.length === 0) {
		return (
			<div className="px-4 lg:px-6">
				<Card>
					<CardHeader className="py-12 text-center">
						<PiggyBank className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
						<CardTitle>No accounts yet</CardTitle>
						<CardDescription>Create some accounts first</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	return (
		<>
			<div className="space-y-4 px-4 lg:px-6">
				{groupedAccounts &&
					Object.keys(groupedAccounts).flatMap((key) => {
						const typedKey = key as BankAccountSelect["type"];
						return (
							<Fragment key={typedKey}>
								<div className="flex items-center justify-between">
									<h2 className="font-semibold text-xl">
										{ACCOUNT_TYPE_LABELS[typedKey]}
									</h2>
									<span className="text-muted-foreground text-sm">
										{groupedAccounts[typedKey].length}{" "}
										{groupedAccounts[typedKey]?.length === 1
											? "account"
											: "accounts"}
									</span>
								</div>
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
									{groupedAccounts[typedKey].map(
										(account: BankAccountSelect) => {
											return (
												<AccountCard
													key={account.id}
													account={account}
													onDelete={handleDelete}
													onEdit={handleEdit}
												/>
											);
										},
									)}
								</div>
							</Fragment>
						);
					})}
			</div>
			<Dialog
				open={editingAccount !== null}
				onOpenChange={(open) => {
					if (!open) {
						setEditingAccount(null);
					}
				}}
			>
				{editingAccount && (
					<AccountDialog
						mode="edit"
						account={editingAccount}
						onOpenChange={(open) => {
							if (!open) {
								setEditingAccount(null);
							}
						}}
					/>
				)}
			</Dialog>
		</>
	);
}
