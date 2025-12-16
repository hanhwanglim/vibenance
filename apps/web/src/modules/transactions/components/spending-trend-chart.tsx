"use client";

import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
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

const chartConfig = {
	bin: {
		label: "Date",
	},
	sum: {
		label: "Expenses",
	},
} satisfies ChartConfig;

const formatter = new Intl.DateTimeFormat("en", { month: "short" });

export function SpendingTrendChart() {
	const { data: spendingTrend } = useQuery(
		orpc.transaction.spendingTrend.queryOptions(),
	);

	if (spendingTrend?.data.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Spending Trend</CardTitle>
					<CardDescription>No expense data available</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	const chartData = spendingTrend?.data.map((point) => {
		return {
			bin: new Date(point.bin as string),
			sum: -Number(point.sum),
		};
	});

	return (
		<Card className="h-full">
			<CardHeader>
				<CardTitle>Spending Trend</CardTitle>
				<CardDescription>Daily expense trends over time</CardDescription>
			</CardHeader>
			<CardContent className="flex-1">
				<ChartContainer config={chartConfig}>
					<LineChart
						accessibilityLayer
						data={chartData}
						margin={{ left: 12, right: 12 }}
					>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="bin"
							tickLine={false}
							tickMargin={10}
							axisLine={false}
							tickFormatter={(value: Date) => formatter.format(value)}
						/>
						<YAxis tickLine={false} axisLine={false} tickMargin={8} />
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent hideLabel />}
						/>
						<Line
							dataKey="sum"
							type="natural"
							stroke="var(--chart-1)"
							strokeWidth={2}
							dot={false}
						/>
					</LineChart>
				</ChartContainer>
			</CardContent>
			<CardFooter className="flex-col items-start gap-2 text-sm">
				<div className="flex gap-2 font-medium leading-none">
					Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
				</div>
				<div className="text-muted-foreground leading-none">
					Showing total visitors for the last 6 months
				</div>
			</CardFooter>
		</Card>
	);
}
