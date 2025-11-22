"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { SummaryCards } from "./_components/summary-cards";
import { DatePicker } from "./_components/date-picker";
import { GlobalSearch } from "./_components/global-search";
import { ExportButton } from "./_components/export-button";
import { BulkActions } from "./_components/bulk-actions";
import { getAllTransactions } from "./_components/transaction-data";
import { Transaction } from "./_components/columns";

function SelectAccount({
  accounts,
  setSelectedAccount,
}: {
  accounts: { id: number; name: string }[];
  setSelectedAccount: (account: string) => void;
}) {
  return (
    <Select defaultValue="all" onValueChange={(e) => setSelectedAccount(e)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Accounts" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Accounts</SelectLabel>
          <SelectItem value="all">All</SelectItem>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id.toString()}>
              {account.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

const accounts = [
  { id: 1, name: "Monzo" },
  { id: 2, name: "American Express" },
  { id: 3, name: "Chase" },
  { id: 4, name: "Barclays" },
];

export default function TransactionsPage() {
  const [selectedAccount, setSelectedAccount] = useState<string>("all");

  // Initialize date range to "This Month"
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: startOfMonth, to: today };
  });

  const [globalSearch, setGlobalSearch] = useState("");
  const [selectedTransactions, setSelectedTransactions] = useState<
    Transaction[]
  >([]);

  // Load all transactions
  const allTransactions = useMemo(() => getAllTransactions(), []);

  // Apply filters
  const filteredTransactions = useMemo(() => {
    let filtered = [...allTransactions];

    // Account filter
    if (selectedAccount !== "all") {
      const accountName = accounts.find(
        (acc) => acc.id.toString() === selectedAccount,
      )?.name;
      if (accountName) {
        filtered = filtered.filter((txn) => txn.account === accountName);
      }
    }

    // Date range filter
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter((txn) => {
        const txnDate = new Date(txn.timestamp);
        if (dateRange.from && txnDate < dateRange.from) return false;
        if (dateRange.to) {
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          if (txnDate > toDate) return false;
        }
        return true;
      });
    }

    // Global search filter
    if (globalSearch) {
      const searchLower = globalSearch.toLowerCase();
      filtered = filtered.filter((txn) => {
        return (
          txn.name.toLowerCase().includes(searchLower) ||
          txn.account.toLowerCase().includes(searchLower) ||
          txn.reference.toLowerCase().includes(searchLower) ||
          (txn.notes && txn.notes.toLowerCase().includes(searchLower)) ||
          txn.category.toLowerCase().includes(searchLower)
        );
      });
    }

    return filtered;
  }, [allTransactions, selectedAccount, dateRange, globalSearch]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Filters and Actions */}
          <div className="px-4 lg:px-6">
            <div className="flex flex-col gap-4 rounded-lg border p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                <div className="flex-1">
                  <GlobalSearch
                    value={globalSearch}
                    onChange={setGlobalSearch}
                  />
                </div>
                <DatePicker />
                <SelectAccount
                  accounts={accounts}
                  setSelectedAccount={setSelectedAccount}
                />
                <div className="flex gap-2">
                  <ExportButton transactions={filteredTransactions} />
                  <BulkActions selectedTransactions={selectedTransactions} />
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards (KPIs) */}
          <SummaryCards transactions={filteredTransactions} />

          {/* Data Table */}
          <div className="px-4 lg:px-6">
            <div className="container mx-auto py-4">
              <DataTable
                columns={columns}
                data={filteredTransactions}
                onSelectedRowsChange={setSelectedTransactions}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
