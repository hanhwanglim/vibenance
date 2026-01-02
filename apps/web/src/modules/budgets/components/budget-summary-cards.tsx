import { TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DateRange } from "@/types";
import { formatCurrency } from "@/utils/formatting";

type StatCardData = {
	label: string;
	value: number;
	currency?: string;
	relativeChange?: number;
	negativeIsGood?: boolean;
	footer?: string;
	subfooter?: string;
};

function calculateRelativeChange(before: number, after: number) {
	return ((after - before) / Math.max(Math.abs(before), 1)) * 100;
}

// Fake data generator
function getFakeBudgetSummary(_dateRange: DateRange | undefined) {
	// Simulate some realistic budget data
	const totalBudgeted = 3500;
	const totalSpent = 2850;
	const remaining = totalBudgeted - totalSpent;
	const utilization = (totalSpent / totalBudgeted) * 100;

	// Previous period values for comparison
	const prevTotalBudgeted = 3200;
	const prevTotalSpent = 3100;
	const prevRemaining = prevTotalBudgeted - prevTotalSpent;
	const prevUtilization = (prevTotalSpent / prevTotalBudgeted) * 100;

	return {
		totalBudgeted,
		totalSpent,
		remaining,
		utilization,
		prevTotalBudgeted,
		prevTotalSpent,
		prevRemaining,
		prevUtilization,
	};
}

export function BudgetSummaryCards({
	dateRange,
}: {
	dateRange: DateRange | undefined;
}) {
	const summary = getFakeBudgetSummary(dateRange);

	const cardsData: StatCardData[] = [
		{
			label: "Total Budgeted",
			value: summary.totalBudgeted,
			currency: "GBP",
			relativeChange: calculateRelativeChange(
				summary.prevTotalBudgeted,
				summary.totalBudgeted,
			),
			negativeIsGood: false,
			footer: "Compared to last period",
			subfooter: "7 active budgets",
		},
		{
			label: "Total Spent",
			value: summary.totalSpent,
			currency: "GBP",
			relativeChange: calculateRelativeChange(
				summary.prevTotalSpent,
				summary.totalSpent,
			),
			negativeIsGood: true,
			footer: "Compared to last period",
			subfooter: "Across all categories",
		},
		{
			label: "Remaining",
			value: summary.remaining,
			currency: "GBP",
			relativeChange: calculateRelativeChange(
				summary.prevRemaining,
				summary.remaining,
			),
			negativeIsGood: true,
			footer: "Available to spend",
			subfooter:
				summary.remaining >= 0 ? "On track with budget" : "Over budget",
		},
		{
			label: "Utilization",
			value: summary.utilization,
			relativeChange: calculateRelativeChange(
				summary.prevUtilization,
				summary.utilization,
			),
			negativeIsGood: true,
			footer: "Budget usage",
			subfooter: `${summary.utilization.toFixed(1)}% of budget used`,
		},
	];

	return (
		<div className="grid @5xl/main:grid-cols-4 @xl/main:grid-cols-2 grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 dark:*:data-[slot=card]:bg-card">
			{cardsData.map((cardData) => {
				return <StatCard key={`summary-${cardData.label}`} stats={cardData} />;
			})}
		</div>
	);
}

function StatCard({
	className,
	stats,
}: {
	className?: string;
	stats: StatCardData;
}) {
	const isPositive = Number(stats.relativeChange) >= 0 || !stats.negativeIsGood;
	const value = stats.currency
		? formatCurrency(stats.value, stats.currency)
		: `${stats.value.toFixed(1)}%`;
	const TrendIcon =
		Number(stats.relativeChange) >= 0 ? TrendingUp : TrendingDown;

	return (
		<Card className={cn("@container/card", className)}>
			<CardHeader>
				<CardDescription>{stats.label}</CardDescription>
				<CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
					{value}
				</CardTitle>
				<CardAction>
					<Badge
						variant="outline"
						className={cn(
							"gap-1",
							isPositive
								? "border-green-500/50 text-green-700 dark:text-green-400"
								: "border-red-500/50 text-red-700 dark:text-red-400",
						)}
					>
						<TrendIcon className="h-3 w-3" />
						{stats.relativeChange?.toFixed(1)}%
					</Badge>
				</CardAction>
			</CardHeader>
			<CardFooter className="flex-col items-start gap-1.5 text-sm">
				<div className="line-clamp-1 flex gap-2 font-medium">
					{stats.footer}
					<TrendIcon
						className={cn(
							"size-4",
							isPositive
								? "text-green-600 dark:text-green-400"
								: "text-red-600 dark:text-red-400",
						)}
					/>
				</div>
				<div className="text-muted-foreground">{stats.subfooter}</div>
			</CardFooter>
		</Card>
	);
}
