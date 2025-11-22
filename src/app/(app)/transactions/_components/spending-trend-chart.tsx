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
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Transaction } from "./columns";

type SpendingTrendChartProps = {
  transactions: Transaction[];
};

const chartConfig = {
  expenses: {
    label: "Expenses",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function SpendingTrendChart({ transactions }: SpendingTrendChartProps) {
  // Flatten all transactions
  const allTransactions = transactions.flatMap((txn) => {
    const result = [txn];
    if (txn.subTransactions) {
      result.push(...txn.subTransactions);
    }
    return result;
  });

  // Filter for expenses only
  const expenses = allTransactions.filter((txn) => txn.amount < 0);

  if (expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Trend</CardTitle>
          <CardDescription>No expense data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

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

  // Convert to chart data and sort by date
  const chartData = Object.entries(expensesByDate)
    .map(([date, amount]) => ({
      date,
      expenses: Math.round(amount * 100) / 100,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Trend</CardTitle>
        <CardDescription>Daily expense trends over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="expenses" fill="var(--chart-1)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
