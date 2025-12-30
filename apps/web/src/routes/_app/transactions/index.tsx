import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { DatePeriodPicker } from "@/components/date-period-picker";
import { Button } from "@/components/ui/button";
import { CategoryChart } from "@/modules/transactions/components/category-chart";
import { CategoryTrendChart } from "@/modules/transactions/components/category-trend-chart";
import { ImportDialog } from "@/modules/transactions/components/import-dialog";
import { RecentTransactionsTable } from "@/modules/transactions/components/recent-transactions";
import { SpendingTrendChart } from "@/modules/transactions/components/spending-trend-chart";
import { SummaryCards } from "@/modules/transactions/components/summary-cards";
import { DateTime } from "@/utils/date";

export const Route = createFileRoute("/_app/transactions/")({
	component: RouteComponent,
});

function RouteComponent() {
	const [dateRange, setDateRange] = useState<DateRange | undefined>({
		from: new DateTime().subtract(3, "month"),
		to: new Date(),
	});

	return (
		<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
			<div className="flex items-center justify-between px-4 lg:px-6">
				<DatePeriodPicker dateRange={dateRange} setDateRange={setDateRange} />
				<div className="flex items-center gap-2">
					<Button variant="outline" asChild>
						<Link to="/transactions/all">View All Transactions</Link>
					</Button>
					<ImportDialog />
				</div>
			</div>
			<SummaryCards dateRange={dateRange} />
			<div className="grid @5xl/main:grid-cols-5 grid-cols-1 gap-4 px-4 lg:px-6">
				<SpendingTrendChart className="col-span-3" dateRange={dateRange} />
				<RecentTransactionsTable className="col-span-2" />
			</div>
			<div className="grid @5xl/main:grid-cols-3 grid-cols-1 gap-4 px-4 lg:px-6">
				<CategoryChart className="col-span-1" dateRange={dateRange} />
				<CategoryTrendChart className="col-span-2" dateRange={dateRange} />
			</div>
		</div>
	);
}
