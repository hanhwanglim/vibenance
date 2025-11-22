"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Fragment } from "react/jsx-runtime";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ChevronsLeft,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { columns, Transaction } from "./columns";

function getData(
  pagination: { pageIndex: number; pageSize: number },
  columnFilters: ColumnFiltersState,
): { data: Transaction[]; rowCount: number } {
  const data = [
    {
      id: "728ed52f",
      account: "Monzo",
      timestamp: "2025-01-01 12:00:00",
      name: "John Doe",
      currency: "USD",
      amount: 100,
      category: "Food",
      reference: "1234567890",
      notes: "This is a note",
    },
    {
      id: "728ed52f",
      account: "American Express",
      timestamp: "2025-01-01 12:00:00",
      name: "Jane Doe",
      currency: "EUR",
      amount: 200,
      category: "Travel",
      reference: "1234567890",
      notes: "This is a note",
      subTransactions: [
        {
          id: "728e8973",
          account: "Chase",
          timestamp: "2025-01-01 12:00:00",
          name: "John Doe",
          currency: "GBP",
          amount: 100,
          category: "Food",
          reference: "1234567890",
          notes: "This is a note",
        },
        {
          id: "728e8567",
          account: "Chase",
          timestamp: "2025-01-01 12:00:00",
          name: "John Cat",
          currency: "GBP",
          amount: 100,
          category: "Food",
          reference: "1234567890",
          notes: "This is a note",
        },
      ],
    },
    {
      id: "728ed52f",
      account: "Chase",
      timestamp: "2025-01-01 12:00:00",
      name: "John Smith",
      currency: "GBP",
      amount: 100,
      category: "Food",
      reference: "1234567890",
      notes: "This is a note",
      subTransactions: [
        {
          id: "728e8973",
          account: "Chase",
          timestamp: "2025-01-01 12:00:00",
          name: "John Doe",
          currency: "GBP",
          amount: 100,
          category: "Food",
          reference: "1234567890",
          notes: "This is a note",
        },
        {
          id: "728e8567",
          account: "Chase",
          timestamp: "2025-01-01 12:00:00",
          name: "John Cat",
          currency: "GBP",
          amount: 100,
          category: "Food",
          reference: "1234567890",
          notes: "This is a note",
        },
      ],
    },
  ];

  let filteredData = data;

  columnFilters.forEach((filter) => {
    if (!filter.value) return;

    filteredData = filteredData.filter((row: Transaction) => {
      const value = row[filter.id as keyof Transaction];
      if (typeof value !== "string" && value === filter.value) return true;
      return String(value)
        .toLowerCase()
        .includes(String(filter.value).toLowerCase());
    });
  });

  const start = pagination.pageIndex * pagination.pageSize;
  const end = start + pagination.pageSize;

  return {
    data: filteredData.slice(start, end),
    rowCount: filteredData.length,
  };
}

export function DataTable() {
  "use no memo";

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const { data, rowCount } = useMemo(
    () => getData(pagination, columnFilters),
    [pagination, columnFilters],
  );

  // Reset to first page when filters change
  useEffect(() => {
    setPagination((prev) => ({
      pageIndex: 0,
      pageSize: prev.pageSize,
    }));
  }, [columnFilters]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSubRows: (row) => row.subTransactions,

    manualPagination: true,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    rowCount: rowCount,

    manualFiltering: true,
    onColumnFiltersChange: setColumnFilters,

    getExpandedRowModel: getExpandedRowModel(),

    state: {
      columnFilters,
      pagination,
    },
  });

  return (
    <div className="p-4 border rounded-2xl">
      <div className="pb-4">
        <h3 className="text-md font-semibold">Recent Transactions</h3>
        <span className="text-sm text-gray-500">
          Last month&apos;s transactions
        </span>
      </div>
      <div className="overflow-hidden rounded-md border">
        <div>
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
                  <Fragment key={row.id}>
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
                  </Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 50, 100, 200].map((pageSize) => (
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
              <div className="flex w-fit items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
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
      </div>
    </div>
  );
}
