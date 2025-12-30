import { createFileRoute } from "@tanstack/react-router";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { CategoryChart } from "@/modules/transactions/components/category-chart";
import { CategoryTrendChart } from "@/modules/transactions/components/category-trend-chart";
import { RecentTransactionsTable } from "@/modules/transactions/components/recent-transactions";
import { SpendingTrendChart } from "@/modules/transactions/components/spending-trend-chart";
import { SummaryCards } from "@/modules/transactions/components/summary-cards";

export const Route = createFileRoute("/_app/transactions/")({
	component: RouteComponent,
});

function RouteComponent() {
	const [open, setOpen] = useState<boolean>(false);
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

	const now = new Date();

	return (
		<>
			<div className="flex flex-col gap-3">
				<Label htmlFor="date" className="sr-only px-1">
					Select date range
				</Label>
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							id="date"
							className="w-52 justify-between font-normal"
						>
							{dateRange?.from && dateRange?.to
								? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
								: "Select Date"}
							<ChevronDownIcon />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto overflow-hidden p-0" align="start">
						<Calendar
							mode="range"
							defaultMonth={dateRange?.from ?? now}
							selected={dateRange}
							onSelect={setDateRange}
							numberOfMonths={2}
							className="rounded-lg border shadow-sm"
							captionLayout="dropdown"
						/>
					</PopoverContent>
				</Popover>
			</div>
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
