"use client";

import { useQuery } from "@tanstack/react-query";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import type { DateRange } from "@/types";
import { orpc } from "@/utils/orpc";

const chartConfig = {
	bin: {
		label: "Date",
	},
	sum: {
		label: "Expenses",
	},
} satisfies ChartConfig;

export function SpendingTrendChart({
	dateRange,
}: {
	dateRange: DateRange | undefined;
}) {
	const { data: spendingTrend, isLoading } = useQuery(
		orpc.transaction.spendingTrend.queryOptions({
			input: { dateRange: dateRange },
		}),
	);

	const formatter = new Intl.DateTimeFormat(
		"en",
		spendingTrend?.format as Intl.DateTimeFormatOptions | undefined,
	);

	const chartData = spendingTrend?.data.map((point) => {
		return {
			bin: new Date(point.bin as string),
			sum: -Number(point.sum),
		};
	});

	if (spendingTrend?.data.length === 0 || isLoading) {
		return null;
	}

	return (
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
					type="linear"
					stroke="var(--chart-1)"
					strokeWidth={2}
					dot={false}
				/>
			</LineChart>
		</ChartContainer>
	);
}
