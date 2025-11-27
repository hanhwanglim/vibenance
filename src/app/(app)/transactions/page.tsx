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
import { useRouter, useSearchParams } from "next/navigation";
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

function getDefaultDateRange(): DateRange {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  return { from: startOfMonth, to: today };
}

function validateDateParam(value: string | null): Date | null {
  if (!value) return null;

  try {
    const date = new Date(value);
    // Check if date is valid (not NaN)
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch {
    return null;
  }
}

function validateDateRange(from: Date | null, to: Date | null): DateRange {
  // If both are invalid, return defaults
  if (!from || !to) {
    return getDefaultDateRange();
  }

  // If to is before from, swap them
  if (to < from) {
    return { from: to, to: from };
  }

  return { from, to };
}

export default function TransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // Initialize dateRange from URL parameters or use defaults
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    const from = validateDateParam(fromParam);
    const to = validateDateParam(toParam);

    // If both params are present and valid, use them
    if (from && to) {
      return validateDateRange(from, to);
    }

    // Otherwise use defaults
    return getDefaultDateRange();
  });

  const [globalSearch, setGlobalSearch] = useState("");

  // Sync state with URL parameters when they change externally (e.g., browser back/forward)
  useEffect(() => {
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    const from = validateDateParam(fromParam);
    const to = validateDateParam(toParam);

    // Only update if URL params are different from current state
    const urlFrom = from?.toISOString();
    const urlTo = to?.toISOString();
    const currentFrom = dateRange.from?.toISOString();
    const currentTo = dateRange.to?.toISOString();

    if (urlFrom !== currentFrom || urlTo !== currentTo) {
      if (from && to) {
        const validated = validateDateRange(from, to);
        setDateRange(validated);
      } else if (!fromParam && !toParam) {
        // If both params are missing, use defaults
        setDateRange(getDefaultDateRange());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Update URL when dateRange changes (but not from URL sync)
  useEffect(() => {
    if (!dateRange.from || !dateRange.to) return;

    const params = new URLSearchParams(searchParams.toString());
    const currentFrom = params.get("from");
    const currentTo = params.get("to");
    const newFrom = dateRange.from.toISOString();
    const newTo = dateRange.to.toISOString();

    // Only update URL if it's different from current URL params
    if (currentFrom !== newFrom || currentTo !== newTo) {
      params.set("from", newFrom);
      params.set("to", newTo);
      router.replace(`?${params.toString()}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.from, dateRange.to, router]);

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
            <DataTable dateRange={dateRange} />
          </div>
        </div>
      </div>
    </div>
  );
}
