"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Transaction } from "./columns";

type IncomeExpensesChartProps = {
  transactions: Transaction[];
};

const chartConfig = {
  income: {
    label: "Income",
    color: "var(--chart-4)",
  },
  expenses: {
    label: "Expenses",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function IncomeExpensesChart({
  transactions,
}: IncomeExpensesChartProps) {
  // Flatten all transactions
  const allTransactions = transactions.flatMap((txn) => {
    const result = [txn];
    if (txn.subTransactions) {
      result.push(...txn.subTransactions);
    }
    return result;
  });

  // Separate income and expenses
  const income = allTransactions.filter((txn) => txn.amount > 0);
  const expenses = allTransactions.filter((txn) => txn.amount < 0);

  if (income.length === 0 && expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Income vs Expenses</CardTitle>
          <CardDescription>No transaction data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Group income by date (daily)
  const incomeByDate = income.reduce(
    (acc, txn) => {
      const date = new Date(txn.timestamp);
      const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD format
      if (!acc[dateKey]) {
        acc[dateKey] = 0;
      }
      acc[dateKey] += txn.amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Group expenses by date (daily)
  const expensesByDate = expenses.reduce(
    (acc, txn) => {
      const date = new Date(txn.timestamp);
      const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD format
      if (!acc[dateKey]) {
        acc[dateKey] = 0;
      }
      acc[dateKey] += Math.abs(txn.amount);
      return acc;
    },
    {} as Record<string, number>,
  );

  // Get all unique dates
  const allDates = new Set([
    ...Object.keys(incomeByDate),
    ...Object.keys(expensesByDate),
  ]);

  // Convert to chart data and sort by date
  const chartData = Array.from(allDates)
    .map((date) => ({
      date,
      income: Math.round((incomeByDate[date] || 0) * 100) / 100,
      expenses: Math.round((expensesByDate[date] || 0) * 100) / 100,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income vs Expenses</CardTitle>
        <CardDescription>Daily income and expense comparison</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="income"
              type="natural"
              fill="var(--chart-4)"
              stroke="var(--chart-4)"
            />
            <Area
              dataKey="expenses"
              type="natural"
              fill="var(--chart-1)"
              stroke="var(--chart-1)"
              clipPath="url(#clipIncomeExpenses)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
