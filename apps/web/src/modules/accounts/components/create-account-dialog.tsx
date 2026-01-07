"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { BankAccountSelect } from "@vibenance/db/schema/account";
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
import { orpc } from "@/utils/orpc";

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
	account: boolean;
	onOpenChange: (open: boolean) => void;
};

export function AccountDialog({ account, onOpenChange }: AccountDialogProps) {
	const [name, setName] = useState<string>("");
	const [type, setType] = useState<BankAccountSelect["type"] | undefined>(
		undefined,
	);
	const [accountNumber, setAccountNumber] = useState<string | undefined>(
		undefined,
	);
	const [bankName, setBankName] = useState<string | undefined>(undefined);
	const [color, setColor] = useState<string | undefined>(undefined);
	const isEditing = account !== null;

	const queryClient = useQueryClient();
	const mutation = useMutation(orpc.bankAccount.create.mutationOptions({}));

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!type) {
			toast.error("Please select an account type");
			return;
		}

		mutation.mutate(
			{
				name: name,
				type: type,
				accountNumber: accountNumber,
				bankName: bankName,
				color: color,
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ["bankAccount"] });
					toast.success("Account created");
					onOpenChange(false);
				},
				onError: (error) => toast.error(error.message),
			},
		);
	};

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>
					{isEditing ? "Edit Account" : "Add New Account"}
				</DialogTitle>
				<DialogDescription>
					{isEditing
						? "Update the account details below."
						: "Enter details for the new account."}
				</DialogDescription>
			</DialogHeader>
			<form onSubmit={handleSubmit} className="flex flex-col gap-4">
				<div className="grid gap-2">
					<Label htmlFor="account-name">Account Name</Label>
					<Input
						id="account-name"
						placeholder="e.g., Monzo, Chase, American Express"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
						disabled={mutation.isPending}
						autoFocus
					/>
				</div>
				<div className="grid gap-2">
					<Label htmlFor="account-type">Account Type</Label>
					<Select
						value={type}
						onValueChange={(value) =>
							setType(value as BankAccountSelect["type"])
						}
						disabled={mutation.isPending}
						required
					>
						<SelectTrigger id="account-type">
							<SelectValue placeholder="Select account type" />
						</SelectTrigger>
						<SelectContent>
							{ACCOUNT_TYPES.map((accountType) => (
								<SelectItem key={accountType.value} value={accountType.value}>
									{accountType.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="grid gap-2">
					<Label htmlFor="bank-name">Bank/Institution Name (Optional)</Label>
					<Input
						id="bank-name"
						placeholder="e.g., Chase Bank, Monzo"
						value={bankName}
						onChange={(e) => setBankName(e.target.value)}
						disabled={mutation.isPending}
					/>
				</div>
				<div className="grid gap-2">
					<Label htmlFor="account-number">Account Number (Optional)</Label>
					<Input
						id="account-number"
						placeholder="e.g., 12345678"
						value={accountNumber}
						onChange={(e) => setAccountNumber(e.target.value)}
						disabled={mutation.isPending}
					/>
				</div>
				<div className="grid gap-2">
					<Label htmlFor="account-color">Color (Optional)</Label>
					<Select
						value={color}
						onValueChange={setColor}
						disabled={mutation.isPending}
					>
						<SelectTrigger id="account-color">
							<SelectValue placeholder="Select a color" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="none">None</SelectItem>
							{COLOR_OPTIONS.map((colorOption) => (
								<SelectItem key={colorOption.value} value={colorOption.value}>
									{colorOption.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={mutation.isPending}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={mutation.isPending || !name.trim() || !type}
					>
						{mutation.isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								{isEditing ? "Updating..." : "Creating..."}
							</>
						) : isEditing ? (
							"Update Account"
						) : (
							"Create Account"
						)}
					</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	);
}
