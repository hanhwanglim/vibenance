"use client";

import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";
import { useMemo } from "react";
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
import { orpc } from "@/utils/orpc";

const _formatter = new Intl.DateTimeFormat("en", { month: "short" });

export function CategoryTrendChart() {
	const now = new Date();
	const currentYearStart = new Date(now.getFullYear(), 5, 1);
	const currentYearEnd = new Date(now.getFullYear(), 11, 31);

	const { data, isLoading } = useQuery(
		orpc.transaction.categoryTrend.queryOptions({
			input: {
				startDate: currentYearStart,
				endDate: currentYearEnd,
			},
		}),
	);

	const chartConfig = useMemo(() => {
		if (!data?.categories) return {} satisfies ChartConfig;

		const config: ChartConfig = {};
		data.categories.forEach((category) => {
			const categoryName = category.category || "Others";
			config[`prev_${categoryName}`] = {
				label: `Previous ${categoryName}`,
			};
			config[`curr_${categoryName}`] = {
				label: `Current ${categoryName}`,
			};
		});
		return config;
	}, [data?.categories]);

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
		<Card>
			<CardHeader>
				<CardTitle>Category Spending Trends</CardTitle>
				<CardDescription>
					Comparing current and previous period spending by category
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig}>
					<BarChart accessibilityLayer data={data?.data}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="bin"
							tickLine={false}
							tickMargin={10}
							axisLine={false}
							tickFormatter={(value) => value}
						/>
						<YAxis tickLine={false} axisLine={false} tickMargin={8} />
						<ChartTooltip
							shared={false}
							cursor={false}
							content={<ChartTooltipContent indicator="dot" />}
						/>
						{data?.categories.map((category, index) => {
							const categoryName = category.category || "Others";
							return (
								<Bar
									key={`prev-${categoryName}`}
									dataKey={`prev_${categoryName}`}
									radius={4}
									stackId="a"
									fill={`var(--chart-${(index % 5) + 1})`}
								/>
							);
						})}
						{data?.categories.map((category, index) => {
							const categoryName = category.category || "Others";
							return (
								<Bar
									key={`curr-${categoryName}`}
									dataKey={`curr_${categoryName}`}
									radius={4}
									stackId="b"
									fill={`var(--chart-${(index % 5) + 1})`}
								/>
							);
						})}
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
