"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Eye, Plus } from "lucide-react";
import { Table } from "@tanstack/react-table";
import { Transaction } from "./columns";
import { toast } from "sonner";
import { BulkActions } from "./bulk-actions";

type TableToolbarProps = {
  table: Table<Transaction>;
  transactions: Transaction[];
};

export function TableToolbar({ table, transactions }: TableToolbarProps) {
  const exportToCSV = () => {
    if (transactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }

    // Flatten transactions including sub-transactions
    const allTransactions = transactions.flatMap((txn) => {
      const result = [txn];
      if (txn.subTransactions) {
        result.push(...txn.subTransactions);
      }
      return result;
    });

    // Define CSV headers
    const headers = [
      "ID",
      "Account",
      "Timestamp",
      "Name",
      "Currency",
      "Amount",
      "Category",
      "Reference",
      "Notes",
    ];

    // Convert transactions to CSV rows
    const rows = allTransactions.map((txn) => [
      txn.id,
      txn.account,
      txn.timestamp,
      txn.name,
      txn.currency,
      txn.amount.toString(),
      txn.category,
      txn.reference,
      txn.notes || "",
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `transactions-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${allTransactions.length} transactions`);
  };

  return (
    <div className="flex items-center justify-between gap-2 py-4">
      <div className="flex gap-2">
        <BulkActions selectedTransactions={transactions} />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={exportToCSV} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Eye className="h-4 w-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
