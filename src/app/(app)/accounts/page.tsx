"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { SummaryCards, AccountWithStats } from "./_components/summary-cards";
import { AccountCards } from "./_components/account-cards";
import { AccountDialog } from "./_components/account-dialog";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountsPage() {
  const { data: session } = useSession();
  const [accounts, setAccounts] = useState<AccountWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountWithStats | null>(
    null,
  );

  const fetchAccounts = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const response = await fetch("/api/accounts");
      const data = await response.json();

      if (response.ok) {
        // Convert date strings to Date objects
        type AccountResponse = {
          id: string;
          name: string;
          createdAt: string;
          updatedAt: string;
          transactionCount: number;
          totalBalance: number;
          lastTransactionDate: string | null;
        };
        const accountsWithDates = (data.data as AccountResponse[]).map(
          (account) => ({
            ...account,
            createdAt: new Date(account.createdAt),
            updatedAt: new Date(account.updatedAt),
            lastTransactionDate: account.lastTransactionDate
              ? new Date(account.lastTransactionDate)
              : null,
          }),
        );
        setAccounts(accountsWithDates);
      } else {
        console.error("Failed to fetch accounts:", data.error);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const handleDialogSuccess = () => {
    setDialogOpen(false);
    setEditingAccount(null);
    fetchAccounts();
  };

  const handleEdit = (account: AccountWithStats) => {
    setEditingAccount(account);
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header with Add Button */}
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Accounts</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your bank accounts and track balances
                </p>
              </div>
              <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) setEditingAccount(null);
                }}
              >
                <Button
                  onClick={() => {
                    setEditingAccount(null);
                    setDialogOpen(true);
                  }}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Account
                </Button>
                <AccountDialog
                  account={editingAccount}
                  open={dialogOpen}
                  onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) setEditingAccount(null);
                  }}
                  onSuccess={handleDialogSuccess}
                />
              </Dialog>
            </div>
          </div>

          {/* Summary Cards */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          ) : (
            <SummaryCards accounts={accounts} />
          )}

          {/* Account Cards */}
          {loading ? (
            <div className="px-4 lg:px-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
              </div>
            </div>
          ) : (
            <AccountCards
              accounts={accounts}
              onRefresh={fetchAccounts}
              onEdit={handleEdit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
