"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	type AccountType,
	accountTypeEnumSchema,
	type BankAccountSelect,
} from "@vibenance/db/schema/account";
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

const formSchema = z.object({
	name: z.string().min(1, "Please set a name"),
	type: accountTypeEnumSchema,
	accountNumber: z.string(),
	bankName: z.string(),
	color: z.string(),
	currency: z.string().min(1, "Please set a currency"),
	balance: z
		.string()
		.refine(
			(val) =>
				!Number.isNaN(Number.parseFloat(val)) && Number.parseFloat(val) > 0,
			"Amount must be a positive number",
		),
});

const ACCOUNT_TYPES = [
	{ value: "savings", label: "Savings" },
	{ value: "current", label: "Current" },
	{ value: "checking", label: "Checking" },
	{ value: "credit_card", label: "Credit Card" },
	{ value: "investment", label: "Investment" },
	{ value: "loan", label: "Loan" },
	{ value: "other", label: "Other" },
] as const;

const COLOR_OPTIONS = [
	{ value: "blue", label: "Blue" },
	{ value: "green", label: "Green" },
	{ value: "red", label: "Red" },
	{ value: "orange", label: "Orange" },
	{ value: "purple", label: "Purple" },
	{ value: "pink", label: "Pink" },
	{ value: "teal", label: "Teal" },
	{ value: "gray", label: "Gray" },
] as const;

type AccountDialogProps = {
	mode: "create" | "edit";
	account?: BankAccountSelect;
	onOpenChange: (open: boolean) => void;
};

const UI_TEXT = {
	create: {
		title: "Add New Account",
		description: "Enter details for the new account.",
		button: "Create Account",
		buttonLoading: "Creating...",
		success: "Account created successfully",
		error: "Unable to create account",
	},
	edit: {
		title: "Edit Account",
		description: "Update the account details below.",
		button: "Update Account",
		buttonLoading: "Updating...",
		success: "Account updated successfully",
		error: "Unable to update account",
	},
} as const;

export function AccountDialog({
	mode,
	account,
	onOpenChange,
}: AccountDialogProps) {
	const isEditMode = mode === "edit";
	const queryClient = useQueryClient();

	const { mutate: createAccount, isPending: isCreating } = useMutation(
		orpc.bankAccount.create.mutationOptions({}),
	);
	const { mutate: updateAccount, isPending: isUpdating } = useMutation(
		orpc.bankAccount.update.mutationOptions({}),
	);

	const isPending = isCreating || isUpdating;

	const uiText = UI_TEXT[mode];

	const form = useForm({
		defaultValues:
			isEditMode && account
				? {
						name: account.name,
						type: account.type,
						accountNumber: account.accountNumber ?? "",
						bankName: account.bankName ?? "",
						color: account.color ?? "",
						currency: account.currency ?? "",
						balance: account.balance
							? formatCurrency(Number(account.balance))
							: "",
					}
				: {
						name: "",
						type: "other" as const,
						accountNumber: "",
						bankName: "",
						color: "",
						currency: "",
						balance: "",
					},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: ({ value }) => {
			const input = {
				...value,
				accountNumber: normalizeOptionalString(value.accountNumber),
				bankName: normalizeOptionalString(value.bankName),
				color: normalizeOptionalString(value.color),
				currency: normalizeOptionalString(value.currency),
				balance: normalizeOptionalString(value.balance),
			};

			if (isEditMode && account) {
				updateAccount(
					{ id: account.id, ...input },
					{
						onSuccess: () => {
							toast.success(uiText.success);
							queryClient.invalidateQueries({ queryKey: ["account"] });
							onOpenChange(false);
						},
						onError: (error) => toast.error(`${uiText.error}: ${error}`),
					},
				);
			} else {
				createAccount(input, {
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
									<FieldLabel htmlFor={field.name}>Account Name</FieldLabel>
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
					<form.Field name="type">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldContent>
										<FieldLabel htmlFor={field.name}>Account Type</FieldLabel>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</FieldContent>
									<Select
										name={field.name}
										value={field.state.value}
										onValueChange={(value: AccountType) =>
											field.handleChange(value)
										}
										disabled={isPending}
									>
										<SelectTrigger
											id={field.name}
											aria-invalid={isInvalid}
											className="min-w-30"
										>
											<SelectValue placeholder="Select an account type" />
										</SelectTrigger>
										<SelectContent position="item-aligned">
											{ACCOUNT_TYPES.map((accountType) => (
												<SelectItem
													key={accountType.value}
													value={accountType.value}
												>
													{accountType.label}
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
					<form.Field name="bankName">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>
										Bank/Institution Name (Optional)
									</FieldLabel>
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
					<form.Field name="accountNumber">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>
										Account Number (Optional)
									</FieldLabel>
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
					<form.Field name="color">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldContent>
										<FieldLabel htmlFor={field.name}>
											Color (Optional)
										</FieldLabel>
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
											className="min-w-30"
										>
											<SelectValue />
										</SelectTrigger>
										<SelectContent position="item-aligned">
											{COLOR_OPTIONS.map((color) => (
												<SelectItem key={color.value} value={color.value}>
													{color.label}
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
					<form.Field name="balance">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Balance</FieldLabel>
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

function normalizeOptionalString(s: string): string | undefined {
	return s?.trim() ? s : undefined;
}
