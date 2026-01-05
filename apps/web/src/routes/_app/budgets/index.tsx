import { createFileRoute } from "@tanstack/react-router";
import { DateTime } from "@vibenance/utils/date";
import { Plus } from "lucide-react";
import { useState } from "react";
import { MonthlyDatePicker } from "@/components/monthly-date-picker";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { BudgetAllocationChart } from "@/modules/budgets/components/budget-allocation-chart";
import { BudgetDialog } from "@/modules/budgets/components/budget-dialog";
import { BudgetList } from "@/modules/budgets/components/budget-list";
import { BudgetProgressChart } from "@/modules/budgets/components/budget-progress-chart";
import { BudgetSummaryCards } from "@/modules/budgets/components/budget-summary-cards";
import type { DateRange } from "@/types";

export const Route = createFileRoute("/_app/budgets/")({
	component: RouteComponent,
});

function RouteComponent() {
	const now = new DateTime();
	const [dateRange, setDateRange] = useState<DateRange | undefined>({
		from: new DateTime(now).startOfMonth(),
		to: new DateTime(now).endOfMonth(),
	});
	const [dialogOpen, setDialogOpen] = useState(false);

	return (
		<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
			<div className="flex items-center justify-between px-4 lg:px-6">
				<MonthlyDatePicker dateRange={dateRange} setDateRange={setDateRange} />
				<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
					<Button onClick={() => setDialogOpen(true)} className="gap-2">
						<Plus className="h-4 w-4" />
						Create Budget
					</Button>
					<BudgetDialog mode="create" onOpenChange={setDialogOpen} />
				</Dialog>
			</div>
			<BudgetSummaryCards dateRange={dateRange} />
			<div className="grid @5xl/main:grid-cols-3 grid-cols-1 gap-4 px-4 lg:px-6">
				<BudgetProgressChart className="col-span-2" dateRange={dateRange} />
				<BudgetAllocationChart className="col-span-1" dateRange={dateRange} />
			</div>
			<BudgetList dateRange={dateRange} />
		</div>
	);
}
