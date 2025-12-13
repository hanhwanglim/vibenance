import { useQuery } from "@tanstack/react-query";
import {
	type ColumnDef,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import type { TransactionSelect } from "@vibenance/db/schema/transaction";
import { useState } from "react";
import { DataTable, DataTablePagination } from "@/components/ui/data-table";
import { orpc } from "@/utils/orpc";

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
		accessorKey: "categoryId",
		header: "Category",
		accessorFn: (row) => row.category.name,
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

export function TransactionTable() {
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

	const transactions = useQuery(
		orpc.transaction.getAll.queryOptions({
			input: { page: pagination.pageIndex, pageSize: pagination.pageSize },
		}),
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
	});

	return (
		<div className="flex flex-col gap-2 px-4">
			<DataTable table={table} />
			<DataTablePagination table={table} />
		</div>
	);
}
