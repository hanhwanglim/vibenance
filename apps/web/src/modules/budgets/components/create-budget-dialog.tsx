"use client";

import { Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const BUDGET_PERIODS = [
	{ value: "weekly", label: "Weekly" },
	{ value: "monthly", label: "Monthly" },
	{ value: "yearly", label: "Yearly" },
] as const;

const FAKE_CATEGORIES = [
	"Food & Dining",
	"Transportation",
	"Entertainment",
	"Utilities",
	"Shopping",
	"Savings",
	"Healthcare",
	"Education",
	"Other",
] as const;

type CreateBudgetDialogProps = {
	onOpenChange: (open: boolean) => void;
};

export function CreateBudgetDialog({ onOpenChange }: CreateBudgetDialogProps) {
	const [name, setName] = useState<string>("");
	const [category, setCategory] = useState<string | undefined>(undefined);
	const [amount, setAmount] = useState<string>("");
	const [period, setPeriod] = useState<
		"weekly" | "monthly" | "yearly" | undefined
	>(undefined);
	const [startDate, setStartDate] = useState<string>("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSubmitting(true);

		if (!name.trim()) {
			toast.error("Please enter a budget name");
			setIsSubmitting(false);
			return;
		}

		if (!category) {
			toast.error("Please select a category");
			setIsSubmitting(false);
			return;
		}

		if (!amount || Number(amount) <= 0) {
			toast.error("Please enter a valid budget amount");
			setIsSubmitting(false);
			return;
		}

		if (!period) {
			toast.error("Please select a budget period");
			setIsSubmitting(false);
			return;
		}

		// Simulate API call delay
		await new Promise((resolve) => setTimeout(resolve, 500));

		toast.success("Budget created successfully");
		onOpenChange(false);
		setIsSubmitting(false);

		// Reset form
		setName("");
		setCategory(undefined);
		setAmount("");
		setPeriod(undefined);
		setStartDate("");
	};

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Create New Budget</DialogTitle>
				<DialogDescription>
					Set up a new budget to track your spending
				</DialogDescription>
			</DialogHeader>
			<form onSubmit={handleSubmit} className="flex flex-col gap-4">
				<div className="grid gap-2">
					<Label htmlFor="budget-name">Budget Name</Label>
					<Input
						id="budget-name"
						placeholder="e.g., Groceries, Eating Out, Transport"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
						disabled={isSubmitting}
						autoFocus
					/>
				</div>
				<div className="grid gap-2">
					<Label htmlFor="budget-category">Category</Label>
					<Select
						value={category}
						onValueChange={setCategory}
						disabled={isSubmitting}
						required
					>
						<SelectTrigger id="budget-category">
							<SelectValue placeholder="Select a category" />
						</SelectTrigger>
						<SelectContent>
							{FAKE_CATEGORIES.map((cat) => (
								<SelectItem key={cat} value={cat}>
									{cat}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="grid gap-2">
					<Label htmlFor="budget-amount">Budget Amount</Label>
					<Input
						id="budget-amount"
						type="number"
						placeholder="0.00"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						required
						disabled={isSubmitting}
						min="0"
						step="0.01"
					/>
				</div>
				<div className="grid gap-2">
					<Label htmlFor="budget-period">Period</Label>
					<Select
						value={period}
						onValueChange={(value) =>
							setPeriod(value as "weekly" | "monthly" | "yearly")
						}
						disabled={isSubmitting}
						required
					>
						<SelectTrigger id="budget-period">
							<SelectValue placeholder="Select period" />
						</SelectTrigger>
						<SelectContent>
							{BUDGET_PERIODS.map((periodOption) => (
								<SelectItem key={periodOption.value} value={periodOption.value}>
									{periodOption.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="grid gap-2">
					<Label htmlFor="budget-start-date">Start Date (Optional)</Label>
					<Input
						id="budget-start-date"
						type="date"
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
						disabled={isSubmitting}
					/>
				</div>
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={
							isSubmitting || !name.trim() || !category || !amount || !period
						}
					>
						{isSubmitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Creating...
							</>
						) : (
							"Create Budget"
						)}
					</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	);
}
