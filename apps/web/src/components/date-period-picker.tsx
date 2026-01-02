"use client";

import { DateTime, parsePeriod } from "@vibenance/utils/date";
import { CalendarDaysIcon, ChevronDownIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { DateRange } from "@/types";

type DatePeriodPickerProps = {
	dateRange: DateRange | undefined;
	setDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
};

export function DatePeriodPicker({
	dateRange,
	setDateRange,
}: DatePeriodPickerProps) {
	const [open, setOpen] = React.useState<boolean>(false);
	const [value, setValue] = React.useState<string>("3m");

	const now = new Date();

	return (
		<ButtonGroup>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						id="date"
						className="w-60 justify-between font-normal"
					>
						<CalendarDaysIcon />
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
						onSelect={(dateRange) => {
							if (dateRange) {
								setDateRange({ ...dateRange, period: undefined });
							} else {
								setDateRange(dateRange);
							}
							setValue("custom");
						}}
						numberOfMonths={2}
						className="rounded-lg border shadow-sm"
						captionLayout="dropdown"
					/>
				</PopoverContent>
			</Popover>
			<Select
				value={value}
				onValueChange={(value) => {
					setDateRange({
						from: new DateTime().subtract(parsePeriod(value)).startOfDay(),
						to: new DateTime().startOfDay(),
						period: value,
					});
					setValue(value);
				}}
			>
				<SelectTrigger className="w-34">
					<SelectValue placeholder="Select Date" />
				</SelectTrigger>
				<SelectContent align="center">
					<SelectItem value="1d">1 Day</SelectItem>
					<SelectItem value="1w">1 Week</SelectItem>
					<SelectItem value="1m">1 Month</SelectItem>
					<SelectItem value="3m">3 Months</SelectItem>
					<SelectItem value="6m">6 Months</SelectItem>
					<SelectItem value="1y">1 Year</SelectItem>
					<SelectItem value="3y">3 Years</SelectItem>
					<SelectItem value="custom" disabled>
						Custom
					</SelectItem>
				</SelectContent>
			</Select>
		</ButtonGroup>
	);
}
