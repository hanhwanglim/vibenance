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
  // Get the most common currency (default to USD for now)
  // TODO: Get actual currency from transactions when available
  const primaryCurrency = "USD";

  // Calculate Total Net Cash (savings + current + checking)
  const totalNetCash = accounts
    .filter(
      (account) =>
        account.type === "savings" ||
        account.type === "current" ||
        account.type === "checking",
    )
    .reduce((sum, account) => sum + account.totalBalance, 0);

  // Calculate Total Liability (credit_card + loan, absolute value)
  const totalLiability = Math.abs(
    accounts
      .filter(
        (account) => account.type === "credit_card" || account.type === "loan",
      )
      .reduce((sum, account) => sum + account.totalBalance, 0),
  );

  // Calculate Total Balance (sum of all accounts)
  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.totalBalance,
    0,
  );

  // Calculate Saving/Investment Rate (percentage of savings + investment / total balance)
  const savingInvestmentBalance = accounts
    .filter(
      (account) => account.type === "savings" || account.type === "investment",
    )
    .reduce((sum, account) => sum + account.totalBalance, 0);

  const savingInvestmentRate =
    totalBalance !== 0 ? (savingInvestmentBalance / totalBalance) * 100 : 0;

  const cardsData: StatCardData[] = [
    {
      label: "Total Net Cash",
      value: totalNetCash,
      currency: primaryCurrency,
    },
    {
      label: "Total Liability",
      value: totalLiability,
      currency: primaryCurrency,
    },
    {
      label: "Saving/Investment Rate",
      value: Math.round(savingInvestmentRate * 10) / 10, // Round to 1 decimal place
      // Note: Display will show as number, percentage implied by label
    },
    {
      label: "Total Balance",
      value: totalBalance,
      currency: primaryCurrency,
    },
  ];

  return <SectionCards data={cardsData} />;
}
