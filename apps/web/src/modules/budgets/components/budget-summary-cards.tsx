import { useQuery } from "@tanstack/react-query";
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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { DateRange } from "@/types";
import { formatCurrency } from "@/utils/formatting";
import { orpc } from "@/utils/orpc";

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

export function BudgetSummaryCards({ dateRange }: { dateRange: DateRange }) {
	const { data: summary, isLoading } = useQuery(
		orpc.budget.summary.queryOptions({ input: { dateRange } }),
	);

	const cardsData: StatCardData[] = [
		{
			label: "Total Budgeted",
			value: summary?.totalBudgeted || 0,
			currency: "GBP",
			relativeChange: calculateRelativeChange(
				summary?.prevTotalBudgeted || 0,
				summary?.totalBudgeted || 0,
			),
			negativeIsGood: false,
			footer: "Compared to last period",
			subfooter: `${summary?.activeBudgetsCount || 0} active ${(summary?.activeBudgetsCount || 0) === 1 ? "budget" : "budgets"}`,
		},
		{
			label: "Total Spent",
			value: summary?.totalSpent || 0,
			currency: "GBP",
			relativeChange: calculateRelativeChange(
				summary?.prevTotalSpent || 0,
				summary?.totalSpent || 0,
			),
			negativeIsGood: true,
			footer: "Compared to last period",
			subfooter: "Across all categories",
		},
		{
			label: "Remaining",
			value: summary?.remaining || 0,
			currency: "GBP",
			relativeChange: calculateRelativeChange(
				summary?.prevRemaining || 0,
				summary?.remaining || 0,
			),
			negativeIsGood: true,
			footer: "Available to spend",
			subfooter:
				(summary?.remaining || 0) >= 0 ? "On track with budget" : "Over budget",
		},
		{
			label: "Utilization",
			value: summary?.utilization || 0,
			relativeChange: calculateRelativeChange(
				summary?.prevUtilization || 0,
				summary?.utilization || 0,
			),
			negativeIsGood: true,
			footer: "Budget usage",
			subfooter: `${(summary?.utilization || 0).toFixed(1)}% of budget used`,
		},
	];

	if (isLoading) {
		return (
			<div className="grid @5xl/main:grid-cols-4 @xl/main:grid-cols-2 grid-cols-1 gap-4 px-4 lg:px-6">
				{cardsData.map((data) => (
					<StatCardSkeleton key={`stat-card-skeleton-${data.label}`} />
				))}
			</div>
		);
	}

	return (
		<div className="grid @5xl/main:grid-cols-4 @xl/main:grid-cols-2 grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 dark:*:data-[slot=card]:bg-card">
			{cardsData.map((cardData) => {
				return <StatCard key={`summary-${cardData.label}`} stats={cardData} />;
			})}
		</div>
	);
}

function StatCardSkeleton() {
	return (
		<Card className="@container/card">
			<CardHeader>
				<Skeleton className="h-4 w-24" />
				<Skeleton className="mt-2 h-8 w-32" />
			</CardHeader>
		</Card>
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
