"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatting";
import { orpc } from "@/utils/orpc";

const _ACCOUNT_TYPE_LABELS: Record<AccountWithStats["type"], string> = {
	savings: "Savings",
	current: "Current",
	checking: "Checking",
	credit_card: "Credit Card",
	investment: "Investment",
	loan: "Loan",
	other: "Other",
};

const _ACCOUNT_TYPE_ORDER: AccountWithStats["type"][] = [
	"savings",
	"checking",
	"current",
	"credit_card",
	"investment",
	"loan",
	"other",
];

const COLOR_CLASSES: Record<string, string> = {
	blue: "border-l-blue-500",
	green: "border-l-green-500",
	red: "border-l-red-500",
	orange: "border-l-orange-500",
	purple: "border-l-purple-500",
	pink: "border-l-pink-500",
	teal: "border-l-teal-500",
	gray: "border-l-gray-500",
};

export function AccountCards() {
	const { data: accounts, isLoading } = useQuery(
		orpc.bankAccount.getAll.queryOptions({ queryKey: ["bankAccount"] }),
	);

	// Group accounts by type
	const groupedAccounts = accounts?.reduce(
		(acc, account) => {
			if (!acc[account.type]) {
				acc[account.type] = [];
			}
			acc[account.type].push(account);
			return acc;
		},
		{} as Record<AccountWithStats["type"], AccountWithStats[]>,
	);

	console.log(groupedAccounts);

	if (isLoading || accounts?.length === 0) {
		return (
			<div className="px-4 lg:px-6">
				<Card>
					<CardHeader className="py-12 text-center">
						<Wallet className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
						<CardTitle>No accounts yet</CardTitle>
						<CardDescription>
							Create your first account to start tracking transactions
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-8 px-4 lg:px-6">
			{groupedAccounts &&
				Object.keys(groupedAccounts).flatMap((key) => {
					return (
						<div key={key} className="space-y-4">
							<h2 className="font-semibold text-xl capitalize">{key}</h2>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
								{groupedAccounts[key].map((account) => {
									return <AccountCard key={account.id} {...account} />;
								})}
							</div>
						</div>
					);
				})}
		</div>
	);
}

function AccountCard({
	id,
	color,
	name,
	type,
	bankName,
	accountNumber,
	createdAt,
	totalBalance,
	lastTransactionDate,
	transactionCount,
}) {
	const queryClient = useQueryClient();

	const deleteMutation = useMutation(
		orpc.bankAccount.delete.mutationOptions({}),
	);

	const handleDelete = async (id: number) => {
		if (
			!confirm(
				`Are you sure you want to delete "${name}"? This action cannot be undone.`,
			)
		) {
			return;
		}

		deleteMutation.mutate(id, {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["bankAccount"] });
				toast.success("Account deleted succesfully");
			},
			onError: (error) => toast.error(error.message),
		});
	};
	return (
		<Card
			className={cn(
				"flex flex-col",
				color && COLOR_CLASSES[color]
					? `${COLOR_CLASSES[color]} border-l-4`
					: "",
			)}
		>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<div className="mb-1 flex items-center gap-2">
							<CardTitle className="text-lg">{name}</CardTitle>
							<Badge variant="outline" className="text-xs capitalize">
								{type}
							</Badge>
						</div>
						{bankName && (
							<CardDescription className="text-xs">{bankName}</CardDescription>
						)}
						{accountNumber && (
							<CardDescription className="text-muted-foreground text-xs">
								Account: {accountNumber}
							</CardDescription>
						)}
						<CardDescription className="mt-1 text-xs">
							Created {new Date(createdAt).toLocaleDateString()}
						</CardDescription>
					</div>
					<div className="flex gap-1">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							// onClick={() => onEdit(account)}
						>
							<Pencil className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-destructive hover:text-destructive"
							onClick={() => handleDelete(id)}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardFooter className="mt-auto flex flex-col items-start gap-2 pt-0">
				<div className="flex w-full items-center gap-2">
					<span className="text-muted-foreground text-sm">Balance:</span>
					<span className="font-semibold text-lg">
						{formatCurrency(totalBalance, "USD")}
					</span>
				</div>
				<div className="flex w-full items-center gap-2">
					<span className="text-muted-foreground text-sm">Transactions:</span>
					<Badge variant="secondary">{transactionCount}</Badge>
				</div>
				{lastTransactionDate && (
					<div className="flex w-full items-center gap-2">
						<span className="text-muted-foreground text-sm">
							Last transaction:
						</span>
						<span className="text-sm">
							{new Date(lastTransactionDate).toLocaleDateString()}
						</span>
					</div>
				)}
			</CardFooter>
		</Card>
	);
}
