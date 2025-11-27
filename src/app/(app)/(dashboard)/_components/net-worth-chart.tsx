"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/lib/formatter";
import {
  Card,
  CardAction,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const description = "An interactive net worth chart";

// Generate realistic net worth data showing gradual growth with fluctuations
const chartData = [
  { date: "2024-04-01", netWorth: 85234.5 },
  { date: "2024-04-02", netWorth: 85321.75 },
  { date: "2024-04-03", netWorth: 85189.25 },
  { date: "2024-04-04", netWorth: 85467.0 },
  { date: "2024-04-05", netWorth: 85678.5 },
  { date: "2024-04-06", netWorth: 85890.25 },
  { date: "2024-04-07", netWorth: 85745.75 },
  { date: "2024-04-08", netWorth: 86012.0 },
  { date: "2024-04-09", netWorth: 85834.5 },
  { date: "2024-04-10", netWorth: 85967.25 },
  { date: "2024-04-11", netWorth: 86234.75 },
  { date: "2024-04-12", netWorth: 86123.5 },
  { date: "2024-04-13", netWorth: 86345.0 },
  { date: "2024-04-14", netWorth: 86189.75 },
  { date: "2024-04-15", netWorth: 86045.25 },
  { date: "2024-04-16", netWorth: 86178.5 },
  { date: "2024-04-17", netWorth: 86456.0 },
  { date: "2024-04-18", netWorth: 86678.75 },
  { date: "2024-04-19", netWorth: 86534.25 },
  { date: "2024-04-20", netWorth: 86321.5 },
  { date: "2024-04-21", netWorth: 86467.75 },
  { date: "2024-04-22", netWorth: 86789.0 },
  { date: "2024-04-23", netWorth: 86645.25 },
  { date: "2024-04-24", netWorth: 86890.5 },
  { date: "2024-04-25", netWorth: 86756.75 },
  { date: "2024-04-26", netWorth: 86534.0 },
  { date: "2024-04-27", netWorth: 86812.25 },
  { date: "2024-04-28", netWorth: 86678.5 },
  { date: "2024-04-29", netWorth: 86945.75 },
  { date: "2024-04-30", netWorth: 87123.0 },
  { date: "2024-05-01", netWorth: 86989.25 },
  { date: "2024-05-02", netWorth: 87234.5 },
  { date: "2024-05-03", netWorth: 87112.75 },
  { date: "2024-05-04", netWorth: 87345.0 },
  { date: "2024-05-05", netWorth: 87567.25 },
  { date: "2024-05-06", netWorth: 87789.5 },
  { date: "2024-05-07", netWorth: 87645.75 },
  { date: "2024-05-08", netWorth: 87423.0 },
  { date: "2024-05-09", netWorth: 87567.25 },
  { date: "2024-05-10", netWorth: 87834.5 },
  { date: "2024-05-11", netWorth: 87956.75 },
  { date: "2024-05-12", netWorth: 87789.0 },
  { date: "2024-05-13", netWorth: 87645.25 },
  { date: "2024-05-14", netWorth: 87912.5 },
  { date: "2024-05-15", netWorth: 88134.75 },
  { date: "2024-05-16", netWorth: 87989.0 },
  { date: "2024-05-17", netWorth: 88245.25 },
  { date: "2024-05-18", netWorth: 88123.5 },
  { date: "2024-05-19", netWorth: 87967.75 },
  { date: "2024-05-20", netWorth: 87834.0 },
  { date: "2024-05-21", netWorth: 87678.25 },
  { date: "2024-05-22", netWorth: 87545.5 },
  { date: "2024-05-23", netWorth: 87789.75 },
  { date: "2024-05-24", netWorth: 87912.0 },
  { date: "2024-05-25", netWorth: 87756.25 },
  { date: "2024-05-26", netWorth: 87823.5 },
  { date: "2024-05-27", netWorth: 88067.75 },
  { date: "2024-05-28", netWorth: 87945.0 },
  { date: "2024-05-29", netWorth: 87789.25 },
  { date: "2024-05-30", netWorth: 88034.5 },
  { date: "2024-05-31", netWorth: 87867.75 },
  { date: "2024-06-01", netWorth: 87923.0 },
  { date: "2024-06-02", netWorth: 88167.25 },
  { date: "2024-06-03", netWorth: 87989.5 },
  { date: "2024-06-04", netWorth: 88245.75 },
  { date: "2024-06-05", netWorth: 88078.0 },
  { date: "2024-06-06", netWorth: 87934.25 },
  { date: "2024-06-07", netWorth: 88167.5 },
  { date: "2024-06-08", netWorth: 88345.75 },
  { date: "2024-06-09", netWorth: 88567.0 },
  { date: "2024-06-10", netWorth: 88389.25 },
  { date: "2024-06-11", netWorth: 88234.5 },
  { date: "2024-06-12", netWorth: 88478.75 },
  { date: "2024-06-13", netWorth: 88245.0 },
  { date: "2024-06-14", netWorth: 88467.25 },
  { date: "2024-06-15", netWorth: 88312.5 },
  { date: "2024-06-16", netWorth: 88445.75 },
  { date: "2024-06-17", netWorth: 88678.0 },
  { date: "2024-06-18", netWorth: 88423.25 },
  { date: "2024-06-19", netWorth: 88567.5 },
  { date: "2024-06-20", netWorth: 88789.75 },
  { date: "2024-06-21", netWorth: 88645.0 },
  { date: "2024-06-22", netWorth: 88489.25 },
  { date: "2024-06-23", netWorth: 88734.5 },
  { date: "2024-06-24", netWorth: 88578.75 },
  { date: "2024-06-25", netWorth: 88623.0 },
  { date: "2024-06-26", netWorth: 88867.25 },
  { date: "2024-06-27", netWorth: 88989.5 },
  { date: "2024-06-28", netWorth: 88845.75 },
  { date: "2024-06-29", netWorth: 88678.0 },
  { date: "2024-06-30", netWorth: 91238.28 },
];

const chartConfig = {
  netWorth: {
    label: "Net Worth",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  // Calculate Y-axis domain based on filtered data for better readability
  const yAxisDomain = React.useMemo(() => {
    if (filteredData.length === 0) return [0, 100000];

    const values = filteredData.map((item) => item.netWorth);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    const padding = range * 0.1;
    return [min - padding, max + padding];
  }, [filteredData]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Net Worth</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total for the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillNetWorth" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-netWorth)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-netWorth)"
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
              domain={yAxisDomain}
              tickFormatter={(value) => {
                if (value >= 1000) {
                  return `$${(value / 1000).toFixed(0)}K`;
                }
                return formatCurrency(value);
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
                  formatter={(value) => formatCurrency(Number(value))}
                />
              }
            />
            <Area
              dataKey="netWorth"
              type="natural"
              fill="url(#fillNetWorth)"
              stroke="var(--color-netWorth)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
