"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CSVPreviewTable } from "../_components/csv-preview-table";
import { Upload, Loader2, X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { parseFile, ParseResult } from "@/lib/parser";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type Account = {
  id: string;
  name: string;
};

export default function ImportPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setIsLoadingAccounts(true);
        const response = await fetch("/api/accounts");
        const data = await response.json();

        if (response.ok) {
          const accountsList = (data.data as Account[]).map((account) => ({
            id: account.id,
            name: account.name,
          }));
          setAccounts(accountsList);
        } else {
          console.error("Failed to fetch accounts:", data.error);
          toast.error("Failed to load accounts");
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
        toast.error("Failed to load accounts");
      } finally {
        setIsLoadingAccounts(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    setIsParsing(true);

    try {
      const result = await parseFile(file);
      setParseResult(result);
      setIsParsing(false);
    } catch (error) {
      console.error("Error parsing file:", error);
      toast.error("Failed to parse file. Please check the format.");
      setParseResult(null);
    }
  };

  const handleImport = async () => {
    if (!parseResult || !selectedAccountId) return;

    setIsImporting(true);

    try {
      const response = await fetch("/api/transactions/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId: selectedAccountId,
          format: parseResult.format,
          transactions: parseResult.transactions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to import transactions");
      }

      if (data.skipped > 0) {
        toast.success(
          `Imported ${data.imported} transaction(s), skipped ${data.skipped} duplicate(s)`,
        );
      } else {
        toast.success(`Imported ${data.imported} transaction(s)`);
      }

      router.push("/transactions");
    } catch (error) {
      console.error("Error importing transactions:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to import transactions. Please try again.",
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        {/* Header */}
        <div className="px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Link href="/transactions">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold">Import Transactions</h1>
              <p className="text-sm text-muted-foreground">
                Upload a CSV file exported from your bank to import transactions
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-6 px-4 lg:px-6">
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
            {parseResult && !isParsing && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="account-select">Select Account</Label>
                <Select
                  value={selectedAccountId}
                  onValueChange={setSelectedAccountId}
                  disabled={isLoadingAccounts}
                >
                  <SelectTrigger id="account-select" className="w-full">
                    <SelectValue placeholder="Choose an account..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Accounts</SelectLabel>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}

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
                totalRows={parseResult.count}
                validRows={parseResult.valid}
                invalidRows={parseResult.invalid}
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

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 border-t pt-4">
              <Link href="/transactions">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button
                onClick={handleImport}
                disabled={
                  !parseResult ||
                  parseResult.valid === 0 ||
                  !selectedAccountId ||
                  isParsing ||
                  isImporting
                }
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>Import Transactions</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
