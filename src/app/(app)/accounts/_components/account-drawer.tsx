"use client";

import { Button } from "@/components/ui/button";
import {
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormEvent, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export type AccountWithStats = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  transactionCount: number;
  totalBalance: number;
  lastTransactionDate: Date | null;
};

type AccountDrawerProps = {
  account: AccountWithStats | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function AccountDrawer({
  account,
  open,
  onOpenChange,
  onSuccess,
}: AccountDrawerProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const isEditing = account !== null;

  useEffect(() => {
    if (open) {
      setName(account?.name || "");
    } else {
      setName("");
    }
  }, [open, account]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditing ? `/api/accounts/${account.id}` : "/api/accounts";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save account");
      }

      toast.success(
        isEditing
          ? "Account updated successfully"
          : "Account created successfully",
      );
      onOpenChange(false);
      onSuccess();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to save account";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DrawerContent className="flex flex-col">
      <DrawerHeader className="gap-3 relative pb-4 shrink-0">
        <DrawerTitle>
          {isEditing ? "Edit Account" : "Add New Account"}
        </DrawerTitle>
        <DrawerDescription>
          {isEditing
            ? "Update the account name below."
            : "Enter a name for the new account."}
        </DrawerDescription>
      </DrawerHeader>
      <form onSubmit={handleSubmit} className="px-4 pb-4 flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="account-name">Account Name</Label>
          <Input
            id="account-name"
            placeholder="e.g., Monzo, Chase, American Express"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
            autoFocus
          />
        </div>
        <DrawerFooter className="pt-4 shrink-0">
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Update Account"
              ) : (
                "Create Account"
              )}
            </Button>
          </div>
        </DrawerFooter>
      </form>
    </DrawerContent>
  );
}
