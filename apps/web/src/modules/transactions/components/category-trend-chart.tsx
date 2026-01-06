"use client";

import { useQuery } from "@tanstack/react-query";
import type { DateRange } from "react-day-picker";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
	category: {
		label: "Category",
	},
	sum: {
		label: "Expenses",
	},
} satisfies ChartConfig;

export function CategoryTrendChart({ dateRange }: { dateRange?: DateRange }) {
	const { data, isLoading } = useQuery(
		orpc.transaction.spendingTrendByCategory.queryOptions({
			input: { dateRange: dateRange },
		}),
	);

	const formatter = new Intl.DateTimeFormat(
		"en",
		data?.format as Intl.DateTimeFormatOptions | undefined,
	);

	if (isLoading || data?.data.length === 0) {
		return null;
	}

	return (
		<ChartContainer config={chartConfig}>
			<BarChart accessibilityLayer data={data?.data}>
				<CartesianGrid vertical={false} />
				<XAxis
					dataKey="bin"
					tickLine={false}
					tickMargin={10}
					axisLine={false}
					tickFormatter={(value: string) => formatter.format(new Date(value))}
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
	);
}
