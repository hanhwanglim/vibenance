"use client";

import {
  SectionCards,
  StatCardData,
} from "@/app/(app)/(dashboard)/_components/section-cards";

export type AccountWithStats = {
  id: string;
  name: string;
  type:
    | "savings"
    | "current"
    | "checking"
    | "credit_card"
    | "investment"
    | "loan"
    | "other";
  accountNumber: string | null;
  bankName: string | null;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
  transactionCount: number;
  totalBalance: number;
  lastTransactionDate: Date | null;
};

type SummaryCardsProps = {
  accounts: AccountWithStats[];
};

export function SummaryCards({ accounts }: SummaryCardsProps) {
  const totalAccounts = accounts.length;
  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.totalBalance,
    0,
  );
  const totalTransactions = accounts.reduce(
    (sum, account) => sum + account.transactionCount,
    0,
  );

  // Get the most common currency (default to USD for now)
  // TODO: Get actual currency from transactions when available
  const primaryCurrency = "USD";

  const cardsData: StatCardData[] = [
    {
      label: "Total Accounts",
      value: totalAccounts,
    },
    {
      label: "Total Balance",
      value: totalBalance,
      currency: primaryCurrency,
    },
    {
      label: "Total Transactions",
      value: totalTransactions,
    },
  ];

  return <SectionCards data={cardsData} />;
}
