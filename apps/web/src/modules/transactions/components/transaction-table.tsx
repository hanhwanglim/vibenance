import { useQuery } from "@tanstack/react-query";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import type { transaction } from "@vibenance/db/schema/transaction";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { orpc } from "@/utils/orpc";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

export function DataTable<TData, TValue>({
	columns,
	data,
}: DataTableProps<TData, TValue>) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div className="overflow-hidden rounded-md border">
			<Table>
				<TableHeader>
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
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && "selected"}
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center">
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}

type Transaction = typeof transaction.$inferSelect;

const columns: ColumnDef<Transaction>[] = [
	{
		accessorKey: "timestamp",
		header: "Time",
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
		accessorFn: (row) => {
			return row.category.name;
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

export function TransactionTable() {
	const transactions = useQuery(
		orpc.transaction.getAll.queryOptions({ input: {} }),
	);

	return (
		<div>
			<DataTable columns={columns} data={transactions.data || []} />
		</div>
	);
}
