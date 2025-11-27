import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency, formatChange } from "@/lib/formatter";
import { cn } from "@/lib/utils";

// Type definitions
export type StatCardData = {
  label: string;
  value: number;
  currency?: string;
  change?: {
    value: number; // percentage change
    period?: string; // e.g., "this month", "vs last month"
  };
  footer?: {
    message: string;
    subtext?: string;
  };
};

type StatCardProps = {
  data: StatCardData;
  isLoading?: boolean;
  className?: string;
};

// Individual card component
function StatCard({ data, isLoading, className }: StatCardProps) {
  const isPositive = (data.change?.value ?? 0) >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className={cn("@container/card", className)}>
      <CardHeader>
        <CardDescription>{data.label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {isLoading ? (
            <Skeleton className="h-8 w-32" />
          ) : data.currency ? (
            formatCurrency(data.value, data.currency)
          ) : (
            data.value.toLocaleString()
          )}
        </CardTitle>
        {data.change && (
          <CardAction>
            <Badge
              variant="outline"
              className={cn(
                "gap-1",
                isPositive
                  ? "border-green-500/50 text-green-700 dark:text-green-400"
                  : "border-red-500/50 text-red-700 dark:text-red-400",
              )}
            >
              <TrendIcon className="h-3 w-3" />
              {formatChange(data.change.value)}
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      {data.footer && (
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {data.footer.message}
            <TrendIcon
              className={cn(
                "size-4",
                isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400",
              )}
            />
          </div>
          {data.footer.subtext && (
            <div className="text-muted-foreground">{data.footer.subtext}</div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

// Main component
export function SectionCards({
  data,
  isLoading = false,
}: {
  data?: StatCardData[];
  isLoading?: boolean;
} = {}) {
  // Default data for development/demo
  const defaultData: StatCardData[] = [
    {
      label: "Total Balance",
      value: 1250.0,
      currency: "USD",
      change: {
        value: 12.5,
        period: "this month",
      },
      footer: {
        message: "Up 12.5% this month",
        subtext: "Compared to last month",
      },
    },
    {
      label: "Money In",
      value: 1234,
      currency: "USD",
      change: {
        value: -20,
        period: "this period",
      },
      footer: {
        message: "Down 20% this period",
        subtext: "Review income sources",
      },
    },
    {
      label: "Money Out",
      value: 45678,
      currency: "USD",
      change: {
        value: 12.5,
        period: "this month",
      },
      footer: {
        message: "Up 12.5% this month",
        subtext: "Monitor spending trends",
      },
    },
    {
      label: "Net Worth",
      value: 91238.28,
      currency: "USD",
      change: {
        value: 4.5,
        period: "this month",
      },
      footer: {
        message: "Up 4.5% this month",
        subtext: "Steady growth trajectory",
      },
    },
  ];

  const cardsData = data ?? defaultData;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cardsData.map((cardData, index) => (
        <StatCard key={index} data={cardData} isLoading={isLoading} />
      ))}
    </div>
  );
}
