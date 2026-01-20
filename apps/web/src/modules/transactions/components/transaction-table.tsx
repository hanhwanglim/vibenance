import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import {
	type ColumnDef,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import type { BankAccountSelect } from "@vibenance/db/schema/account";
import type {
	CategorySelect as CategorySelectType,
	TransactionSelect,
	TransactionType,
} from "@vibenance/db/schema/transaction";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable, DataTablePagination } from "@/components/ui/data-table";
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
import { CategorySelect } from "./category-select";

type TransactionRow = TransactionSelect & {
	category: CategorySelectType;
	bankAccount: BankAccountSelect;
};

const columns: ColumnDef<TransactionRow>[] = [
	{
		id: "select",
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
		accessorKey: "timestamp",
		header: "Time",
		cell: ({ row }) => row.original.timestamp.toLocaleString(),
	},
	{
		accessorKey: "name",
		header: "Name",
	},
	{
		accessorKey: "currency",
		header: "Currency",
	},
	{
		accessorKey: "amount",
		header: "Amount",
		cell: ({ row }) => formatCurrency(Number(row.original.amount)),
	},
	{
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
		accessorKey: "accountId",
		header: "Account",
		accessorFn: (row) => row.bankAccount.name,
	},
	{
		accessorKey: "reference",
		header: "Reference",
	},
];

type TransactionTableProps = {
	type: "all" | "income" | "expenses";
	dateRange: DateRange | undefined;
};

export function TransactionTable({ type, dateRange }: TransactionTableProps) {
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

	const { data: transactions } = useQuery(
		orpc.transaction.getAll.queryOptions({
			input: { pagination: pagination, type: type, dateRange: dateRange },
			placeholderData: keepPreviousData,
		}),
	);

	const table = useReactTable({
		data: (transactions?.data || []) as TransactionRow[],
		columns,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		onPaginationChange: setPagination,
		rowCount: transactions?.count || 0,
		state: {
			pagination,
		},
	});

	return (
		<div className="flex flex-1 flex-col gap-2 overflow-hidden">
			<div className="flex-1 overflow-auto">
				<DataTable table={table} />
			</div>
			<DataTablePagination table={table} />
		</div>
	);
}
