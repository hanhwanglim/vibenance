"use client";

import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormEvent, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AccountWithStats } from "./summary-cards";

type AccountDialogProps = {
  account: AccountWithStats | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function AccountDialog({
  account,
  open,
  onOpenChange,
  onSuccess,
}: AccountDialogProps) {
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
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit Account" : "Add New Account"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update the account name below."
            : "Enter a name for the new account."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        <DialogFooter>
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
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
