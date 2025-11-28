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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/formatter";
import { useMemo } from "react";

const chartConfig = {
  balance: {
    label: "Balance",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

// Mock data for individual accounts
const mockAccounts = [
  { name: "Chase Savings", balance: 25000, type: "savings" },
  { name: "Monzo Checking", balance: 8500, type: "checking" },
  { name: "Barclays Current", balance: 3200, type: "current" },
  { name: "Investment Portfolio", balance: 45000, type: "investment" },
  { name: "Amex Credit Card", balance: -2300, type: "credit_card" },
  { name: "Student Loan", balance: -15000, type: "loan" },
];

export function BalanceDistributionChart() {
  const chartData = useMemo(() => {
    // Sort by balance (largest to smallest)
    return [...mockAccounts]
      .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
      .map((account, index) => ({
        name: account.name,
        balance: account.balance,
        fill: `var(--chart-${(index % 5) + 1})`,
      }));
  }, []);

  const primaryCurrency = "USD";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance Distribution</CardTitle>
        <CardDescription>Individual account balances</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => formatCurrency(value, primaryCurrency)}
            />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={120}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="balance"
              fill="var(--chart-1)"
              radius={[0, 8, 8, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
