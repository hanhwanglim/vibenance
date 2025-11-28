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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormEvent, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AccountWithStats } from "./summary-cards";

type AccountDrawerProps = {
  account: AccountWithStats | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

const ACCOUNT_TYPES = [
  { value: "savings", label: "Savings" },
  { value: "current", label: "Current" },
  { value: "checking", label: "Checking" },
  { value: "credit_card", label: "Credit Card" },
  { value: "investment", label: "Investment" },
  { value: "loan", label: "Loan" },
  { value: "other", label: "Other" },
] as const;

const COLOR_OPTIONS = [
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "red", label: "Red" },
  { value: "orange", label: "Orange" },
  { value: "purple", label: "Purple" },
  { value: "pink", label: "Pink" },
  { value: "teal", label: "Teal" },
  { value: "gray", label: "Gray" },
] as const;

export function AccountDrawer({
  account,
  open,
  onOpenChange,
  onSuccess,
}: AccountDrawerProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("other");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [color, setColor] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const isEditing = account !== null;

  useEffect(() => {
    if (open) {
      setName(account?.name || "");
      setType(account?.type || "other");
      setAccountNumber(account?.accountNumber || "");
      setBankName(account?.bankName || "");
      setColor(account?.color || "");
    } else {
      setName("");
      setType("other");
      setAccountNumber("");
      setBankName("");
      setColor("");
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
        body: JSON.stringify({
          name: name.trim(),
          type: type || "other",
          accountNumber: accountNumber.trim() || null,
          bankName: bankName.trim() || null,
          color: color || null,
        }),
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
            ? "Update the account details below."
            : "Enter details for the new account."}
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
        <div className="grid gap-2">
          <Label htmlFor="account-type">Account Type</Label>
          <Select value={type} onValueChange={setType} disabled={loading}>
            <SelectTrigger id="account-type">
              <SelectValue placeholder="Select account type" />
            </SelectTrigger>
            <SelectContent>
              {ACCOUNT_TYPES.map((accountType) => (
                <SelectItem key={accountType.value} value={accountType.value}>
                  {accountType.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="bank-name">Bank/Institution Name (Optional)</Label>
          <Input
            id="bank-name"
            placeholder="e.g., Chase Bank, Monzo"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="account-number">Account Number (Optional)</Label>
          <Input
            id="account-number"
            placeholder="e.g., 12345678"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="account-color">Color (Optional)</Label>
          <Select value={color} onValueChange={setColor} disabled={loading}>
            <SelectTrigger id="account-color">
              <SelectValue placeholder="Select a color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {COLOR_OPTIONS.map((colorOption) => (
                <SelectItem key={colorOption.value} value={colorOption.value}>
                  {colorOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
