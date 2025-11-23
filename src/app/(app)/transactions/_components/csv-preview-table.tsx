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
import { ParsedTransaction } from "@/lib/csv-parser";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CSVPreviewTableProps {
  transactions: ParsedTransaction[];
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
              <TableHead className="w-12">Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Issues</TableHead>
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
              transactions.map((parsed) => {
                const { transaction, errors, warnings } = parsed;
                const hasErrors = errors.length > 0;
                const hasWarnings = warnings.length > 0;

                return (
                  <TableRow
                    key={transaction.id}
                    className={cn(
                      hasErrors && "bg-destructive/5",
                      hasWarnings &&
                        !hasErrors &&
                        "bg-orange-50 dark:bg-orange-950/10",
                    )}
                  >
                    <TableCell>
                      {hasErrors ? (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      ) : hasWarnings ? (
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {transaction.timestamp.split(" ")[0]}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {transaction.name || (
                        <span className="text-muted-foreground italic">
                          Missing name
                        </span>
                      )}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "font-medium",
                        transaction.amount >= 0
                          ? "text-green-600"
                          : "text-red-600",
                      )}
                    >
                      {transaction.currency} {transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {transaction.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {transaction.account}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      {errors.length > 0 && (
                        <div className="flex flex-col gap-1">
                          {errors.map((error, i) => (
                            <span
                              key={i}
                              className="text-xs text-destructive"
                              title={error}
                            >
                              {error}
                            </span>
                          ))}
                        </div>
                      )}
                      {warnings.length > 0 && errors.length === 0 && (
                        <div className="flex flex-col gap-1">
                          {warnings.map((warning, i) => (
                            <span
                              key={i}
                              className="text-xs text-orange-600"
                              title={warning}
                            >
                              {warning}
                            </span>
                          ))}
                        </div>
                      )}
                      {errors.length === 0 && warnings.length === 0 && (
                        <span className="text-xs text-muted-foreground">
                          OK
                        </span>
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
