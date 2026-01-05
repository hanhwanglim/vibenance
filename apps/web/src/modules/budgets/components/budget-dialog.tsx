"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BudgetSelect } from "@vibenance/db/schema/budget";
import type { CategorySelect } from "@vibenance/db/schema/transaction";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Field,
	FieldContent,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/utils/formatting";
import { orpc } from "@/utils/orpc";

const BUDGET_PERIODS = [
	{ value: "weekly", label: "Weekly" },
	{ value: "monthly", label: "Monthly" },
	{ value: "yearly", label: "Yearly" },
] as const;

const formSchema = z.object({
	name: z.string().min(1, "Name must be more than one character"),
	categoryId: z.string().min(1, "Please select a category"),
	currency: z.string("Please set a currency"),
	amount: z
		.string()
		.refine(
			(val) =>
				!Number.isNaN(Number.parseFloat(val)) && Number.parseFloat(val) > 0,
			"Amount must be a positive number",
		),
	period: z
		.union([z.literal(""), z.enum(["weekly", "monthly", "yearly"])])
		.refine((val) => val !== "", "Please select a period"),
	startDate: z.union([z.string(), z.undefined()]),
});

type Budget = BudgetSelect & { category: CategorySelect | null; spent: number };

type BudgetDialogProps = {
	mode: "create" | "edit";
	budget?: Budget;
	onOpenChange: (open: boolean) => void;
};

const UI_TEXT = {
	create: {
		title: "Create New Budget",
		description: "Set up a new budget to track your spending",
		button: "Create Budget",
		buttonLoading: "Creating...",
		success: "Budget created successfully",
		error: "Unable to create budget",
	},
	edit: {
		title: "Edit Budget",
		description: "Update your budget details below",
		button: "Update Budget",
		buttonLoading: "Updating...",
		success: "Budget updated successfully",
		error: "Unable to update budget",
	},
} as const;

export function BudgetDialog({
	mode,
	budget,
	onOpenChange,
}: BudgetDialogProps) {
	const isEditMode = mode === "edit";
	const queryClient = useQueryClient();
	const { data: categories } = useQuery(
		orpc.transaction.listCategories.queryOptions({}),
	);
	const { mutate: createBudget, isPending: isCreating } = useMutation(
		orpc.budget.create.mutationOptions({}),
	);
	const { mutate: updateBudget, isPending: isUpdating } = useMutation(
		orpc.budget.update.mutationOptions({}),
	);
	const isPending = isCreating || isUpdating;

	const uiText = UI_TEXT[mode];

	const form = useForm({
		defaultValues:
			isEditMode && budget
				? {
						name: budget.name,
						categoryId: budget.categoryId,
						currency: budget.currency,
						amount: formatCurrency(Number(budget.amount)),
						period: budget.period as "" | "weekly" | "monthly" | "yearly",
						startDate: budget.startDate?.toLocaleDateString() || undefined,
					}
				: {
						name: "",
						categoryId: "",
						currency: "",
						amount: "",
						period: "" as "" | "weekly" | "monthly" | "yearly",
						startDate: undefined as string | undefined,
					},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: ({ value }) => {
			const baseValue = {
				...value,
				period: value.period as "weekly" | "monthly" | "yearly",
				startDate: value.startDate ? new Date(value.startDate) : undefined,
			};

			if (isEditMode && budget) {
				updateBudget(
					{
						id: budget.id,
						...baseValue,
					},
					{
						onSuccess: () => {
							toast.success(uiText.success);
							queryClient.invalidateQueries({ queryKey: ["budget"] });
							onOpenChange(false);
						},
						onError: (error) => toast.error(`${uiText.error}: ${error}`),
					},
				);
			} else {
				createBudget(baseValue, {
					onSuccess: () => {
						toast.success(uiText.success);
						form.reset();
						onOpenChange(false);
					},
					onError: (error) => toast.error(`${uiText.error}: ${error}`),
				});
			}
		},
	});

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>{uiText.title}</DialogTitle>
				<DialogDescription>{uiText.description}</DialogDescription>
			</DialogHeader>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
				className="flex flex-col gap-4"
			>
				<FieldGroup>
					<form.Field name="name">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;

							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Budget Name</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
										placeholder="e.g., Groceries, Eating Out, Transport"
										autoComplete="off"
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>
				</FieldGroup>

				<FieldGroup>
					<form.Field name="categoryId">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldContent>
										<FieldLabel htmlFor={field.name}>Category</FieldLabel>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</FieldContent>
									<Select
										name={field.name}
										value={field.state.value}
										onValueChange={field.handleChange}
										disabled={isPending}
									>
										<SelectTrigger
											id={field.name}
											aria-invalid={isInvalid}
											className="min-w-[120px]"
										>
											<SelectValue placeholder="Select a category" />
										</SelectTrigger>
										<SelectContent position="item-aligned">
											{categories?.map((category) => (
												<SelectItem key={category.id} value={category.id}>
													{category.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</Field>
							);
						}}
					</form.Field>
				</FieldGroup>

				<FieldGroup>
					<form.Field name="currency">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Currency</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>
				</FieldGroup>

				<FieldGroup>
					<form.Field name="amount">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Budget Amount</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										type="number"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
										placeholder="0.00"
										autoComplete="off"
										min="0"
										step="0.01"
										disabled={isPending}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>
				</FieldGroup>

				<FieldGroup>
					<form.Field name="period">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldContent>
										<FieldLabel htmlFor={field.name}>Period</FieldLabel>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</FieldContent>
									<Select
										name={field.name}
										value={field.state.value}
										onValueChange={(value: "weekly" | "monthly" | "yearly") =>
											field.handleChange(value)
										}
									>
										<SelectTrigger
											id={field.name}
											aria-invalid={isInvalid}
											className="min-w-[120px]"
										>
											<SelectValue placeholder="Select period" />
										</SelectTrigger>
										<SelectContent position="item-aligned">
											{BUDGET_PERIODS.map((periodOption) => (
												<SelectItem
													key={periodOption.value}
													value={periodOption.value}
												>
													{periodOption.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</Field>
							);
						}}
					</form.Field>
				</FieldGroup>

				<FieldGroup>
					<form.Field name="startDate">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>
										Start Date (Optional)
									</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										type="date"
										value={field.state.value ?? ""}
										onBlur={field.handleBlur}
										onChange={(e) =>
											field.handleChange(e.target.value || undefined)
										}
										aria-invalid={isInvalid}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>
				</FieldGroup>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						disabled={isPending}
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isPending}>
						{isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								{uiText.buttonLoading}
							</>
						) : (
							uiText.button
						)}
					</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	);
}
