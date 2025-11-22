"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Transaction } from "./columns";
import { toast } from "sonner";

type ExportButtonProps = {
  transactions: Transaction[];
  filename?: string;
};

export function ExportButton({
  transactions,
  filename = "transactions",
}: ExportButtonProps) {
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
      `${filename}-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${allTransactions.length} transactions`);
  };

  return (
    <Button variant="outline" onClick={exportToCSV} className="gap-2">
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  );
}
