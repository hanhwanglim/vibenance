"use client";

import { useQuery } from "@tanstack/react-query";
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

export function BudgetAllocationChart({ className }: { className?: string }) {
	const { data, isLoading } = useQuery(
		orpc.budget.budgetAllocation.queryOptions(),
	);

	if (isLoading) {
		return (
			<Card className={cn("h-full", className)}>
				<CardHeader className="items-center pb-0">
					<CardTitle>Budget Allocation</CardTitle>
					<CardDescription>Loading budget data...</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	if (data?.length === 0) {
		return (
			<Card className={cn("h-full", className)}>
				<CardHeader className="items-center pb-0">
					<CardTitle>Budget Allocation</CardTitle>
					<CardDescription>
						No budget data available for the selected period
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	const total = data?.reduce((sum, item) => sum + item.amount, 0) ?? 0;

	const chartData =
		data?.map((item, index) => ({
			...item,
			fill: `var(--chart-${(index % 7) + 1})`,
		})) ?? [];

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
