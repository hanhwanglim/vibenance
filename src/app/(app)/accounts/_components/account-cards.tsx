"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatter";
import { Pencil, Trash2, Wallet } from "lucide-react";
import { AccountWithStats } from "./summary-cards";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ACCOUNT_TYPE_LABELS: Record<AccountWithStats["type"], string> = {
  savings: "Savings",
  current: "Current",
  checking: "Checking",
  credit_card: "Credit Card",
  investment: "Investment",
  loan: "Loan",
  other: "Other",
};

const ACCOUNT_TYPE_ORDER: AccountWithStats["type"][] = [
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

type AccountCardsProps = {
  accounts: AccountWithStats[];
  onRefresh: () => void;
  onEdit: (account: AccountWithStats) => void;
};

export function AccountCards({
  accounts,
  onRefresh,
  onEdit,
}: AccountCardsProps) {
  const handleDelete = async (account: AccountWithStats) => {
    if (
      !confirm(
        `Are you sure you want to delete "${account.name}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/accounts/${account.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete account");
      }

      toast.success("Account deleted successfully");
      onRefresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to delete account";
      toast.error(message);
    }
  };

  // Group accounts by type
  const groupedAccounts = accounts.reduce(
    (acc, account) => {
      if (!acc[account.type]) {
        acc[account.type] = [];
      }
      acc[account.type].push(account);
      return acc;
    },
    {} as Record<AccountWithStats["type"], AccountWithStats[]>,
  );

  // Get ordered types that have accounts
  const orderedTypes = ACCOUNT_TYPE_ORDER.filter(
    (type) => groupedAccounts[type] && groupedAccounts[type].length > 0,
  );

  if (accounts.length === 0) {
    return (
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader className="text-center py-12">
            <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>No accounts yet</CardTitle>
            <CardDescription>
              Create your first account to start tracking transactions
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const renderAccountCard = (account: AccountWithStats) => (
    <Card
      key={account.id}
      className={cn(
        "flex flex-col",
        account.color && COLOR_CLASSES[account.color]
          ? `${COLOR_CLASSES[account.color]} border-l-4`
          : "",
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{account.name}</CardTitle>
              <Badge variant="outline" className="text-xs">
                {ACCOUNT_TYPE_LABELS[account.type]}
              </Badge>
            </div>
            {account.bankName && (
              <CardDescription className="text-xs">
                {account.bankName}
              </CardDescription>
            )}
            {account.accountNumber && (
              <CardDescription className="text-xs text-muted-foreground">
                Account: {account.accountNumber}
              </CardDescription>
            )}
            {!account.bankName && !account.accountNumber && (
              <CardDescription className="mt-1 text-xs">
                Created {new Date(account.createdAt).toLocaleDateString()}
              </CardDescription>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(account)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => handleDelete(account)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardFooter className="flex flex-col items-start gap-2 mt-auto pt-0">
        <div className="flex items-center gap-2 w-full">
          <span className="text-sm text-muted-foreground">Balance:</span>
          <span className="text-lg font-semibold">
            {formatCurrency(account.totalBalance, "USD")}
          </span>
        </div>
        <div className="flex items-center gap-2 w-full">
          <span className="text-sm text-muted-foreground">Transactions:</span>
          <Badge variant="secondary">{account.transactionCount}</Badge>
        </div>
        {account.lastTransactionDate && (
          <div className="flex items-center gap-2 w-full">
            <span className="text-sm text-muted-foreground">
              Last transaction:
            </span>
            <span className="text-sm">
              {new Date(account.lastTransactionDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </CardFooter>
    </Card>
  );

  return (
    <div className="px-4 lg:px-6 space-y-8">
      {orderedTypes.map((type) => (
        <div key={type} className="space-y-4">
          <h2 className="text-xl font-semibold">{ACCOUNT_TYPE_LABELS[type]}</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groupedAccounts[type].map(renderAccountCard)}
          </div>
        </div>
      ))}
    </div>
  );
}
