import { useQuery } from "@tanstack/react-query";
import {
	type ColumnDef,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import type { TransactionSelect } from "@vibenance/db/schema/transaction";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatting";
import { orpc } from "@/utils/orpc";

type TransactionRow = TransactionSelect & {
	category: { name: string } | null;
	account: { name: string };
};

const columns: ColumnDef<TransactionRow>[] = [
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<Avatar className="h-8 w-8 rounded-lg grayscale">
					<AvatarFallback className="rounded-lg">
						{row.original.account.name
							.split(" ")
							.map((s) => s[0])
							.join("")}
					</AvatarFallback>
				</Avatar>
				<span>{row.original.name}</span>
			</div>
		),
	},
	{
		accessorKey: "timestamp",
		header: "Time",
		cell: ({ row }) => row.original.timestamp.toLocaleDateString(),
	},
	{
		accessorKey: "amount",
		header: "Amount",
		cell: ({ row }) =>
			formatCurrency(Number(row.original.amount), row.original.currency),
	},
];

export function RecentTransactionsTable({ className }: { className?: string }) {
	const { data: transactions } = useQuery(
		orpc.transaction.getAll.queryOptions({
			input: { pagination: { pageIndex: 0, pageSize: 10 }, type: "all" },
		}),
	);

	const table = useReactTable({
		data: (transactions?.data || []) as TransactionRow[],
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<Card className={cn(className)}>
			<CardHeader>
				<CardTitle>Recent Transactions</CardTitle>
			</CardHeader>
			<DataTable table={table} />
		</Card>
	);
}
