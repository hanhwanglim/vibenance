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
import { Pie, PieChart, Cell, Legend } from "recharts";
import { Transaction } from "./columns";
import { formatCurrency } from "@/lib/formatter";

type CategoryChartProps = {
  transactions: Transaction[];
};

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const chartConfig = {
  category: {
    label: "Category",
  },
  amount: {
    label: "Amount",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function CategoryChart({ transactions }: CategoryChartProps) {
  // Flatten all transactions
  const allTransactions = transactions.flatMap((txn) => {
    const result = [txn];
    if (txn.subTransactions) {
      result.push(...txn.subTransactions);
    }
    return result;
  });

  // Calculate expenses by category (only negative amounts)
  const expensesByCategory = allTransactions
    .filter((txn) => txn.amount < 0)
    .reduce(
      (acc, txn) => {
        const category = txn.category || "Other";
        acc[category] = (acc[category] || 0) + Math.abs(txn.amount);
        return acc;
      },
      {} as Record<string, number>,
    );

  // Convert to chart data
  const chartData = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100,
      fill: COLORS[
        Object.keys(expensesByCategory).indexOf(category) % COLORS.length
      ],
    }))
    .sort((a, b) => b.amount - a.amount);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>No expense data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Get primary currency
  const primaryCurrency =
    allTransactions.find((txn) => txn.amount < 0)?.currency || "USD";

  const totalExpenses = chartData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>
          Total expenses: {formatCurrency(totalExpenses, primaryCurrency)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <PieChart>
            <ChartTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0];
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-medium">
                            {data.payload?.category}
                          </span>
                          <span className="text-sm font-bold">
                            {formatCurrency(
                              (data.value as number) || 0,
                              primaryCurrency,
                            )}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(
                            (((data.value as number) || 0) / totalExpenses) *
                            100
                          ).toFixed(1)}
                          % of total
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ category, percent }) =>
                `${category} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="amount"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => value}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
