import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
	getCoreRowModel,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";
import type { DateRange } from "@/types";
import { orpc } from "@/utils/orpc";
import { transactionColumns } from "../components/transaction-table/columns";

export function useTransactionTable(
	dateRange: DateRange | undefined,
	type: "all" | "income" | "expenses",
) {
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
	const [columns] = useState(() => [...transactionColumns()]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
		Type: false,
		Account: false,
	});

	const { data } = useQuery(
		orpc.transaction.getAll.queryOptions({
			input: { pagination: pagination, type: type, dateRange: dateRange },
			placeholderData: keepPreviousData,
		}),
	);

	const table = useReactTable({
		data: data?.data || [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		onPaginationChange: setPagination,
		onColumnVisibilityChange: setColumnVisibility,
		rowCount: data?.count || 0,
		state: {
			pagination,
			columnVisibility,
		},
	});

	return table;
}
