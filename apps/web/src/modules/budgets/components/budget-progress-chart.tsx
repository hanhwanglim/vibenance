"use client";

import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import type { DateRange } from "@/types";
import { formatCurrency } from "@/utils/formatting";
import { orpc } from "@/utils/orpc";

const chartConfig = {
	category: {
		label: "Category",
	},
	budgeted: {
		label: "Budgeted",
	},
	spent: {
		label: "Spent",
	},
} satisfies ChartConfig;

export function BudgetProgressChart({
	className,
	dateRange,
}: {
	className?: string;
	dateRange: DateRange;
}) {
	const { data, isLoading } = useQuery(
		orpc.budget.budgetProcess.queryOptions({ input: { dateRange: dateRange } }),
	);

	if (isLoading) {
		return (
			<Card className={cn("h-full", className)}>
				<CardHeader>
					<CardTitle>Budget vs Actual</CardTitle>
					<CardDescription>Loading budget data...</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	if (data?.length === 0) {
		return (
			<Card className={cn("h-full", className)}>
				<CardHeader>
					<CardTitle>Budget vs Actual</CardTitle>
					<CardDescription>
						No budget data available for the selected period
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card className={cn("h-full", className)}>
			<CardHeader>
				<CardTitle>Budget vs Actual</CardTitle>
				<CardDescription>
					Comparing budgeted amounts with actual spending by category
				</CardDescription>
			</CardHeader>
			<CardContent className="flex-1">
				<ChartContainer config={chartConfig}>
					<BarChart
						accessibilityLayer
						data={data}
						margin={{ left: 12, right: 12 }}
					>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="category"
							tickLine={false}
							tickMargin={10}
							axisLine={false}
						/>
						<YAxis tickLine={false} axisLine={false} tickMargin={8} />
						<ChartTooltip
							cursor={false}
							content={({ active, payload }) => {
								if (active && payload && payload.length) {
									return (
										<div className="rounded-lg border bg-background p-2 shadow-sm">
											<div className="grid gap-2">
												{payload.map((entry) => (
													<div
														key={crypto.randomUUID()}
														className="flex items-center justify-between gap-4"
													>
														<div className="flex items-center gap-2">
															<div
																className="h-2.5 w-2.5 rounded-full"
																style={{
																	backgroundColor: entry.color,
																}}
															/>
															<span className="text-muted-foreground text-sm">
																{entry.name}
															</span>
														</div>
														<span className="font-semibold">
															{formatCurrency(Number(entry.value), "GBP")}
														</span>
													</div>
												))}
											</div>
										</div>
									);
								}
								return null;
							}}
						/>
						<Bar dataKey="spent" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
						<Bar
							dataKey="budgeted"
							fill="var(--chart-2)"
							radius={[4, 4, 0, 0]}
						/>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
