import {
	type ColumnDef,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import type { InvestmentTransactionRow } from "@vibenance/parser";
import { DataTable, DataTablePagination } from "@/components/ui/data-table";

const columns: ColumnDef<InvestmentTransactionRow>[] = [
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
		accessorKey: "type",
		header: "Type",
	},
	{
		accessorKey: "asset",
		header: "Asset",
	},
	{
		accessorKey: "quantity",
		header: "Quantity",
		cell: ({ row }) => Number(row.original.quantity).toPrecision(3),
	},
	{
		accessorKey: "currency",
		header: "Currency",
	},
	{
		accessorKey: "price",
		header: "Price",
		cell: ({ row }) => Number(row.original.price).toFixed(2),
	},
	{
		accessorKey: "fees",
		header: "Fees",
		cell: ({ row }) => Number(row.original.fees).toFixed(2),
	},
	{
		accessorKey: "total",
		header: "Total",
		cell: ({ row }) => Number(row.original.total).toFixed(2),
	},
];

export function TransactionPreviewTable({
	data,
}: {
	data: InvestmentTransactionRow[];
}) {
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
