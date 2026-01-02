import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatting";

export type Budget = {
	id: string;
	name: string;
	category: string;
	budgeted: number;
	spent: number;
	period: "weekly" | "monthly" | "yearly";
	currency: string;
};

type BudgetCardProps = {
	budget: Budget;
	onEdit?: (budget: Budget) => void;
	onDelete?: (budget: Budget) => void;
};

function getStatus(percentage: number): {
	label: string;
	variant: "default" | "secondary" | "destructive" | "outline";
	color: string;
} {
	if (percentage < 80) {
		return {
			label: "On Track",
			variant: "default",
			color: "bg-green-500",
		};
	}
	if (percentage <= 100) {
		return {
			label: "Warning",
			variant: "secondary",
			color: "bg-yellow-500",
		};
	}
	return {
		label: "Over Budget",
		variant: "destructive",
		color: "bg-red-500",
	};
}

function getPeriodLabel(period: Budget["period"]): string {
	switch (period) {
		case "weekly":
			return "Weekly";
		case "monthly":
			return "Monthly";
		case "yearly":
			return "Yearly";
	}
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
	const percentage = (budget.spent / budget.budgeted) * 100;
	const remaining = budget.budgeted - budget.spent;
	const status = getStatus(percentage);

	return (
		<Card className="flex flex-col">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<div className="mb-1 flex items-center gap-2">
							<CardTitle className="text-lg">{budget.name}</CardTitle>
							<Badge variant="outline" className="text-xs">
								{budget.category}
							</Badge>
						</div>
						<CardDescription className="text-xs">
							{getPeriodLabel(budget.period)} Budget
						</CardDescription>
					</div>
					<div className="flex gap-1">
						{onEdit && (
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={() => onEdit(budget)}
							>
								<Pencil className="h-4 w-4" />
							</Button>
						)}
						{onDelete && (
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 text-destructive hover:text-destructive"
								onClick={() => onDelete(budget)}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						)}
					</div>
				</div>
			</CardHeader>
			<CardFooter className="mt-auto flex flex-col items-start gap-3 pt-0">
				<div className="w-full space-y-2">
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Progress</span>
						<span className="font-semibold">{percentage.toFixed(1)}%</span>
					</div>
					<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
						<div
							className={cn("h-full transition-all", status.color)}
							style={{ width: `${Math.min(percentage, 100)}%` }}
						/>
					</div>
				</div>
				<div className="flex w-full items-center justify-between">
					<div className="flex flex-col gap-1">
						<span className="text-muted-foreground text-xs">Spent</span>
						<span className="font-semibold text-lg">
							{formatCurrency(budget.spent, budget.currency)}
						</span>
					</div>
					<div className="flex flex-col items-end gap-1">
						<span className="text-muted-foreground text-xs">Budgeted</span>
						<span className="font-semibold text-lg">
							{formatCurrency(budget.budgeted, budget.currency)}
						</span>
					</div>
				</div>
				<div className="flex w-full items-center justify-between">
					<Badge variant={status.variant} className="text-xs">
						{status.label}
					</Badge>
					<span
						className={cn(
							"font-medium text-xs",
							remaining >= 0
								? "text-green-600 dark:text-green-400"
								: "text-red-600 dark:text-red-400",
						)}
					>
						{remaining >= 0 ? "Remaining: " : "Over by: "}
						{formatCurrency(Math.abs(remaining), budget.currency)}
					</span>
				</div>
			</CardFooter>
		</Card>
	);
}
