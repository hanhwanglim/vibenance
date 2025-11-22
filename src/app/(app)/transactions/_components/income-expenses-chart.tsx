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
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Transaction } from "./columns";
import { formatCurrency } from "@/lib/formatter";

type IncomeExpensesChartProps = {
  transactions: Transaction[];
};

const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(var(--chart-2))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-1))",
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

  // Get primary currency
  const primaryCurrency =
    allTransactions[0]?.currency ||
    income[0]?.currency ||
    expenses[0]?.currency ||
    "USD";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income vs Expenses</CardTitle>
        <CardDescription>Daily income and expense comparison</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-income)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-income)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-expenses)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-expenses)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                return formatCurrency(value, primaryCurrency);
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                  indicator="dot"
                  formatter={(value, name) => [
                    formatCurrency(Number(value), primaryCurrency),
                    name === "income" ? "Income" : "Expenses",
                  ]}
                />
              }
            />
            <Area
              dataKey="income"
              type="natural"
              fill="url(#fillIncome)"
              stroke="var(--color-income)"
            />
            <Area
              dataKey="expenses"
              type="natural"
              fill="url(#fillExpenses)"
              stroke="var(--color-expenses)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
