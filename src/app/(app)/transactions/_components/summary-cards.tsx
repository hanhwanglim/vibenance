"use client";

import {
  SectionCards,
  StatCardData,
} from "@/app/(app)/dashboard/_components/section-cards";
import { Transaction } from "./columns";

type SummaryCardsProps = {
  transactions: Transaction[];
};

export function SummaryCards({ transactions }: SummaryCardsProps) {
  // Flatten all transactions (including sub-transactions) for calculations
  const allTransactions = transactions.flatMap((txn) => {
    const result = [txn];
    if (txn.subTransactions) {
      result.push(...txn.subTransactions);
    }
    return result;
  });

  // Calculate statistics
  const totalIncome = allTransactions
    .filter((txn) => txn.amount > 0)
    .reduce((sum, txn) => sum + txn.amount, 0);

  const totalExpenses = Math.abs(
    allTransactions
      .filter((txn) => txn.amount < 0)
      .reduce((sum, txn) => sum + txn.amount, 0),
  );

  const netAmount = totalIncome - totalExpenses;
  const transactionCount = allTransactions.length;

  // Get the most common currency (or default to USD)
  const currencyCounts = allTransactions.reduce(
    (acc, txn) => {
      acc[txn.currency] = (acc[txn.currency] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const primaryCurrency =
    Object.entries(currencyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "USD";

  const cardsData: StatCardData[] = [
    {
      label: "Total Income",
      value: totalIncome,
      currency: primaryCurrency,
    },
    {
      label: "Total Expenses",
      value: totalExpenses,
      currency: primaryCurrency,
    },
    {
      label: "Net Amount",
      value: netAmount,
      currency: primaryCurrency,
    },
    {
      label: "Transactions",
      value: transactionCount,
    },
  ];

  return <SectionCards data={cardsData} />;
}
