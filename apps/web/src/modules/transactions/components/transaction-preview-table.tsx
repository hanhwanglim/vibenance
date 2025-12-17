import {
	type ColumnDef,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import type { TransactionSelect } from "@vibenance/db/schema/transaction";
import { DataTable, DataTablePagination } from "@/components/ui/data-table";

const columns: ColumnDef<TransactionSelect>[] = [
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
	},
	{
		accessorKey: "category",
		header: "Category",
		accessorFn: (row) => row.category?.name || null,
	},
	{
		accessorKey: "reference",
		header: "Reference",
	},
];

export function TransactionPreviewTable({ data }) {
	const table = useReactTable({
		data: data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	return (
		<div className="flex flex-col gap-2 px-4">
			<DataTable table={table} />
			<DataTablePagination table={table} />
		</div>
	);
}
