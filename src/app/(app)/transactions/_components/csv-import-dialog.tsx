"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CSVPreviewTable } from "./csv-preview-table";
import { parseCSVFile, type ParseResult } from "@/lib/csv-parser";
import { Transaction } from "./columns";
import { Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface CSVImportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (transactions: Transaction[]) => void;
  accounts: { id: number; name: string }[];
}

export function CSVImportDialog({
  isOpen,
  onOpenChange,
  onImport,
  accounts,
}: CSVImportDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>(
    accounts[0]?.id.toString() || "",
  );
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith(".csv") && !file.type.includes("csv")) {
      toast.error("Please select a CSV file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    setIsParsing(true);

    try {
      // Read file content
      const text = await file.text();
      const accountName =
        accounts.find((acc) => acc.id.toString() === selectedAccount)?.name ||
        "Imported";

      // Parse CSV
      const result = parseCSVFile(text, accountName);
      setParseResult(result);

      if (result.transactions.length === 0) {
        toast.error("No transactions found in CSV file");
      } else if (result.validRows === 0) {
        toast.warning(
          `Found ${result.totalRows} rows but none are valid. Please check the file format.`,
        );
      } else {
        toast.success(
          `Parsed ${result.validRows} valid transaction(s) from ${result.totalRows} row(s)`,
        );
      }
    } catch (error) {
      console.error("Error parsing CSV:", error);
      toast.error("Failed to parse CSV file. Please check the format.");
      setParseResult(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleImport = () => {
    if (!parseResult) return;

    // Filter out transactions with errors
    const validTransactions = parseResult.transactions
      .filter((p) => p.errors.length === 0)
      .map((p) => p.transaction);

    if (validTransactions.length === 0) {
      toast.error("No valid transactions to import");
      return;
    }

    // Update account for all transactions
    const accountName =
      accounts.find((acc) => acc.id.toString() === selectedAccount)?.name ||
      "Imported";
    const transactionsWithAccount = validTransactions.map((txn) => ({
      ...txn,
      account: accountName,
    }));

    onImport(transactionsWithAccount);
    toast.success(`Imported ${transactionsWithAccount.length} transaction(s)`);

    // Reset state
    handleClose();
  };

  const handleClose = () => {
    setSelectedFile(null);
    setParseResult(null);
    setIsParsing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onOpenChange(false);
  };

  const handleAccountChange = (accountId: string) => {
    setSelectedAccount(accountId);
    // Re-parse if we have a file and result
    if (selectedFile && parseResult) {
      // Re-read and parse with new account
      selectedFile.text().then((text) => {
        const accountName =
          accounts.find((acc) => acc.id.toString() === accountId)?.name ||
          "Imported";
        const result = parseCSVFile(text, accountName);
        setParseResult(result);
      });
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={handleClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Import Transactions from CSV</DrawerTitle>
          <DrawerDescription>
            Upload a CSV file exported from your bank to import transactions
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
          {/* File Selection */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="csv-file">Select CSV File</Label>
              <div className="flex items-center gap-2">
                <Input
                  ref={fileInputRef}
                  id="csv-file"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileSelect}
                  className="flex-1"
                  disabled={isParsing}
                />
                {selectedFile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedFile(null);
                      setParseResult(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Upload className="h-4 w-4" />
                  <span>{selectedFile.name}</span>
                  <span className="text-xs">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              )}
            </div>

            {/* Account Selection */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="account">Assign to Account</Label>
              <Select
                value={selectedAccount}
                onValueChange={handleAccountChange}
                disabled={!selectedFile || isParsing}
              >
                <SelectTrigger id="account">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loading State */}
          {isParsing && (
            <div className="flex items-center justify-center gap-2 py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Parsing CSV file...
              </span>
            </div>
          )}

          {/* Preview */}
          {parseResult && !isParsing && (
            <CSVPreviewTable
              transactions={parseResult.transactions}
              format={parseResult.format}
              totalRows={parseResult.totalRows}
              validRows={parseResult.validRows}
              invalidRows={parseResult.invalidRows}
            />
          )}

          {/* Instructions */}
          {!selectedFile && !isParsing && (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              <p className="font-medium mb-2">Supported formats:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Monzo CSV exports</li>
                <li>Barclays CSV exports</li>
                <li>Chase CSV exports</li>
                <li>American Express CSV exports</li>
                <li>Generic CSV format (Date, Description, Amount)</li>
              </ul>
            </div>
          )}
        </div>

        <DrawerFooter>
          <div className="flex items-center justify-between">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
            <Button
              onClick={handleImport}
              disabled={
                !parseResult || parseResult.validRows === 0 || isParsing
              }
            >
              Import {parseResult?.validRows || 0} Transaction
              {parseResult?.validRows !== 1 ? "s" : ""}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
