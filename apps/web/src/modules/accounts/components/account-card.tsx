"use client";

import type { BankAccountSelect } from "@vibenance/db/schema/account";
import {
	CreditCard,
	Landmark,
	Pencil,
	PiggyBank,
	Trash2,
	TrendingUp,
	Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatting";

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

const ACCOUNT_TYPE_ICONS: Record<BankAccountSelect["type"], typeof Wallet> = {
	savings: PiggyBank,
	current: Wallet,
	checking: Wallet,
	credit_card: CreditCard,
	investment: TrendingUp,
	loan: Landmark,
	other: Wallet,
};

const ACCOUNT_TYPE_LABELS: Record<BankAccountSelect["type"], string> = {
	savings: "Savings",
	current: "Current",
	checking: "Checking",
	credit_card: "Credit Card",
	investment: "Investment",
	loan: "Loan",
	other: "Other",
};

type AccountCardProps = {
	account: BankAccountSelect & { transactionCount?: number };
	onEdit?: (account: BankAccountSelect) => void;
	onDelete?: (account: BankAccountSelect) => void;
};

export function AccountCard({ account, onDelete, onEdit }: AccountCardProps) {
	const Icon = ACCOUNT_TYPE_ICONS[account.type] || Wallet;
	const balance = Number(account.balance || 0);
	const currency = account.currency || "USD";

	const formatDate = (date: Date | null | undefined) => {
		if (!date) return "Never";
		return new Date(date).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	return (
		<Card
			className={cn(
				"group relative flex flex-col overflow-hidden transition-all hover:shadow-md",
				account.color && COLOR_CLASSES[account.color]
					? `${COLOR_CLASSES[account.color]} border-l-4`
					: "border-l-4 border-l-muted",
			)}
		>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between gap-3">
					<div className="flex flex-1 items-start gap-3">
						<div
							className={cn(
								"flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
								account.color === "blue" &&
									"bg-blue-500/10 text-blue-600 dark:text-blue-400",
								account.color === "green" &&
									"bg-green-500/10 text-green-600 dark:text-green-400",
								account.color === "red" &&
									"bg-red-500/10 text-red-600 dark:text-red-400",
								account.color === "orange" &&
									"bg-orange-500/10 text-orange-600 dark:text-orange-400",
								account.color === "purple" &&
									"bg-purple-500/10 text-purple-600 dark:text-purple-400",
								account.color === "pink" &&
									"bg-pink-500/10 text-pink-600 dark:text-pink-400",
								account.color === "teal" &&
									"bg-teal-500/10 text-teal-600 dark:text-teal-400",
								account.color === "gray" &&
									"bg-gray-500/10 text-gray-600 dark:text-gray-400",
								!account.color && "bg-muted text-muted-foreground",
							)}
						>
							<Icon className="h-5 w-5" />
						</div>
						<div className="min-w-0 flex-1">
							<div className="mb-1 flex items-center gap-2">
								<CardTitle className="truncate font-semibold text-lg">
									{account.name}
								</CardTitle>
							</div>
							<div className="flex flex-wrap items-center gap-2">
								<Badge variant="outline" className="font-normal text-xs">
									{ACCOUNT_TYPE_LABELS[account.type]}
								</Badge>
								{account.bankName && (
									<CardDescription className="truncate text-xs">
										{account.bankName}
									</CardDescription>
								)}
							</div>
						</div>
					</div>
					<div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
						{onEdit && (
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={() => onEdit(account)}
							>
								<Pencil className="h-4 w-4" />
							</Button>
						)}
						{onDelete && (
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 text-destructive hover:text-destructive"
								onClick={() => onDelete(account)}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						)}
					</div>
				</div>
			</CardHeader>

			<CardContent className="flex-1 pb-3">
				<div className="space-y-4">
					<div>
						<div className="mb-1 text-muted-foreground text-xs">Balance</div>
						<div
							className={cn(
								"font-bold text-2xl",
								balance >= 0 ? "text-foreground" : "text-destructive",
							)}
						>
							{formatCurrency(balance, currency)}
						</div>
					</div>

					{account.accountNumber && (
						<div className="space-y-1">
							<div className="text-muted-foreground text-xs">
								Account Number
							</div>
							<div className="font-mono text-foreground text-sm">
								{account.accountNumber}
							</div>
						</div>
					)}
				</div>
			</CardContent>

			<CardFooter className="flex flex-col gap-2 border-t pt-3">
				<div className="flex w-full items-center justify-between text-xs">
					<span className="text-muted-foreground">Transactions</span>
					<Badge variant="secondary" className="font-medium">
						{account.transactionCount?.toLocaleString()}
					</Badge>
				</div>
				{account.latestTransactionTimestamp && (
					<div className="flex w-full items-center justify-between text-xs">
						<span className="text-muted-foreground">Last transaction</span>
						<span className="font-medium">
							{formatDate(account.latestTransactionTimestamp)}
						</span>
					</div>
				)}
			</CardFooter>
		</Card>
	);
}
