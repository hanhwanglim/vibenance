"use client";

import { Column, ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, Filter, X } from "lucide-react";
import { toast } from "sonner";
import TransactionDrawer from "./transaction-dialog";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type Transaction = {
  id: string;
  account: string;
  timestamp: string;
  name: string;
  currency: string;
  amount: number;
  category: string;
  reference: string;
  notes: string;
  subTransactions?: Transaction[];
};

// Helper component for selectable filter headers
function SelectableFilterHeader({
  column,
  title,
  options,
}: {
  column: Column<Transaction>;
  title: string;
  options: { value: string; label: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const filterValue = column.getFilterValue() as string | undefined;
  const isFiltered = !!filterValue;
  const selectedLabel = options.find((opt) => opt.value === filterValue)?.label;

  return (
    <div className="flex items-center gap-2">
      <span>{title}</span>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn(
              "h-8 w-8",
              isFiltered && "bg-accent text-accent-foreground",
            )}
          >
            <Filter className="h-4 w-4" />
            <span className="sr-only">Filter {title}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="start">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Filter {title}</Label>
              {isFiltered && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-6 w-6"
                  onClick={() => {
                    column.setFilterValue(undefined);
                  }}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Clear filter</span>
                </Button>
              )}
            </div>
            <Select
              value={filterValue ?? "all"}
              onValueChange={(value) => {
                column.setFilterValue(value === "all" ? undefined : value);
              }}
            >
              <SelectTrigger className="h-8 w-full">
                <SelectValue placeholder={`All ${title}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {title}</SelectItem>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isFiltered && selectedLabel && (
              <div className="text-xs text-muted-foreground">
                Selected: {selectedLabel}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export const columns: ColumnDef<Transaction>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => {
      return (
        <div
          className="flex items-center justify-center"
          style={{ paddingLeft: `${row.depth * 4}rem` }}
        >
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "account",
    header: "Account",
    enableHiding: true,
  },
  {
    accessorKey: "timestamp",
    header: "Timestamp",
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />;
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <SelectableFilterHeader
        column={column}
        title="Category"
        options={[
          { value: "Food", label: "Food" },
          { value: "Travel", label: "Travel" },
          { value: "Shopping", label: "Shopping" },
          { value: "Bills", label: "Bills" },
          { value: "Other", label: "Other" },
        ]}
      />
    ),
    enableHiding: true,
  },
  {
    accessorKey: "notes",
    header: "Notes",
    enableHiding: true,
    cell: ({ row }) => (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          console.log("Saving notes", row.original.notes);
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
            loading: `Saving ${row.original.notes}`,
            success: "Done",
            error: "Error",
          });
        }}
      >
        <Label htmlFor={`${row.original.id}-notes`} className="sr-only">
          Notes
        </Label>
        <Input
          className="hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30 h-8 w-16 border-transparent bg-transparent text-right shadow-none focus-visible:border dark:bg-transparent"
          defaultValue={row.original.notes}
          id={`${row.original.id}-notes`}
        />
      </form>
    ),
  },
  {
    id: "expand",
    cell: ({ row }) => {
      return row.getCanExpand() ? (
        <button
          onClick={row.getToggleExpandedHandler()}
          style={{ cursor: "pointer" }}
        >
          {row.getIsExpanded() ? <ChevronUp /> : <ChevronDown />}
        </button>
      ) : null;
    },
  },
];

function TableCellViewer({ item }: { item: Transaction }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="link"
          className="text-foreground w-fit px-0 text-left underline hover:cursor-pointer"
        >
          {item.name}
        </Button>
      </DrawerTrigger>
      <TransactionDrawer item={item} />
    </Drawer>
  );
}
