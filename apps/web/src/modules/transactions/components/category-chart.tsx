"use client";

import { useQuery } from "@tanstack/react-query";
import type { DateRange } from "react-day-picker";
import { Label, Pie, PieChart } from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
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
import { formatCurrency } from "@/utils/formatting";
import { orpc } from "@/utils/orpc";

const chartConfig = {
	category: {
		label: "Category",
	},
} satisfies ChartConfig;

export function CategoryChart({
	className,
	dateRange,
}: {
	className?: string;
	dateRange?: DateRange;
}) {
	const { data: categoryBreakdown, isLoading } = useQuery(
		orpc.transaction.categoryBreakdown.queryOptions({
			input: { dateRange: dateRange },
		}),
	);

	if (!categoryBreakdown?.categories || isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Spending by Category</CardTitle>
					<CardDescription>No expense data available</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card className={cn("h-full", className)}>
			<CardHeader className="items-center pb-0">
				<CardTitle>Spending by Category</CardTitle>
				<CardDescription>
					Total expenses:&nbsp;
					{formatCurrency(Number(categoryBreakdown?.sum || 0), "GBP")}
				</CardDescription>
			</CardHeader>
			<CardContent className="flex-1 pb-0">
				<ChartContainer
					config={chartConfig}
					className="mx-auto aspect-square max-h-[400px]"
				>
					<PieChart>
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent hideLabel />}
						/>
						<Pie
							data={categoryBreakdown?.categories || []}
							dataKey="sum"
							nameKey="category"
							innerRadius={100}
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
													className="fill-foreground font-bold text-3xl"
												>
													{formatCurrency(
														Number(categoryBreakdown?.sum || 0),
														"GBP",
													)}
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
