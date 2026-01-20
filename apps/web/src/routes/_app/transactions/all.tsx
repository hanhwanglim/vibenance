import { createFileRoute } from "@tanstack/react-router";
import { DateTime } from "@vibenance/utils/date";
import { useState } from "react";
import { DatePeriodPicker } from "@/components/date-period-picker";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImportDialog } from "@/modules/transactions/components/import-dialog";
import { SummaryCards } from "@/modules/transactions/components/summary-cards";
import { ColumnVisibilityControl } from "@/modules/transactions/components/transaction-table/column-visibility-control";
import { TransactionTable } from "@/modules/transactions/components/transaction-table/table";
import { useTransactionTable } from "@/modules/transactions/hooks/use-transaction-table";
import type { DateRange } from "@/types";

export const Route = createFileRoute("/_app/transactions/all")({
	component: RouteComponent,
});

const tabs = [
	{
		label: "All",
		value: "all",
	},
	{
		label: "Income",
		value: "income",
	},
	{
		label: "Expense",
		value: "expenses",
	},
];

function RouteComponent() {
	const [dateRange, setDateRange] = useState<DateRange | undefined>({
		from: new DateTime().subtract({ months: 3 }),
		to: new Date(),
		period: "3m",
	});

	const [type, setType] = useState<"all" | "income" | "expenses">("all");
	const table = useTransactionTable(dateRange, type);

	return (
		<div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
			<SummaryCards dateRange={dateRange} />

			<Tabs
				value={type}
				onValueChange={(value) => {
					setType(value as "all" | "income" | "expenses");
				}}
				className="flex w-full flex-1 flex-col justify-start gap-6"
			>
				<div className="flex items-center justify-between px-4 lg:px-6">
					<div className="flex gap-2">
						<Label htmlFor="view-selector" className="sr-only">
							View
						</Label>
						<Select
							value={type}
							onValueChange={(value) => {
								setType(value as "all" | "income" | "expenses");
							}}
						>
							<SelectTrigger
								className="flex @4xl/main:hidden w-fit"
								size="sm"
								id="view-selector"
							>
								<SelectValue placeholder="Select a view" />
							</SelectTrigger>
							<SelectContent>
								{tabs.map((tab) => (
									<SelectItem key={tab.value} value={tab.value}>
										{tab.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<TabsList className="@4xl/main:flex hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1">
							{tabs.map((tab) => (
								<TabsTrigger key={tab.value} value={tab.value}>
									{tab.label}
								</TabsTrigger>
							))}
						</TabsList>
						<DatePeriodPicker
							dateRange={dateRange}
							setDateRange={setDateRange}
						/>
					</div>
					<div className="flex items-center gap-2">
						<ColumnVisibilityControl table={table} />
						<ImportDialog />
					</div>
				</div>
				{tabs.map((tab) => (
					<TabsContent
						key={tab.value}
						value={tab.value}
						className="relative flex flex-1 flex-col gap-4 overflow-hidden px-4 lg:px-6"
					>
						<TransactionTable table={table} />
					</TabsContent>
				))}
			</Tabs>
		</div>
	);
}
