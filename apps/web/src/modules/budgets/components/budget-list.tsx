import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BudgetSelect } from "@vibenance/db/schema/budget";
import type { CategorySelect } from "@vibenance/db/schema/transaction";
import { PiggyBank } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import type { DateRange } from "@/types";
import { orpc } from "@/utils/orpc";
import { BudgetCard } from "./budget-card";
import { BudgetDialog } from "./budget-dialog";

type Budget = BudgetSelect & { category: CategorySelect | null; spent: number };

export function BudgetList({ dateRange }: { dateRange?: DateRange }) {
	const queryClient = useQueryClient();
	const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
	const { data: budgets } = useQuery(
		orpc.budget.getAll.queryOptions({ input: { dateRange: dateRange } }),
	);

	const deleteMutation = useMutation(orpc.budget.delete.mutationOptions({}));

	const handleEdit = (budget: Budget) => {
		setEditingBudget(budget);
	};

	const handleDelete = (budget: Budget) => {
		if (
			!confirm(
				`Are you sure you want to delete "${budget.name}"? This action cannot be undone.`,
			)
		) {
			return;
		}

		deleteMutation.mutate(budget.id, {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["budget"] });
				toast.success("Budget deleted successfully");
			},
			onError: (error) => toast.error(`Unable to delete budget: ${error}`),
		});
	};

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
		<>
			<div className="space-y-4 px-4 lg:px-6">
				<div className="flex items-center justify-between">
					<h2 className="font-semibold text-xl">Active Budgets</h2>
					<span className="text-muted-foreground text-sm">
						{budgets?.length} {budgets?.length === 1 ? "budget" : "budgets"}
					</span>
				</div>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{budgets?.map((budget) => (
						<BudgetCard
							key={budget.id}
							budget={budget}
							onEdit={handleEdit}
							onDelete={handleDelete}
						/>
					))}
				</div>
			</div>
			<Dialog
				open={editingBudget !== null}
				onOpenChange={(open) => {
					if (!open) {
						setEditingBudget(null);
					}
				}}
			>
				{editingBudget && (
					<BudgetDialog
						mode="edit"
						budget={editingBudget}
						onOpenChange={(open) => {
							if (!open) {
								setEditingBudget(null);
							}
						}}
					/>
				)}
			</Dialog>
		</>
	);
}
