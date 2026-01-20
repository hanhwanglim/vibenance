import type { Column, Table } from "@tanstack/react-table";
import { ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TransactionRow } from "./columns";

export function ColumnVisibilityControl({
	table,
}: {
	table: Table<TransactionRow>;
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm">
					<ListFilter />
					<span className="hidden lg:inline">Customize Columns</span>
					<span className="lg:hidden">Columns</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuCheckboxItem
					className="capitalize"
					checked={table.getIsAllColumnsVisible()}
					onCheckedChange={(value) => {
						table.toggleAllColumnsVisible(!!value);
					}}
				>
					Toggle All
				</DropdownMenuCheckboxItem>
				{table
					.getAllLeafColumns()
					.filter((column: Column<TransactionRow>) => column.getCanHide())
					.map((column: Column<TransactionRow>) => (
						<DropdownMenuCheckboxItem
							key={column.id}
							className="capitalize"
							checked={column.getIsVisible()}
							onCheckedChange={(value) => {
								column.toggleVisibility(!!value);
							}}
						>
							{column.id}
						</DropdownMenuCheckboxItem>
					))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
