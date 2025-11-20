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

const accounts = [
  { id: 1, name: "Monzo" },
  { id: 2, name: "American Express" },
  { id: 3, name: "Chase" },
  { id: 4, name: "Barclays" },
];

export default function TransactionsPage() {
  const [, setSelectedAccount] = useState<string>("all");

  return (
    <div>
      <SelectAccount
        accounts={accounts}
        setSelectedAccount={setSelectedAccount}
      />
      <div className="container mx-auto py-10">
        <DataTable columns={columns} />
      </div>
    </div>
  );
}
