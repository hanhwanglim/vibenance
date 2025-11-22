"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type GlobalSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function GlobalSearch({
  value,
  onChange,
  placeholder = "Search transactions...",
}: GlobalSearchProps) {
  return (
    <div className="relative">
      <Label htmlFor="global-search" className="sr-only">
        Search transactions
      </Label>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id="global-search"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-9"
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
          onClick={() => onChange("")}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
