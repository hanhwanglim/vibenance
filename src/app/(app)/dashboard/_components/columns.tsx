"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatter";

export type Transaction = {
  id: string;
  account: string;
  timestamp: string;
  name: string;
  currency: string;
  amount: number;
  category: string;
  reference: string;
  notes: string;
  subTransactions?: Transaction[];
};

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "timestamp",
    header: "Date",
    cell: ({ row }) => {
      return (
        <span className="text-muted-foreground">
          {new Date(row.original.timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Transaction",
    cell: ({ row }) => {
      return <span className="font-medium">{row.original.name}</span>;
    },
  },
  {
    accessorKey: "account",
    header: "Account",
    cell: ({ row }) => {
      return (
        <span className="text-muted-foreground">{row.original.account}</span>
      );
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = row.original.amount;
      const isNegative = amount < 0;
      return (
        <div className="text-right">
          <span
            className={`font-medium ${isNegative ? "text-destructive" : "text-green-500"}`}
          >
            {formatCurrency(amount, row.original.currency)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="font-normal">
          {row.original.category}
        </Badge>
      );
    },
  },
];
