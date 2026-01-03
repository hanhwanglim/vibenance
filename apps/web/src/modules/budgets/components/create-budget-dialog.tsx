"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
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

type CreateBudgetDialogProps = {
	onOpenChange: (open: boolean) => void;
};

export function CreateBudgetDialog({ onOpenChange }: CreateBudgetDialogProps) {
	const { data: categories } = useQuery(
		orpc.transaction.listCategories.queryOptions({}),
	);
	const { mutate, isPending } = useMutation(
		orpc.budget.create.mutationOptions({}),
	);

	const form = useForm({
		defaultValues: {
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
			const transformedValue = {
				...value,
				period: value.period as "weekly" | "monthly" | "yearly",
				startDate: value.startDate ? new Date(value.startDate) : undefined,
			};
			mutate(transformedValue, {
				onSuccess: () => {
					toast.success("Budget created successfully");
					onOpenChange(false);
					form.reset();
				},
				onError: (error) => toast.error(`Unable to create budget: ${error}`),
			});
		},
	});

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Create New Budget</DialogTitle>
				<DialogDescription>
					Set up a new budget to track your spending
				</DialogDescription>
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
					<Button type="button" variant="outline" disabled={isPending}>
						Cancel
					</Button>
					<Button type="submit" disabled={isPending}>
						{isPending ? (
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
