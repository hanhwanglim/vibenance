import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryTrendChart } from "@/modules/transactions/components/category-trend-chart";
import { SpendingTrendChart } from "@/modules/transactions/components/spending-trend-chart";
import type { DateRange } from "@/types";

export function TrendCharts({ dateRange }: { dateRange?: DateRange }) {
	const [, setActiveTab] = useState("spending");

	return (
		<Card className="col-span-3 flex h-full flex-col">
			<Tabs
				defaultValue="spending"
				onValueChange={setActiveTab}
				className="flex flex-1 flex-col"
			>
				<CardHeader>
					<TabsList>
						<TabsTrigger value="spending">Spending Trend</TabsTrigger>
						<TabsTrigger value="category">Category Trend</TabsTrigger>
					</TabsList>
				</CardHeader>
				<CardContent className="flex-1">
					<TabsContent value="spending" className="mt-0 h-full">
						<SpendingTrendChart dateRange={dateRange} />
					</TabsContent>
					<TabsContent value="category" className="mt-0 h-full">
						<CategoryTrendChart dateRange={dateRange} />
					</TabsContent>
				</CardContent>
			</Tabs>
		</Card>
	);
}
