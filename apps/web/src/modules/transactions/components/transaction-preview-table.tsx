import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type ColumnDef,
	getCoreRowModel,
	getPaginationRowModel,
	type Row,
	useReactTable,
} from "@tanstack/react-table";
import { transactionTypeEnumSchema } from "@vibenance/db/schema/transaction";
import type { TransactionRow } from "@vibenance/parser";
import { ChevronDownIcon } from "lucide-react";
import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DataTable, DataTablePagination } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useSkipper } from "@/hooks/use-skipper";
import { orpc } from "@/utils/orpc";
import { CategorySelect } from "./category-select";

const DateCell = React.memo(
	({
		value,
		rowIndex,
		columnId,
		updateData,
	}: {
		value: Date;
		rowIndex: number;
		columnId: string;
		updateData: (rowIndex: number, columnId: string, value: unknown) => void;
	}) => {
		const [open, setOpen] = React.useState(false);
		const [localValue, setLocalValue] = React.useState(value);

		React.useEffect(() => {
			setLocalValue(value);
		}, [value]);

		return (
			<>
				<Label htmlFor={`date-picker-${rowIndex}`} className="sr-only">
					Date
				</Label>
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							id={`date-picker-${rowIndex}`}
							className="w-32 justify-between font-normal"
						>
							{localValue.toLocaleDateString()}
							<ChevronDownIcon />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto overflow-hidden p-0" align="start">
						<Calendar
							mode="single"
							selected={localValue}
							captionLayout="dropdown"
							onSelect={(date) => {
								if (date) {
									setLocalValue(date);
									updateData(rowIndex, columnId, date);
									setOpen(false);
								}
							}}
						/>
					</PopoverContent>
				</Popover>
			</>
		);
	},
);
DateCell.displayName = "DateCell";

const TimeCell = React.memo(
	({
		value,
		rowIndex,
		columnId,
		updateData,
	}: {
		value: Date | null;
		rowIndex: number;
		columnId: string;
		updateData: (rowIndex: number, columnId: string, value: unknown) => void;
	}) => {
		const [localValue, setLocalValue] = React.useState(value);

		React.useEffect(() => {
			setLocalValue(value);
		}, [value]);

		const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const [hrs, min, sec] = e.target.value.split(":");
			const d = new Date();
			d.setHours(Number(hrs), Number(min), Number(sec), 0);
			setLocalValue(d);
		};

		const onBlur = () => {
			if (localValue) {
				updateData(rowIndex, columnId, localValue);
			}
		};

		return (
			<>
				<Label htmlFor={`time-picker-${rowIndex}`} className="sr-only">
					Time
				</Label>
				<Input
					type="time"
					id={`time-picker-${rowIndex}`}
					step="1"
					value={
						localValue
							? `${String(localValue.getHours()).padStart(2, "0")}:${String(localValue.getMinutes()).padStart(2, "0")}:${String(localValue.getSeconds()).padStart(2, "0")}`
							: ""
					}
					onBlur={onBlur}
					onChange={onChange}
					className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
				/>
			</>
		);
	},
);
TimeCell.displayName = "TimeCell";

const TypeCell = React.memo(
	({
		value,
		rowIndex,
		columnId,
		updateData,
	}: {
		value: string | null;
		rowIndex: number;
		columnId: string;
		updateData: (rowIndex: number, columnId: string, value: unknown) => void;
	}) => {
		return (
			<>
				<Label className="sr-only">Type</Label>
				<Select
					onValueChange={(newValue) =>
						updateData(
							rowIndex,
							columnId,
							newValue === "null" ? null : newValue,
						)
					}
					defaultValue={value || "null"}
				>
					<SelectTrigger className="w-45">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Type</SelectLabel>
							{transactionTypeEnumSchema.options.map((type) => (
								<SelectItem key={type} value={type}>
									{type.charAt(0).toUpperCase() + type.slice(1)}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			</>
		);
	},
);
TypeCell.displayName = "TypeCell";

const CategoryCell = React.memo(
	({
		value,
		rowIndex,
		columnId,
		updateData,
	}: {
		value: string | null;
		rowIndex: number;
		columnId: string;
		updateData: (rowIndex: number, columnId: string, value: unknown) => void;
	}) => {
		return (
			<CategorySelect
				value={value}
				onValueChange={(newValue) =>
					updateData(rowIndex, columnId, newValue === "null" ? null : newValue)
				}
			/>
		);
	},
);
CategoryCell.displayName = "CategoryCell";

const EditableCell = React.memo(
	({
		value,
		rowIndex,
		columnId,
		updateData,
	}: {
		value: unknown;
		rowIndex: number;
		columnId: string;
		updateData: (rowIndex: number, columnId: string, value: unknown) => void;
	}) => {
		const [localValue, setLocalValue] = React.useState(value);

		React.useEffect(() => {
			setLocalValue(value);
		}, [value]);

		const onBlur = () => {
			updateData(rowIndex, columnId, localValue);
		};

		return (
			<Input
				value={String(localValue ?? "")}
				onChange={(e) => setLocalValue(e.target.value)}
				onBlur={onBlur}
			/>
		);
	},
);
EditableCell.displayName = "EditableCell";

export function TransactionPreviewTable({ data }: { data: TransactionRow[] }) {
	const queryClient = useQueryClient();
	const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

	useQuery(orpc.transaction.listCategories.queryOptions());

	const updateData = React.useCallback(
		(rowIndex: number, columnId: string, value: unknown) => {
			skipAutoResetPageIndex();
			queryClient.setQueryData(
				["import-transaction", "data"],
				(old: Row<TransactionRow>[]) =>
					old.map((row, index: number) => {
						if (index === rowIndex) {
							return { ...old[rowIndex], [columnId]: value };
						}
						return row;
					}),
			);
		},
		[queryClient, skipAutoResetPageIndex],
	);

	const columns = useMemo<ColumnDef<TransactionRow>[]>(
		() => [
			{
				accessorKey: "date",
				header: "Date",
				cell: ({ getValue, row: { index }, column: { id } }) => {
					const value = getValue() as Date;
					return (
						<DateCell
							value={value}
							rowIndex={index}
							columnId={id}
							updateData={updateData}
						/>
					);
				},
			},
			{
				accessorKey: "time",
				header: "Time",
				cell: ({ getValue, row: { index }, column: { id } }) => {
					const value = getValue() as Date | null;
					return (
						<TimeCell
							value={value}
							rowIndex={index}
							columnId={id}
							updateData={updateData}
						/>
					);
				},
			},
			{
				accessorKey: "name",
				header: "Name",
				cell: ({ getValue, row: { index }, column: { id } }) => {
					const value = getValue();
					return (
						<EditableCell
							value={value}
							rowIndex={index}
							columnId={id}
							updateData={updateData}
						/>
					);
				},
			},
			{
				accessorKey: "currency",
				header: "Currency",
				cell: ({ getValue, row: { index }, column: { id } }) => {
					const value = getValue();
					return (
						<EditableCell
							value={value}
							rowIndex={index}
							columnId={id}
							updateData={updateData}
						/>
					);
				},
			},
			{
				accessorKey: "amount",
				header: "Amount",
				cell: ({ getValue, row: { index }, column: { id } }) => {
					const value = getValue();
					return (
						<EditableCell
							value={value}
							rowIndex={index}
							columnId={id}
							updateData={updateData}
						/>
					);
				},
			},
			{
				accessorKey: "type",
				header: "Type",
				cell: ({ getValue, row: { index }, column: { id } }) => {
					const value = getValue() as string | null;
					return (
						<TypeCell
							value={value}
							rowIndex={index}
							columnId={id}
							updateData={updateData}
						/>
					);
				},
			},
			{
				accessorKey: "categoryId",
				header: "Category",
				cell: ({ getValue, row: { index }, column: { id } }) => {
					const value = getValue() as string | null;
					return (
						<CategoryCell
							value={value}
							rowIndex={index}
							columnId={id}
							updateData={updateData}
						/>
					);
				},
			},
			{
				accessorKey: "reference",
				header: "Reference",
				cell: ({ getValue, row: { index }, column: { id } }) => {
					const value = getValue();
					return (
						<EditableCell
							value={value}
							rowIndex={index}
							columnId={id}
							updateData={updateData}
						/>
					);
				},
			},
		],
		[updateData],
	);

	const table = useReactTable({
		data: data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		autoResetPageIndex,
	});

	return (
		<div className="flex flex-col gap-2 px-4">
			<DataTable table={table} />
			<DataTablePagination table={table} />
		</div>
	);
}
