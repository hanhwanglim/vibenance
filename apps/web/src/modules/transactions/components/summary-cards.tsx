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
import { DateTime } from "@/utils/date";
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

function getPeriod(dateRange: DateRange | undefined) {
	if (!dateRange?.period) {
		return "period";
	}

	switch (dateRange.period) {
		case "1d":
			return "yesterday";
		case "1w":
			return "week";
		case "1m":
			return "month";
		case "3m":
			return "three months";
		case "6m":
			return "six months";
		case "1y":
			return "year";
		case "3y":
			return "three years";
		default:
			return "period";
	}
}

function daysBetween(d1: Date, d2: Date) {
	return (d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24);
}

export function SummaryCards({
	dateRange,
}: {
	dateRange: DateRange | undefined;
}) {
	const { data: summary, isLoading } = useQuery(
		orpc.transaction.summary.queryOptions({ input: { dateRange: dateRange } }),
	);

	const cardsData: StatCardData[] = [
		{
			label: "Total Income",
			value: summary?.totalIncome || 0,
			currency: "GBP",
			relativeChange: calculateRelativeChange(
				Number(summary?.prevTotalIncome || 0),
				Number(summary?.totalIncome || 0),
			),
			negativeIsGood: true,
			footer: `Compared to last ${getPeriod(dateRange)}`,
			subfooter: "Salary",
		},
		{
			label: "Total Expenses",
			value: summary?.totalExpenses || 0,
			currency: "GBP",
			relativeChange: calculateRelativeChange(
				Math.abs(Number(summary?.prevTotalExpenses || 0)),
				Math.abs(Number(summary?.totalExpenses || 0)),
			),
			negativeIsGood: false,
			footer: `Compared to last ${getPeriod(dateRange)}`,
			subfooter: "Eating Out, Bills, Groceries",
		},
		{
			label: "Net Amount",
			value: summary?.netAmount || 0,
			currency: "GBP",
			relativeChange: calculateRelativeChange(
				Number(summary?.prevNetAmount || 0),
				Number(summary?.netAmount || 0),
			),
			negativeIsGood: true,
			footer: `Compared to last ${getPeriod(dateRange)}`,
			subfooter:
				(summary?.netAmount || 0) >= 0
					? "Positive cash flow"
					: "Negative cash flow",
		},
		{
			label: "Transactions",
			value: summary?.count || 0,
			relativeChange: calculateRelativeChange(
				Number(summary?.prevCount || 0),
				Number(summary?.count || 0),
			),
			negativeIsGood: false,
			footer: `Compared to last ${getPeriod(dateRange)}`,
			subfooter: `Average ${Math.abs((summary?.count || 0) / daysBetween(dateRange?.from || new Date(), dateRange?.to || new DateTime().add(1, "d"))).toLocaleString()} per day`,
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
		: stats.value;
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
						{stats.relativeChange?.toLocaleString()}%
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
