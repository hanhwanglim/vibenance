import { PiggyBank } from "lucide-react";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { DateRange } from "@/types";
import { type Budget, BudgetCard } from "./budget-card";

// Fake budget data
function getFakeBudgets(_dateRange: DateRange | undefined): Budget[] {
	return [
		{
			id: "1",
			name: "Groceries",
			category: "Food & Dining",
			budgeted: 500,
			spent: 420,
			period: "monthly",
			currency: "GBP",
		},
		{
			id: "2",
			name: "Eating Out",
			category: "Food & Dining",
			budgeted: 200,
			spent: 185,
			period: "monthly",
			currency: "GBP",
		},
		{
			id: "3",
			name: "Transport",
			category: "Transportation",
			budgeted: 300,
			spent: 320,
			period: "monthly",
			currency: "GBP",
		},
		{
			id: "4",
			name: "Entertainment",
			category: "Entertainment",
			budgeted: 150,
			spent: 95,
			period: "monthly",
			currency: "GBP",
		},
		{
			id: "5",
			name: "Bills",
			category: "Utilities",
			budgeted: 800,
			spent: 780,
			period: "monthly",
			currency: "GBP",
		},
		{
			id: "6",
			name: "Shopping",
			category: "Shopping",
			budgeted: 400,
			spent: 450,
			period: "monthly",
			currency: "GBP",
		},
		{
			id: "7",
			name: "Holiday Fund",
			category: "Savings",
			budgeted: 1150,
			spent: 600,
			period: "yearly",
			currency: "GBP",
		},
	];
}

export function BudgetList({
	dateRange,
}: {
	dateRange: DateRange | undefined;
}) {
	const budgets = getFakeBudgets(dateRange);

	if (budgets.length === 0) {
		return (
			<div className="px-4 lg:px-6">
				<Card>
					<CardHeader className="py-12 text-center">
						<PiggyBank className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
						<CardTitle>No budgets yet</CardTitle>
						<CardDescription>
							Create your first budget to start tracking your spending
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-4 px-4 lg:px-6">
			<div className="flex items-center justify-between">
				<h2 className="font-semibold text-xl">Active Budgets</h2>
				<span className="text-muted-foreground text-sm">
					{budgets.length} {budgets.length === 1 ? "budget" : "budgets"}
				</span>
			</div>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{budgets.map((budget) => (
					<BudgetCard key={budget.id} budget={budget} />
				))}
			</div>
		</div>
	);
}
