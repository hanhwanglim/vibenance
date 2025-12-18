import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import {
	type ColumnDef,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import type { TransactionSelect } from "@vibenance/db/schema/transaction";
import { useState } from "react";
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

const columns: ColumnDef<TransactionSelect>[] = [
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
		accessorFn: (row) => row.category?.name || null,
		cell: ({ row, table }) => {
			const handleChange = (value: string) => {
				const mutation = table.options.meta.updateCategoryMutation;
				const payload = { id: row.original.id, categoryId: null };
				if (!value) {
					payload.categoryId = Number(value);
				}
				mutation.mutate(payload, {
					onSuccess: () => {
						toast.success("Category updated");
					},
				});
			};

			return (
				<>
					<Label htmlFor={`${row.original.id}-target`} className="sr-only">
						Category
					</Label>
					<Select
						onValueChange={handleChange}
						defaultValue={row.original.categoryId?.toString() || "null"}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Category</SelectLabel>
								{table.options.meta.categories.map((category) => {
									return (
										<SelectItem
											key={`table-category-${category.id}`}
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

export function TransactionTable({ type, dateRange }) {
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

	const transactions = useQuery(
		orpc.transaction.getAll.queryOptions({
			input: { pagination: pagination, type: type, dateRange: dateRange },
			placeholderData: keepPreviousData,
		}),
	);

	const { data: categories } = useQuery(
		orpc.transaction.listCategories.queryOptions(),
	);

	const updateCategoryMutation = useMutation(
		orpc.transaction.updateCategory.mutationOptions(),
	);

	const table = useReactTable({
		data: transactions.data?.data || [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		onPaginationChange: setPagination,
		rowCount: transactions.data?.count || 0,
		state: {
			pagination,
		},
		meta: {
			categories: categories,
			updateCategoryMutation: updateCategoryMutation,
		},
	});

	return (
		<div className="flex flex-col gap-2">
			<DataTable table={table} />
			<DataTablePagination table={table} />
		</div>
	);
}
