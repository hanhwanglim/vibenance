import { useMutation } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import type { BankAccountSelect } from "@vibenance/db/schema/account";
import type {
	CategorySelect as CategorySelectType,
	TransactionSelect,
	TransactionType,
} from "@vibenance/db/schema/transaction";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/utils/formatting";
import { orpc } from "@/utils/orpc";
import { CategorySelect } from "../category-select";

export type TransactionRow = TransactionSelect & {
	category: CategorySelectType | null;
	bankAccount: BankAccountSelect | null;
};

export const transactionColumns = (): ColumnDef<TransactionRow>[] => [
	{
		id: "Select",
		header: ({ table }) => (
			<div className="flex items-center justify-center">
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && "indeterminate")
					}
					onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
					aria-label="Select all"
				/>
			</div>
		),
		cell: ({ row }) => (
			<div className="flex items-center justify-center">
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label="Select row"
				/>
			</div>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		id: "Time",
		accessorKey: "timestamp",
		header: "Time",
		cell: ({ row }) => {
			const date = row.original.timestamp;
			return new Intl.DateTimeFormat("en-GB", {
				year: "numeric",
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			}).format(date);
		},
	},
	{
		id: "Name",
		accessorKey: "name",
		header: "Name",
	},
	{
		id: "Currency",
		accessorKey: "currency",
		header: "Currency",
	},
	{
		id: "Amount",
		accessorKey: "amount",
		header: () => <div className="text-right">Amount</div>,
		cell: ({ row }) => {
			const amount = formatCurrency(Number(row.original.amount));
			const type = row.original.type;
			const isIncome = type === "income";
			const isExpense = type === "expense";

			return (
				<div className="text-right">
					<span
						className={
							isIncome
								? "text-green-600 dark:text-green-400"
								: isExpense
									? "text-red-600 dark:text-red-400"
									: ""
						}
					>
						{amount}
					</span>
				</div>
			);
		},
	},
	{
		id: "Type",
		accessorKey: "type",
		header: "Type",
		cell: ({ row, getValue }) => {
			const defaultValue = getValue() as TransactionType;

			const { mutate } = useMutation(
				orpc.transaction.updateType.mutationOptions(),
			);

			const handleChange = (value: string) => {
				mutate(
					{ id: row.original.id, type: value as TransactionType },
					{
						onSuccess: () => {
							toast.success("Category updated");
						},
					},
				);
			};

			return (
				<>
					<Label className="sr-only">Type</Label>
					<Select onValueChange={handleChange} defaultValue={defaultValue}>
						<SelectTrigger className="w-45">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Type</SelectLabel>
								<SelectItem key="income" value="income">
									Income
								</SelectItem>
								<SelectItem key="expense" value="expense">
									Expense
								</SelectItem>
								<SelectItem key="transfer" value="transfer">
									Transfer
								</SelectItem>
								<SelectItem key="interest" value="interest">
									Interest
								</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</>
			);
		},
	},
	{
		id: "Category",
		accessorKey: "categoryId",
		header: "Category",
		cell: ({ row, getValue }) => {
			const defaultValue = (getValue() || "null") as string;

			const { mutate } = useMutation(
				orpc.transaction.updateCategory.mutationOptions(),
			);

			const handleChange = (value: string) => {
				const payload: { id: string; categoryId: string | null } = {
					id: row.original.id,
					categoryId: value,
				};
				if (value === "null") {
					payload.categoryId = null;
				}

				mutate(payload, {
					onSuccess: () => {
						toast.success("Category updated");
					},
				});
			};

			return (
				<CategorySelect value={defaultValue} onValueChange={handleChange} />
			);
		},
	},
	{
		id: "Account",
		accessorKey: "accountId",
		header: "Account",
		accessorFn: (row) => row.bankAccount?.name ?? "",
	},
	{
		id: "Reference",
		accessorKey: "reference",
		header: "Reference",
	},
];
