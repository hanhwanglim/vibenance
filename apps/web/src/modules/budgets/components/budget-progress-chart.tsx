"use client";

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

const chartConfig = {
	category: {
		label: "Category",
	},
	budgeted: {
		label: "Budgeted",
		color: "hsl(var(--chart-2))",
	},
	spent: {
		label: "Spent",
		color: "hsl(var(--chart-1))",
	},
} satisfies ChartConfig;

// Fake data generator
function getFakeBudgetProgress(_dateRange: DateRange | undefined) {
	return [
		{ category: "Groceries", budgeted: 500, spent: 420 },
		{ category: "Eating Out", budgeted: 200, spent: 185 },
		{ category: "Transport", budgeted: 300, spent: 320 },
		{ category: "Entertainment", budgeted: 150, spent: 95 },
		{ category: "Bills", budgeted: 800, spent: 780 },
		{ category: "Shopping", budgeted: 400, spent: 450 },
		{ category: "Savings", budgeted: 1150, spent: 600 },
	];
}

export function BudgetProgressChart({
	className,
	dateRange,
}: {
	className?: string;
	dateRange?: DateRange;
}) {
	const data = getFakeBudgetProgress(dateRange);

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
						<Bar
							dataKey="budgeted"
							fill="var(--color-budgeted)"
							radius={[4, 4, 0, 0]}
						/>
						<Bar
							dataKey="spent"
							fill="var(--color-spent)"
							radius={[4, 4, 0, 0]}
						/>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
