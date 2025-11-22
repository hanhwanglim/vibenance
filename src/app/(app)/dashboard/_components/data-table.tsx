"use client";

import {
  flexRender,
  getCoreRowModel,
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
import { useState, useMemo } from "react";
import { columns, Transaction } from "./columns";

function getData(pagination: { pageIndex: number; pageSize: number }): {
  data: Transaction[];
  rowCount: number;
} {
  const data = [
    {
      id: "txn-001",
      account: "Monzo",
      timestamp: "2025-01-15 14:32:00",
      name: "Starbucks Coffee",
      currency: "GBP",
      amount: -4.5,
      category: "Food",
      reference: "TXN-2025-001",
      notes: "Morning coffee",
    },
    {
      id: "txn-002",
      account: "Chase",
      timestamp: "2025-01-14 18:45:00",
      name: "Amazon Prime",
      currency: "USD",
      amount: -12.99,
      category: "Shopping",
      reference: "TXN-2025-002",
      notes: "Monthly subscription",
    },
    {
      id: "txn-003",
      account: "American Express",
      timestamp: "2025-01-13 20:15:00",
      name: "Uber Ride",
      currency: "USD",
      amount: -28.5,
      category: "Travel",
      reference: "TXN-2025-003",
      notes: "Airport transfer",
    },
    {
      id: "txn-004",
      account: "Monzo",
      timestamp: "2025-01-12 12:00:00",
      name: "Salary Deposit",
      currency: "GBP",
      amount: 3500.0,
      category: "Other",
      reference: "SAL-2025-001",
      notes: "Monthly salary",
    },
    {
      id: "txn-005",
      account: "Barclays",
      timestamp: "2025-01-11 09:30:00",
      name: "Electricity Bill",
      currency: "GBP",
      amount: -85.2,
      category: "Bills",
      reference: "BILL-2025-001",
      notes: "January bill",
    },
    {
      id: "txn-006",
      account: "Chase",
      timestamp: "2025-01-10 19:22:00",
      name: "Netflix Subscription",
      currency: "USD",
      amount: -15.99,
      category: "Shopping",
      reference: "TXN-2025-006",
      notes: "Monthly plan",
    },
    {
      id: "txn-007",
      account: "Monzo",
      timestamp: "2025-01-09 13:45:00",
      name: "Tesco Supermarket",
      currency: "GBP",
      amount: -67.89,
      category: "Food",
      reference: "TXN-2025-007",
      notes: "Weekly groceries",
    },
    {
      id: "txn-008",
      account: "American Express",
      timestamp: "2025-01-08 16:10:00",
      name: "Hotel Booking",
      currency: "EUR",
      amount: -245.0,
      category: "Travel",
      reference: "TXN-2025-008",
      notes: "Paris trip",
    },
    {
      id: "txn-009",
      account: "Chase",
      timestamp: "2025-01-07 11:20:00",
      name: "Spotify Premium",
      currency: "USD",
      amount: -9.99,
      category: "Shopping",
      reference: "TXN-2025-009",
      notes: "Monthly subscription",
    },
    {
      id: "txn-010",
      account: "Barclays",
      timestamp: "2025-01-06 08:15:00",
      name: "Water Bill",
      currency: "GBP",
      amount: -42.5,
      category: "Bills",
      reference: "BILL-2025-002",
      notes: "Quarterly payment",
    },
    {
      id: "txn-011",
      account: "Monzo",
      timestamp: "2025-01-05 20:30:00",
      name: "Restaurant Dinner",
      currency: "GBP",
      amount: -89.5,
      category: "Food",
      reference: "TXN-2025-011",
      notes: "Birthday celebration",
    },
    {
      id: "txn-012",
      account: "Chase",
      timestamp: "2025-01-04 14:00:00",
      name: "Flight Ticket",
      currency: "USD",
      amount: -450.0,
      category: "Travel",
      reference: "TXN-2025-012",
      notes: "New York trip",
    },
    {
      id: "txn-013",
      account: "American Express",
      timestamp: "2025-01-03 10:45:00",
      name: "Gym Membership",
      currency: "USD",
      amount: -49.99,
      category: "Other",
      reference: "TXN-2025-013",
      notes: "Monthly fee",
    },
    {
      id: "txn-014",
      account: "Monzo",
      timestamp: "2025-01-02 17:30:00",
      name: "Coffee Shop",
      currency: "GBP",
      amount: -5.75,
      category: "Food",
      reference: "TXN-2025-014",
      notes: "Afternoon break",
    },
    {
      id: "txn-015",
      account: "Barclays",
      timestamp: "2025-01-01 09:00:00",
      name: "Internet Bill",
      currency: "GBP",
      amount: -29.99,
      category: "Bills",
      reference: "BILL-2025-003",
      notes: "Monthly broadband",
    },
    {
      id: "txn-016",
      account: "Chase",
      timestamp: "2024-12-31 21:00:00",
      name: "New Year's Eve Dinner",
      currency: "USD",
      amount: -125.0,
      category: "Food",
      reference: "TXN-2024-999",
      notes: "Celebration dinner",
    },
    {
      id: "txn-017",
      account: "Monzo",
      timestamp: "2024-12-30 15:20:00",
      name: "Bookstore Purchase",
      currency: "GBP",
      amount: -24.99,
      category: "Shopping",
      reference: "TXN-2024-998",
      notes: "Technical books",
    },
    {
      id: "txn-018",
      account: "American Express",
      timestamp: "2024-12-29 11:10:00",
      name: "Train Ticket",
      currency: "EUR",
      amount: -78.5,
      category: "Travel",
      reference: "TXN-2024-997",
      notes: "London to Paris",
    },
    {
      id: "txn-019",
      account: "Chase",
      timestamp: "2024-12-28 16:45:00",
      name: "Freelance Payment",
      currency: "USD",
      amount: 1200.0,
      category: "Other",
      reference: "INV-2024-001",
      notes: "Web development project",
    },
    {
      id: "txn-020",
      account: "Barclays",
      timestamp: "2024-12-27 08:30:00",
      name: "Gas Bill",
      currency: "GBP",
      amount: -95.6,
      category: "Bills",
      reference: "BILL-2024-999",
      notes: "December bill",
    },
  ];

  const start = pagination.pageIndex * pagination.pageSize;
  const end = start + pagination.pageSize;

  return {
    data: data.slice(start, end),
    rowCount: data.length,
  };
}

export function DataTable() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, rowCount } = useMemo(() => getData(pagination), [pagination]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),

    manualPagination: true,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    rowCount: rowCount,

    state: {
      pagination,
    },
  });

  return (
    <div className="border rounded-lg bg-card">
      <div className="p-6 pb-4">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <span className="text-sm text-muted-foreground">
          Last month&apos;s transactions
        </span>
      </div>
      <div className="mx-6 mb-6 overflow-hidden rounded-lg border">
        <div>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-muted/50 hover:bg-muted/50"
                >
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="h-12 font-semibold">
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
                  <TableRow key={row.id} className="hover:bg-muted/30">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
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
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-3">
          <div className="flex w-full items-center gap-8 lg:w-fit lg:ml-auto">
            <div className="hidden items-center gap-2 lg:flex">
              <Label
                htmlFor="rows-per-page"
                className="text-sm font-medium text-muted-foreground"
              >
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
              <div className="flex w-fit items-center justify-center text-sm text-muted-foreground">
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
