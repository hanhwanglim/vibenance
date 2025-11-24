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
import { useState, useEffect } from "react";
import type { Table as TanStackTable } from "@tanstack/react-table";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { SummaryCards } from "./_components/summary-cards";
import {
  DateRangePicker,
  type DateRange,
} from "./_components/date-range-picker";
import { GlobalSearch } from "./_components/global-search";
import { TableToolbar } from "./_components/table-toolbar";
import { Transaction } from "./_components/columns";
import { CategoryChart } from "./_components/category-chart";
import { SpendingTrendChart } from "./_components/spending-trend-chart";
import { IncomeExpensesChart } from "./_components/income-expenses-chart";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Upload, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

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
  const router = useRouter();
  const { data: session } = useSession();

  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: startOfMonth, to: today };
  });

  const [globalSearch, setGlobalSearch] = useState("");
  const [tableInstance, setTableInstance] =
    useState<TanStackTable<Transaction> | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!session?.user?.id) return;

    fetch(
      `/api/transactions?from=${dateRange.from!.toISOString()}&to=${dateRange.to!.toISOString()}`,
    )
      .then((response) => response.json())
      .then((data) => setTransactions(data))
      .catch((error) => console.error("Failed to fetch transactions:", error));
  }, [session?.user?.id, dateRange]);

  console.log(transactions);

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
                selectedAccount="all"
                setSelectedAccount={() => {}}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Transaction
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => router.push("/transactions/import")}
                  >
                    <Upload className="h-4 w-4" />
                    Import CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Plus className="h-4 w-4" />
                    Add Manually
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Summary Cards (KPIs) */}
          <SummaryCards transactions={[]} />

          {/* Charts */}
          <div className="px-4 lg:px-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <CategoryChart transactions={[]} />
              <SpendingTrendChart transactions={[]} />
              <IncomeExpensesChart transactions={[]} />
            </div>
          </div>

          {/* Data Table */}
          <div className="px-4 lg:px-6">
            {tableInstance && (
              <TableToolbar table={tableInstance} transactions={transactions} />
            )}
            <DataTable
              columns={columns}
              data={transactions}
              onTableReady={setTableInstance}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
