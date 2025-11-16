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
import { useState } from "react";
import { DataTable } from "./_components/data-table";
import { Transaction } from "./_components/columns";
import { columns } from "./_components/columns";

function SelectAccount({
  accounts,
  setSelectedAccount,
}: {
  accounts: { id: number; name: string }[];
  setSelectedAccount: (account: string) => void;
}) {
  return (
    <Select defaultValue="all" onValueChange={(e) => setSelectedAccount(e)}>
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

function getData(): Transaction[] {
  return [
    {
      id: "728ed52f",
      account: "Monzo",
      timestamp: "2025-01-01 12:00:00",
      name: "John Doe",
      currency: "USD",
      amount: 100,
      category: "Food",
      reference: "1234567890",
      notes: "This is a note",
    },
    {
      id: "728ed52f",
      account: "American Express",
      timestamp: "2025-01-01 12:00:00",
      name: "Jane Doe",
      currency: "EUR",
      amount: 200,
      category: "Travel",
      reference: "1234567890",
      notes: "This is a note",
    },
    {
      id: "728ed52f",
      account: "Chase",
      timestamp: "2025-01-01 12:00:00",
      name: "John Smith",
      currency: "GBP",
      amount: 100,
      category: "Food",
      reference: "1234567890",
      notes: "This is a note",
    },
  ];
}

export default function TransactionPage() {
  const [, setSelectedAccount] = useState<string>("all");
  const data = getData();

  const accounts = [
    { id: 1, name: "Monzo" },
    { id: 2, name: "American Express" },
    { id: 3, name: "Chase" },
    { id: 4, name: "Barclays" },
  ];

  return (
    <div>
      <SelectAccount
        accounts={accounts}
        setSelectedAccount={setSelectedAccount}
      />
      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
