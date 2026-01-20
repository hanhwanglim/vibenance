import type { Table } from "@tanstack/react-table";
import { DataTable, DataTablePagination } from "@/components/ui/data-table";
import type { TransactionRow } from "./columns";

export function TransactionTable({ table }: { table: Table<TransactionRow> }) {
	return (
		<div className="flex flex-1 flex-col gap-2 overflow-hidden">
			<div className="flex-1 overflow-auto">
				<DataTable table={table} />
			</div>
			<DataTablePagination table={table} />
		</div>
	);
}
