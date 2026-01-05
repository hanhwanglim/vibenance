"use client";

import { DateTime } from "@vibenance/utils/date";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import type { DateRange } from "@/types";

type MonthlyDatePickerProps = {
	dateRange: DateRange;
	setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
};

export function MonthlyDatePicker({
	dateRange,
	setDateRange,
}: MonthlyDatePickerProps) {
	const handlePreviousMonth = () => {
		const prevMonth = new DateTime(dateRange?.from).subtract({ months: 1 });
		const endOfMonth = prevMonth.endOfMonth();

		setDateRange({
			from: prevMonth,
			to: endOfMonth,
		});
	};

	const handleNextMonth = () => {
		const nextMonth = new DateTime(dateRange?.from).add({ months: 1 });
		const endOfMonth = nextMonth.endOfMonth();

		setDateRange({
			from: nextMonth,
			to: endOfMonth,
		});
	};

	return (
		<div className="flex items-center gap-2">
			<Button
				variant="outline"
				size="icon"
				onClick={handlePreviousMonth}
				className="h-9 w-9"
			>
				<ChevronLeftIcon className="h-4 w-4" />
			</Button>
			<span className="rounded-md border bg-background px-3 py-1.5 shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50">
				{dateRange?.from?.toLocaleDateString()} -{" "}
				{dateRange?.to?.toLocaleDateString()}
			</span>

			<Button
				variant="outline"
				size="icon"
				onClick={handleNextMonth}
				className="h-9 w-9"
			>
				<ChevronRightIcon className="h-4 w-4" />
			</Button>
		</div>
	);
}
