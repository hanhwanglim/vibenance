import { useQuery } from "@tanstack/react-query";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { DateRange } from "react-day-picker";
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
import { formatCurrency } from "@/utils/formatting";
import { orpc } from "@/utils/orpc";

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
			value: summary?.totalIncome,
			currency: "GBP",
		},
		{
			label: "Total Expenses",
			value: summary?.totalExpenses,
			currency: "GBP",
		},
		{
			label: "Net Amount",
			value: Number(summary?.totalIncome) + Number(summary?.totalExpenses),
			currency: "GBP",
		},
		{
			label: "Transactions",
			value: summary?.count,
		},
	];

	if (isLoading) {
		return (
			<div className="grid @5xl/main:grid-cols-4 @xl/main:grid-cols-2 grid-cols-1 gap-4 px-4 lg:px-6">
				{cardsData.map((_) => (
					<StatCardSkeleton key={`stat-card-skeleton-${crypto.randomUUID()}`} />
				))}
			</div>
		);
	}

	return (
		<div className="grid @5xl/main:grid-cols-4 @xl/main:grid-cols-2 grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 dark:*:data-[slot=card]:bg-card">
			{cardsData.map((cardData) => {
				const value = cardData.currency
					? formatCurrency(Number(cardData.value), cardData.currency)
					: cardData.value;
				return (
					<StatCard
						key={`summary-${crypto.randomUUID()}`}
						label={cardData.label}
						value={value}
					/>
				);
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

function StatCard({ className, label, value, isPositive }) {
	const TrendIcon = isPositive ? TrendingUp : TrendingDown;

	return (
		<Card className={cn("@container/card", className)}>
			<CardHeader>
				<CardDescription>{label}</CardDescription>
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
						123123
					</Badge>
				</CardAction>
			</CardHeader>
			<CardFooter className="flex-col items-start gap-1.5 text-sm">
				<div className="line-clamp-1 flex gap-2 font-medium">
					asdkfjasdfjh
					<TrendIcon
						className={cn(
							"size-4",
							isPositive
								? "text-green-600 dark:text-green-400"
								: "text-red-600 dark:text-red-400",
						)}
					/>
				</div>
				<div className="text-muted-foreground">asdfasdfh</div>
			</CardFooter>
		</Card>
	);
}
