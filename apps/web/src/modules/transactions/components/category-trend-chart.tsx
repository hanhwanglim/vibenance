"use client";

import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

const chartConfig = {
	bin: {
		label: "Date",
	},
	category: {
		label: "Category",
	},
	sum: {
		label: "Expenses",
	},
} satisfies ChartConfig;

export function CategoryTrendChart({
	className,
	dateRange,
}: {
	className?: string;
	dateRange?: DateRange;
}) {
	const { data, isLoading } = useQuery(
		orpc.transaction.spendingTrendByCategory.queryOptions({
			input: { dateRange: dateRange },
		}),
	);

	const formatter = new Intl.DateTimeFormat(
		"en",
		data?.format as Intl.DateTimeFormatOptions | undefined,
	);

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Category Spending Trends</CardTitle>
					<CardDescription>Loading expense data...</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	if (data?.data.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Category Spending Trends</CardTitle>
					<CardDescription>No expense data available</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card className={cn("h-full", className)}>
			<CardHeader>
				<CardTitle>Category Spending Trends</CardTitle>
				<CardDescription>
					Comparing current and previous period spending by category
				</CardDescription>
			</CardHeader>
			<CardContent className="flex-1">
				<ChartContainer config={chartConfig}>
					<BarChart accessibilityLayer data={data?.data}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="bin"
							tickLine={false}
							tickMargin={10}
							axisLine={false}
							tickFormatter={(value: string) =>
								formatter.format(new Date(value))
							}
						/>
						<YAxis tickLine={false} axisLine={false} tickMargin={8} />
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent indicator="dot" />}
						/>
						{data?.categories.map((category, index) => (
							<Bar
								key={category}
								dataKey={category}
								stackId="a"
								fill={`var(--chart-${(index % 7) + 1})`}
							/>
						))}
					</BarChart>
				</ChartContainer>
			</CardContent>
			<CardFooter className="flex-col items-start gap-2 text-sm">
				<div className="flex gap-2 font-medium leading-none">
					Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
				</div>
				<div className="text-muted-foreground leading-none">
					Showing category spending trends for the selected period
				</div>
			</CardFooter>
		</Card>
	);
}
