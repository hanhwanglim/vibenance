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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect, useRef } from "react";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";

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
function formatDate(date: Date | null): string {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateRange(range: DateRange): string {
  if (!range.from && !range.to) {
    return "Select date range";
  }

  if (range.from && range.to) {
    if (range.from.getTime() === range.to.getTime()) {
      return formatDate(range.from);
    }
    return `${formatDate(range.from)} - ${formatDate(range.to)}`;
  }

  if (range.from) {
    return `From ${formatDate(range.from)}`;
  }

  if (range.to) {
    return `Until ${formatDate(range.to)}`;
  }

  return "Select date range";
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [quickRange, setQuickRange] = useState<string>("month");
  const [isCustom, setIsCustom] = useState(false);
  const hasInitialized = useRef(false);
  const [open, setOpen] = useState(false);

  // Only initialize if value is not already set from parent
  useEffect(() => {
    if (!hasInitialized.current) {
      // If parent has already set a value, don't override it
      if (value.from || value.to) {
        hasInitialized.current = true;
        return;
      }
      // Otherwise, initialize with default "month" range
      if (!isCustom && quickRange !== "custom") {
        const dates = getQuickRangeDates(quickRange);
        onChange(dates);
      }
      hasInitialized.current = true;
    }
  }, [value.from, value.to, isCustom, quickRange, onChange]);

  const handleFromChange = (date: Date) => {
    setIsCustom(true);
    setQuickRange("custom");
    onChange({ ...value, from: date });
  };

  const handleToChange = (date: Date) => {
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
      // Close popover when selecting a quick range
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !value.from && !value.to && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium" htmlFor="quick-ranges">
              Quick Ranges
            </Label>
            <Select value={quickRange} onValueChange={handleQuickRangeChange}>
              <SelectTrigger id="quick-ranges" className="w-full">
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
          </div>

          {(isCustom || quickRange === "custom") && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <DatePicker
                    value={value.from || new Date()}
                    onChange={handleFromChange}
                    label="From"
                  />
                </div>
                <div className="space-y-1.5">
                  <DatePicker
                    value={value.to || new Date()}
                    onChange={handleToChange}
                    label="To"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function DatePicker({
  value: initialValue,
  onChange,
  label,
}: {
  value: Date;
  onChange: (date: Date) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(initialValue);
  const [month, setMonth] = useState<Date>(initialValue);
  const [value, setValue] = useState<string>(formatDate(initialValue));

  // Sync local state when prop changes
  useEffect(() => {
    setDate(initialValue);
    setValue(formatDate(initialValue));
    setMonth(initialValue);
  }, [initialValue]);

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={`${label}-date`} className="px-1">
        {label}
      </Label>
      <div className="relative flex gap-2">
        <Input
          id={`${label}-date`}
          value={value}
          placeholder={formatDate(initialValue)}
          className="bg-background pr-10"
          onChange={(e) => {
            const inputValue = e.target.value;
            setValue(inputValue);
            // Try to parse the input as a date
            const parsedDate = new Date(inputValue);
            if (!isNaN(parsedDate.getTime())) {
              setDate(parsedDate);
              onChange(parsedDate);
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id={`${label}-date-picker`}
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              onSelect={(selectedDate) => {
                if (selectedDate) {
                  setDate(selectedDate);
                  setValue(formatDate(selectedDate));
                  onChange(selectedDate);
                  setOpen(false);
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
