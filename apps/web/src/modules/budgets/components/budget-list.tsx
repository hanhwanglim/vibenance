import { useQuery } from "@tanstack/react-query";
import { PiggyBank } from "lucide-react";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { DateRange } from "@/types";
import { orpc } from "@/utils/orpc";
import { BudgetCard } from "./budget-card";

export function BudgetList({ dateRange }: { dateRange?: DateRange }) {
	const { data: budgets } = useQuery(
		orpc.budget.getAll.queryOptions({ input: { dateRange: dateRange } }),
	);

	if (budgets?.length === 0) {
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
					{budgets?.length} {budgets?.length === 1 ? "budget" : "budgets"}
				</span>
			</div>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{budgets?.map((budget) => (
					<BudgetCard key={budget.id} budget={budget} />
				))}
			</div>
		</div>
	);
}
