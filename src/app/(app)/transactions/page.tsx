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
import type { Table as TanStackTable } from "@tanstack/react-table";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { SummaryCards } from "./_components/summary-cards";
import {
  DateRangePicker,
  type DateRange,
} from "./_components/date-range-picker";
import { GlobalSearch } from "./_components/global-search";
import { BulkActions } from "./_components/bulk-actions";
import { TableToolbar } from "./_components/table-toolbar";
import { getAllTransactions } from "./_components/transaction-data";
import { Transaction } from "./_components/columns";
import { CategoryChart } from "./_components/category-chart";
import { SpendingTrendChart } from "./_components/spending-trend-chart";
import { IncomeExpensesChart } from "./_components/income-expenses-chart";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

function SelectAccount({
  accounts,
  selectedAccount,
  setSelectedAccount,
}: {
  accounts: { id: number; name: string }[];
  selectedAccount: string;
  setSelectedAccount: (account: string) => void;
}) {
  return (
    <Select value={selectedAccount} onValueChange={setSelectedAccount}>
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
  const [tableInstance, setTableInstance] =
    useState<TanStackTable<Transaction> | null>(null);

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
        // Parse timestamp and normalize to start of day for comparison
        const txnDate = new Date(txn.timestamp);
        const txnDateOnly = new Date(
          txnDate.getFullYear(),
          txnDate.getMonth(),
          txnDate.getDate(),
        );

        if (dateRange.from) {
          const fromDateOnly = new Date(
            dateRange.from.getFullYear(),
            dateRange.from.getMonth(),
            dateRange.from.getDate(),
          );
          if (txnDateOnly < fromDateOnly) return false;
        }
        if (dateRange.to) {
          const toDateOnly = new Date(
            dateRange.to.getFullYear(),
            dateRange.to.getMonth(),
            dateRange.to.getDate(),
          );
          if (txnDateOnly > toDateOnly) return false;
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
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="flex-1">
                <GlobalSearch value={globalSearch} onChange={setGlobalSearch} />
              </div>
              <DateRangePicker value={dateRange} onChange={setDateRange} />
              <SelectAccount
                accounts={accounts}
                selectedAccount={selectedAccount}
                setSelectedAccount={setSelectedAccount}
              />
              <Button variant="default" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Transaction
              </Button>
            </div>
          </div>

          {/* Summary Cards (KPIs) */}
          <SummaryCards transactions={filteredTransactions} />

          {/* Charts */}
          <div className="px-4 lg:px-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <CategoryChart transactions={filteredTransactions} />
              <SpendingTrendChart transactions={filteredTransactions} />
              <IncomeExpensesChart transactions={filteredTransactions} />
            </div>
          </div>

          {/* Data Table */}
          <div className="px-4 lg:px-6">
            {tableInstance && (
              <TableToolbar
                table={tableInstance}
                transactions={filteredTransactions}
              />
            )}
            <DataTable
              columns={columns}
              data={filteredTransactions}
              onSelectedRowsChange={setSelectedTransactions}
              onTableReady={setTableInstance}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
