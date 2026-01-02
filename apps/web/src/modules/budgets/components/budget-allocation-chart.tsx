"use client";

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
import type { DateRange } from "@/types";
import { formatCurrency } from "@/utils/formatting";

const chartConfig = {
	category: {
		label: "Category",
	},
} satisfies ChartConfig;

// Fake data generator
function getFakeBudgetAllocation(_dateRange: DateRange | undefined) {
	return [
		{ category: "Groceries", amount: 500 },
		{ category: "Eating Out", amount: 200 },
		{ category: "Transport", amount: 300 },
		{ category: "Entertainment", amount: 150 },
		{ category: "Bills", amount: 800 },
		{ category: "Shopping", amount: 400 },
		{ category: "Savings", amount: 1150 },
	];
}

export function BudgetAllocationChart({
	className,
	dateRange,
}: {
	className?: string;
	dateRange?: DateRange;
}) {
	const data = getFakeBudgetAllocation(dateRange);
	const total = data.reduce((sum, item) => sum + item.amount, 0);

	const chartData = data.map((item, index) => ({
		...item,
		fill: `var(--chart-${(index % 7) + 1})`,
	}));

	return (
		<Card className={cn("h-full", className)}>
			<CardHeader className="items-center pb-0">
				<CardTitle>Budget Allocation</CardTitle>
				<CardDescription>
					Total budgeted: {formatCurrency(total, "GBP")}
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
							data={chartData}
							dataKey="amount"
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
													className="fill-foreground font-bold text-2xl"
												>
													{formatCurrency(total, "GBP")}
												</tspan>
												<tspan
													x={viewBox.cx}
													y={(viewBox.cy || 0) + 20}
													className="fill-muted-foreground text-sm"
												>
													Total Budget
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
