import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { DatePeriodPicker } from "@/components/date-period-picker";
import { CategoryChart } from "@/modules/transactions/components/category-chart";
import { CategoryTrendChart } from "@/modules/transactions/components/category-trend-chart";
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
		<>
			<DatePeriodPicker dateRange={dateRange} setDateRange={setDateRange} />
			<SummaryCards dateRange={dateRange} />
			<div className="grid @5xl/main:grid-cols-3 grid-cols-1 gap-4 px-4 lg:px-6">
				<SpendingTrendChart className="col-span-2" dateRange={dateRange} />
				<RecentTransactionsTable />
			</div>
			<div className="grid @5xl/main:grid-cols-3 grid-cols-1 gap-4 px-4 lg:px-6">
				<CategoryChart className="col-span-1" dateRange={dateRange} />
				<CategoryTrendChart className="col-span-2" dateRange={dateRange} />
			</div>
		</>
	);
}
