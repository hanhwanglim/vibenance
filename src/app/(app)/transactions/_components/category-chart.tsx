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
import { Pie, PieChart, Label } from "recharts";
import { Transaction } from "./columns";
import { formatCurrency } from "@/lib/formatter";
import { useMemo } from "react";

type CategoryChartProps = {
  transactions: Transaction[];
};

const chartConfig = {
  category: {
    label: "Category",
  },
  amount: {
    label: "Amount",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

function calculateChartData(transactions: Transaction[]) {
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

  return Object.entries(expensesByCategory)
    .map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100,
      fill: `var(--chart-${(Object.keys(expensesByCategory).indexOf(category) % 5) + 1})`,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function CategoryChart({ transactions }: CategoryChartProps) {
  const chartData = useMemo(
    () => calculateChartData(transactions),
    [transactions],
  );

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

  const primaryCurrency =
    transactions.find((txn) => txn.amount < 0)?.currency || "USD";

  const totalExpenses = chartData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>
          Total expenses: {formatCurrency(totalExpenses, primaryCurrency)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="category"
              innerRadius={80}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {formatCurrency(totalExpenses, primaryCurrency)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total Expenses
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
