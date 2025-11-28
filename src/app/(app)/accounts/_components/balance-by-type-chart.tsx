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
import { formatCurrency } from "@/lib/formatter";
import { useMemo } from "react";

const chartConfig = {
  type: {
    label: "Account Type",
  },
  balance: {
    label: "Balance",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

// Mock data for account types
const mockData = [
  { type: "Savings", balance: 25000, fill: "var(--chart-1)" },
  { type: "Checking", balance: 8500, fill: "var(--chart-2)" },
  { type: "Current", balance: 3200, fill: "var(--chart-3)" },
  { type: "Investment", balance: 45000, fill: "var(--chart-4)" },
  { type: "Credit Card", balance: 2300, fill: "var(--chart-5)" },
  { type: "Loan", balance: 15000, fill: "var(--chart-1)" },
];

export function BalanceByTypeChart() {
  const chartData = useMemo(() => {
    // Using mock data for now
    return mockData.map((item, index) => ({
      type: item.type,
      balance: item.balance,
      fill: `var(--chart-${(index % 5) + 1})`,
    }));
  }, []);

  const totalBalance = chartData.reduce((sum, item) => sum + item.balance, 0);
  const primaryCurrency = "USD";

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Balance by Account Type</CardTitle>
        <CardDescription>
          Total balance: {formatCurrency(totalBalance, primaryCurrency)}
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
              dataKey="balance"
              nameKey="type"
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
                          {formatCurrency(totalBalance, primaryCurrency)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total Balance
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
