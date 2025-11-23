"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MonzoTransaction } from "@/lib/parser";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CSVPreviewTableProps {
  transactions: MonzoTransaction[];
  format: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
}

export function CSVPreviewTable({
  transactions,
  format,
  totalRows,
  validRows,
  invalidRows,
}: CSVPreviewTableProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <div className="flex flex-col gap-2 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Import Summary</span>
          <Badge variant="outline">{format}</Badge>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total Rows:</span>
            <span className="ml-2 font-medium">{totalRows}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-muted-foreground">Valid:</span>
            <span className="font-medium text-green-600">{validRows}</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <span className="text-muted-foreground">Issues:</span>
            <span className="font-medium text-orange-600">{invalidRows}</span>
          </div>
        </div>
      </div>

      {/* Preview Table */}
      <div className="max-h-[400px] overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-12">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No transactions to preview
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => {
                return (
                  <TableRow
                    key={transaction.transactionId}
                    className={cn(transaction.errors && "bg-destructive/5")}
                  >
                    <TableCell>{transaction.transactionId}</TableCell>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>{transaction.time}</TableCell>
                    <TableCell>{transaction.type}</TableCell>
                    <TableCell>{transaction.name}</TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>{transaction.currency}</TableCell>
                    <TableCell>{transaction.amount}</TableCell>
                    <TableCell>{transaction.notes}</TableCell>
                    <TableCell>
                      {!transaction.errors ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
