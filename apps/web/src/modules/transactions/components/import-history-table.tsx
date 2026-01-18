import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
	type ColumnDef,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import type { FileImportSelect, FileSelect } from "@vibenance/db/schema/file";
import { FileIcon } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DataTable, DataTablePagination } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

type FileImportRow = FileImportSelect & {
	files: Array<FileSelect>;
	transactionCount?: number;
	newCount?: number;
	similarCount?: number;
	existingCount?: number;
};

function StatusBadge({ status }: { status: string }) {
	const statusConfig = {
		success: {
			variant: "default" as const,
			className:
				"bg-green-500/10 text-green-700 border-green-500/50 dark:text-green-400 dark:bg-green-500/20",
			label: "Success",
		},
		pending: {
			variant: "outline" as const,
			className:
				"bg-yellow-500/10 text-yellow-700 border-yellow-500/50 dark:text-yellow-400 dark:bg-yellow-500/20",
			label: "Pending",
		},
		failed: {
			variant: "destructive" as const,
			className: "",
			label: "Failed",
		},
	};

	const config = statusConfig[status as keyof typeof statusConfig] || {
		variant: "outline" as const,
		className: "",
		label: status,
	};

	return (
		<Badge variant={config.variant} className={cn(config.className)}>
			{config.label}
		</Badge>
	);
}

function NewCountCell({ row }: { row: { original: FileImportRow } }) {
	const { status, newCount } = row.original;

	if (status === "pending" && newCount !== undefined) {
		return (
			<div className="text-right text-green-700 text-sm dark:text-green-400">
				{newCount}
			</div>
		);
	}

	return <div className="text-right text-muted-foreground text-sm">—</div>;
}

function SimilarCountCell({ row }: { row: { original: FileImportRow } }) {
	const { status, similarCount } = row.original;

	if (status === "pending" && similarCount !== undefined) {
		return (
			<div className="text-right text-sm text-yellow-700 dark:text-yellow-400">
				{similarCount}
			</div>
		);
	}

	return <div className="text-right text-muted-foreground text-sm">—</div>;
}

function DuplicateCountCell({ row }: { row: { original: FileImportRow } }) {
	const { status, existingCount } = row.original;

	if (status === "pending" && existingCount !== undefined) {
		return (
			<div className="text-right text-red-700 text-sm dark:text-red-400">
				{existingCount}
			</div>
		);
	}

	return <div className="text-right text-muted-foreground text-sm">—</div>;
}

function ImportedCountCell({ row }: { row: { original: FileImportRow } }) {
	const { status, transactionCount } = row.original;

	if (status !== "pending" && transactionCount !== undefined) {
		return <div className="text-right text-sm">{transactionCount}</div>;
	}

	return <div className="text-right text-muted-foreground text-sm">—</div>;
}

const columns: ColumnDef<FileImportRow>[] = [
	{
		accessorFn: (row) => `${row.files[0]?.fileName || ""}`,
		header: "Name",
		cell: ({ row }) => {
			const fileName = row.original.files[0]?.fileName || "Unknown";
			return (
				<Link
					to="/transactions/imports/$id"
					params={{ id: row.original.id }}
					className="font-medium text-primary hover:underline"
				>
					{fileName}
				</Link>
			);
		},
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => <StatusBadge status={row.original.status} />,
	},
	{
		accessorKey: "createdAt",
		header: "Uploaded At",
		cell: ({ row }) => {
			const date = new Date(row.original.createdAt);
			return (
				<div className="text-sm">
					{date.toLocaleDateString()}{" "}
					{date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
				</div>
			);
		},
	},
	{
		id: "new",
		header: () => <div className="text-right">New</div>,
		cell: ({ row }) => <NewCountCell row={row} />,
	},
	{
		id: "similar",
		header: () => <div className="text-right">Similar</div>,
		cell: ({ row }) => <SimilarCountCell row={row} />,
	},
	{
		id: "duplicate",
		header: () => <div className="text-right">Duplicate</div>,
		cell: ({ row }) => <DuplicateCountCell row={row} />,
	},
	{
		id: "imported",
		header: () => <div className="text-right">Imported</div>,
		cell: ({ row }) => <ImportedCountCell row={row} />,
	},
	{
		accessorKey: "file",
		header: "File",
		cell: ({ row }) => {
			const file = row.original.files[0];
			if (!file) return null;

			const fileExtension = file.fileName.split(".").pop()?.toUpperCase() || "";
			return (
				<div className="flex items-center gap-2">
					<FileIcon className="h-4 w-4 text-muted-foreground" />
					<span className="text-muted-foreground text-xs">{fileExtension}</span>
				</div>
			);
		},
	},
];

function TableSkeleton() {
	return (
		<div className="space-y-3">
			{Array.from({ length: 5 }).map(() => (
				<div key={crypto.randomUUID()} className="flex items-center gap-4">
					<Skeleton className="h-4 w-48" />
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-4 w-16" />
					<Skeleton className="h-4 w-16" />
					<Skeleton className="h-4 w-16" />
					<Skeleton className="h-4 w-16" />
					<Skeleton className="h-4 w-16" />
				</div>
			))}
		</div>
	);
}

export function ImportHistoryTable() {
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

	const { data: importHistory, isLoading } = useQuery(
		orpc.transaction.importList.queryOptions({
			input: { pagination: pagination },
			placeholderData: keepPreviousData,
		}),
	);

	const table = useReactTable({
		data: (importHistory?.data || []) as FileImportRow[],
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
		return <TableSkeleton />;
	}

	const hasData = importHistory?.data && importHistory.data.length > 0;

	return (
		<>
			{hasData ? (
				<div className="flex flex-1 flex-col gap-4 overflow-hidden">
					<div className="flex-1 overflow-auto">
						<DataTable table={table} />
					</div>
					<DataTablePagination table={table} />
				</div>
			) : (
				<div className="flex flex-1 flex-col items-center justify-center text-center">
					<FileIcon className="mb-4 h-12 w-12 text-muted-foreground" />
					<h3 className="mb-2 font-semibold text-lg">No imports yet</h3>
					<p className="text-muted-foreground text-sm">
						Get started by importing your first transaction file.
					</p>
				</div>
			)}
		</>
	);
}
