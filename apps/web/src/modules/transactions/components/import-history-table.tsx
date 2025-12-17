import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { FileIcon } from "lucide-react";
import { useState } from "react";
import { DataTable, DataTablePagination } from "@/components/ui/data-table";
import { orpc } from "@/utils/orpc";

const columns = [
	{
		accessorFn: (row) => `${row.files[0].fileName}`,
		header: "Name",
	},
	{
		accessorKey: "status",
		header: "Status",
	},
	{
		accessorKey: "createdAt",
		header: "Uploaded At",
	},
	{
		accessorKey: "file",
		header: "File",
		cell: ({ row }) => {
			return (
				<div>
					<FileIcon className="hover:cursor-pointer" />
					<span className="sr-only">
						{row.original.files[0].filePath || ""}
					</span>
				</div>
			);
		},
	},
];

export function ImportHistoryTable() {
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

	const { data: importHistory, isLoading } = useQuery(
		orpc.transaction.importList.queryOptions({
			input: { pagination: pagination },
			placeholderData: keepPreviousData,
		}),
	);

	const table = useReactTable({
		data: importHistory?.data || [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		onPaginationChange: setPagination,
		rowCount: importHistory?.count || 0,
		state: {
			pagination,
		},
	});

	if (isLoading) {
		return null;
	}

	return (
		<div className="flex flex-col gap-2">
			<DataTable table={table} />
			<DataTablePagination table={table} />
		</div>
	);
}
