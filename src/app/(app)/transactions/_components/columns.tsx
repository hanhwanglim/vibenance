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
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import TransactionDrawer from "./transaction-dialog";
import { useState } from "react";

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

// Helper component for filterable column headers
function FilterableHeader({
  column,
  title,
}: {
  column: Column<Transaction>;
  title: string;
}) {
  const [inputValue, setInputValue] = useState(() => {
    return (column.getFilterValue() as string | undefined) ?? "";
  });

  return (
    <div className="flex flex-col space-y-2">
      <span>{title}</span>
      <Input
        placeholder={`Filter ${title}...`}
        value={inputValue}
        onChange={(e) => {
          const value = e.target.value;
          setInputValue(value);
          column.setFilterValue(value || undefined);
        }}
        className="h-8 w-full"
      />
    </div>
  );
}

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
  const filterValue = column.getFilterValue() as string | undefined;

  return (
    <div className="flex flex-col space-y-2">
      <span>{title}</span>
      <Select
        value={filterValue ?? "all"}
        onValueChange={(value) =>
          column.setFilterValue(value === "all" ? undefined : value)
        }
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
    header: ({ column }) => (
      <FilterableHeader column={column} title="Account" />
    ),
    enableHiding: true,
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => (
      <FilterableHeader column={column} title="Timestamp" />
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => <FilterableHeader column={column} title="Name" />,
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />;
    },
  },
  {
    accessorKey: "currency",
    header: "Currency",
    enableHiding: true,
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
    accessorKey: "reference",
    header: "Reference",
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
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.name}
        </Button>
      </DrawerTrigger>
      <TransactionDrawer item={item} isOpen={isOpen} />
    </Drawer>
  );
}
