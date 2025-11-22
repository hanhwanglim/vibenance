"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, X } from "lucide-react";
import { useState, useEffect } from "react";

export type DateRange = {
  from: Date | null;
  to: Date | null;
};

type DateRangePickerProps = {
  value: DateRange;
  onChange: (range: DateRange) => void;
};

const QUICK_RANGES = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
  { value: "last30", label: "Last 30 Days" },
  { value: "last90", label: "Last 90 Days" },
  { value: "custom", label: "Custom Range" },
] as const;

function getQuickRangeDates(range: string): DateRange {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (range) {
    case "today":
      return { from: today, to: today };
    case "week": {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      return { from: startOfWeek, to: today };
    }
    case "month": {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: startOfMonth, to: today };
    }
    case "year": {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      return { from: startOfYear, to: today };
    }
    case "last30": {
      const date = new Date(today);
      date.setDate(date.getDate() - 30);
      return { from: date, to: today };
    }
    case "last90": {
      const date = new Date(today);
      date.setDate(date.getDate() - 90);
      return { from: date, to: today };
    }
    default:
      return { from: null, to: null };
  }
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [quickRange, setQuickRange] = useState<string>("month");
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    if (!isCustom && quickRange !== "custom") {
      const dates = getQuickRangeDates(quickRange);
      onChange(dates);
    }
  }, [quickRange, isCustom, onChange]);

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleFromChange = (dateString: string) => {
    const date = dateString ? new Date(dateString) : null;
    setIsCustom(true);
    setQuickRange("custom");
    onChange({ ...value, from: date });
  };

  const handleToChange = (dateString: string) => {
    const date = dateString ? new Date(dateString) : null;
    setIsCustom(true);
    setQuickRange("custom");
    onChange({ ...value, to: date });
  };

  const handleQuickRangeChange = (range: string) => {
    setQuickRange(range);
    if (range === "custom") {
      setIsCustom(true);
    } else {
      setIsCustom(false);
      const dates = getQuickRangeDates(range);
      onChange(dates);
    }
  };

  const clearDates = () => {
    setQuickRange("month");
    setIsCustom(false);
    onChange({ from: null, to: null });
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <Label className="text-sm font-medium">Date Range</Label>
        {(value.from || value.to) && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-6 w-6 p-0"
            onClick={clearDates}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <Select value={quickRange} onValueChange={handleQuickRangeChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select date range" />
        </SelectTrigger>
        <SelectContent>
          {QUICK_RANGES.map((range) => (
            <SelectItem key={range.value} value={range.value}>
              {range.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isCustom && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="from-date" className="text-xs">
              From
            </Label>
            <Input
              id="from-date"
              type="date"
              value={formatDateForInput(value.from)}
              onChange={(e) => handleFromChange(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to-date" className="text-xs">
              To
            </Label>
            <Input
              id="to-date"
              type="date"
              value={formatDateForInput(value.to)}
              onChange={(e) => handleToChange(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
