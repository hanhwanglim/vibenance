import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import {
	type ColumnDef,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import type { TransactionSelect } from "@vibenance/db/schema/transaction";
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
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/formatting";
import { orpc } from "@/utils/orpc";

type TransactionRow = TransactionSelect & {
	category: { name: string } | null;
	account: { name: string };
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
		accessorKey: "category",
		header: "Category",
		cell: ({ row, table }) => {
			const pageIndex = table.getState().pagination.pageIndex;
			const defaultValue = row.original.categoryId?.toString() || "null";
			const selectKey = `select-${row.original.id}-${pageIndex}`;

			const handleChange = (value: string) => {
				const { mutate } = useMutation(
					orpc.transaction.updateCategory.mutationOptions(),
				);

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

			const { data: categories } = useQuery(
				orpc.transaction.listCategories.queryOptions(),
			);

			return (
				<>
					<Label htmlFor={`${row.original.id}-target`} className="sr-only">
						Category
					</Label>
					<Select
						key={selectKey}
						onValueChange={handleChange}
						defaultValue={defaultValue}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Category</SelectLabel>
								{categories?.map((category) => {
									return (
										<SelectItem
											key={`table-category-${row.original.id}-${category.id}`}
											value={category.id.toString()}
										>
											{category.name}
										</SelectItem>
									);
								})}
								<Separator />
								<SelectItem value="null">-</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</>
			);
		},
	},
	{
		accessorKey: "accountId",
		header: "Account",
		accessorFn: (row) => row.account.name,
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
		<div className="flex flex-col gap-2">
			<DataTable table={table} />
			<DataTablePagination table={table} />
		</div>
	);
}
