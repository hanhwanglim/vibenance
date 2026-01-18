import { flexRender, type Table as TanstackTable } from "@tanstack/react-table";
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData> extends React.ComponentProps<"div"> {
	table: TanstackTable<TData>;
	actionBar?: React.ReactNode;
}

export function DataTable<TData>({ table }: DataTableProps<TData>) {
	return (
		<div className="flex h-full flex-col overflow-hidden rounded-md border">
			<div className="relative flex-1 overflow-auto">
				<Table>
					<TableHeader className="sticky top-0 z-10 bg-background">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody className="[&_tr:last-child]:!border-b">
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={table.getAllColumns().length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}

interface DataTablePaginationProps<TData> extends React.ComponentProps<"div"> {
	table: TanstackTable<TData>;
	pageSizeOptions?: number[];
}

export function DataTablePagination<TData>({
	table,
	pageSizeOptions = [10, 20, 50, 100, 200],
}: DataTablePaginationProps<TData>) {
	return (
		<div className="flex items-center justify-between px-4">
			{table.getFilteredSelectedRowModel().rows.length > 0 ? (
				<div className="hidden flex-1 text-muted-foreground text-sm lg:flex">
					{table.getFilteredSelectedRowModel().rows.length} of&nbsp;
					{table.getFilteredRowModel().rows.length} row(s) selected.
				</div>
			) : (
				<div />
			)}
			<div className="flex w-full items-center gap-8 lg:w-fit">
				<div className="hidden items-center gap-2 lg:flex">
					<Label htmlFor="rows-per-page" className="font-medium text-sm">
						Rows per page
					</Label>
					<Select
						value={`${table.getState().pagination.pageSize}`}
						onValueChange={(value) => {
							table.setPageSize(Number(value));
						}}
					>
						<SelectTrigger size="sm" className="w-20" id="rows-per-page">
							<SelectValue placeholder={table.getState().pagination.pageSize} />
						</SelectTrigger>
						<SelectContent side="top">
							{pageSizeOptions.map((pageSize) => (
								<SelectItem key={pageSize} value={`${pageSize}`}>
									{pageSize}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="ml-auto flex items-center gap-2 lg:ml-0">
					<Button
						variant="outline"
						className="hidden h-8 w-8 p-0 lg:flex"
						onClick={() => table.setPageIndex(0)}
						disabled={!table.getCanPreviousPage()}
					>
						<span className="sr-only">Go to first page</span>
						<ChevronsLeft />
					</Button>
					<Button
						variant="outline"
						className="size-8"
						size="icon"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						<span className="sr-only">Go to previous page</span>
						<ChevronLeft />
					</Button>
					<div className="flex w-fit items-center justify-center font-medium text-sm">
						Page {table.getState().pagination.pageIndex + 1} of&nbsp;
						{table.getPageCount()}
					</div>
					<Button
						variant="outline"
						className="size-8"
						size="icon"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						<span className="sr-only">Go to next page</span>
						<ChevronRight />
					</Button>
					<Button
						variant="outline"
						className="hidden size-8 lg:flex"
						size="icon"
						onClick={() => table.setPageIndex(table.getPageCount() - 1)}
						disabled={!table.getCanNextPage()}
					>
						<span className="sr-only">Go to last page</span>
						<ChevronsRight />
					</Button>
				</div>
			</div>
		</div>
	);
}
