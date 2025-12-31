import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
	type ColumnDef,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import type { InvestmentTransactionRow } from "@vibenance/parser";
import { useState } from "react";
import { DataTable, DataTablePagination } from "@/components/ui/data-table";
import type { DateRange } from "@/types";
import { orpc } from "@/utils/orpc";

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
export function TransactionTable({
	type,
	dateRange,
}: {
	type: string;
	dateRange?: DateRange;
}) {
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

	const { data: transactions } = useQuery(
		orpc.asset.getAll.queryOptions({
			input: { pagination: pagination, type: type, dateRange: dateRange },
			placeholderData: keepPreviousData,
		}),
	);

	const table = useReactTable({
		data: (transactions?.data || []) as InvestmentTransactionRow[],
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
