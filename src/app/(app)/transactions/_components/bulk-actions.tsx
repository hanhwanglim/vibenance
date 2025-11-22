"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2, Tag, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Transaction } from "./columns";

type BulkActionsProps = {
  selectedTransactions: Transaction[];
  onDelete?: (ids: string[]) => void;
  onCategorize?: (ids: string[], category: string) => void;
};

export function BulkActions({
  selectedTransactions,
  onDelete,
  onCategorize,
}: BulkActionsProps) {
  const selectedCount = selectedTransactions.length;
  const hasSelection = selectedCount > 0;

  const handleDelete = () => {
    if (!onDelete) {
      toast.info("Delete functionality not implemented yet");
      return;
    }
    const ids = selectedTransactions.map((txn) => txn.id);
    onDelete(ids);
    toast.success(`Deleted ${selectedCount} transaction(s)`);
  };

  const handleCategorize = (category: string) => {
    if (!onCategorize) {
      toast.info("Categorize functionality not implemented yet");
      return;
    }
    const ids = selectedTransactions.map((txn) => txn.id);
    onCategorize(ids, category);
    toast.success(`Categorized ${selectedCount} transaction(s) as ${category}`);
  };

  if (!hasSelection) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {selectedCount} selected
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <MoreHorizontal className="h-4 w-4" />
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Categorize As</DropdownMenuLabel>
          {["Food", "Travel", "Shopping", "Bills", "Other"].map((category) => (
            <DropdownMenuItem
              key={category}
              onClick={() => handleCategorize(category)}
            >
              <Tag className="mr-2 h-4 w-4" />
              {category}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
