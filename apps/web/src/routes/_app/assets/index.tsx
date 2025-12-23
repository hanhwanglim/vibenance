import {
	createFileRoute,
	Outlet,
	redirect,
	useLocation,
} from "@tanstack/react-router";
import { ChevronDownIcon, ListFilter } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import { ImportDialog } from "@/modules/assets/components/import-dialog";
import { TransactionTable } from "@/modules/assets/components/transaction-table";

export const Route = createFileRoute("/_app/assets/")({
	component: RouteComponent,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) {
			redirect({
				to: "/login",
				throw: true,
			});
		}
		return { session };
	},
});

function RouteComponent() {
	const location = useLocation();

	const now = new Date();

	const [open, setOpen] = useState(false);
	const [dateRange, setDateRange] = useState<DateRange | undefined>({
		from: new Date(now.getFullYear(), now.getMonth() - 3, now.getDay()),
		to: now,
	});

	if (location.pathname !== "/assets") {
		return <Outlet />;
	}

	return (
		<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
			<Tabs defaultValue="all" className="w-full flex-col justify-start gap-6">
				<div className="flex items-center justify-between px-4 lg:px-6">
					<div className="flex gap-2">
						<Label htmlFor="view-selector" className="sr-only">
							View
						</Label>
						<Select defaultValue="all">
							<SelectTrigger
								className="flex @4xl/main:hidden w-fit"
								size="sm"
								id="view-selector"
							>
								<SelectValue placeholder="Select a view" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								<SelectItem value="buy">Buy</SelectItem>
								<SelectItem value="sell">Sell</SelectItem>
							</SelectContent>
						</Select>
						<TabsList className="@4xl/main:flex hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1">
							<TabsTrigger value="all">All</TabsTrigger>
							<TabsTrigger value="buy">Buy</TabsTrigger>
							<TabsTrigger value="sell">Sell</TabsTrigger>
						</TabsList>
						<div className="flex flex-col gap-3">
							<Label htmlFor="date" className="sr-only px-1">
								Select date range
							</Label>
							<Popover open={open} onOpenChange={setOpen}>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										id="date"
										className="w-52 justify-between font-normal"
									>
										{`${dateRange?.from.toLocaleDateString()} - ${dateRange?.to.toLocaleDateString()}` ||
											"Select Date"}
										<ChevronDownIcon />
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className="w-auto overflow-hidden p-0"
									align="start"
								>
									<Calendar
										mode="range"
										defaultMonth={dateRange?.from}
										selected={dateRange}
										onSelect={setDateRange}
										numberOfMonths={2}
										className="rounded-lg border shadow-sm"
										captionLayout="dropdown"
									/>
								</PopoverContent>
							</Popover>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm">
									<ListFilter />
									<span className="hidden lg:inline">Customize Columns</span>
									<span className="lg:hidden">Columns</span>
									<ListFilter />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuCheckboxItem className="capitalize" checked={true}>
									Date
								</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem className="capitalize" checked={true}>
									Amount
								</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem className="capitalize" checked={true}>
									Reference
								</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem className="capitalize" checked={true}>
									Account
								</DropdownMenuCheckboxItem>
							</DropdownMenuContent>
						</DropdownMenu>
						<ImportDialog />
					</div>
				</div>
				<TabsContent
					value="all"
					className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
				>
					<TransactionTable type="all" dateRange={dateRange} />
				</TabsContent>
				<TabsContent
					value="buy"
					className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
				>
					<TransactionTable type="buy" dateRange={dateRange} />
				</TabsContent>
				<TabsContent
					value="sell"
					className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
				>
					<TransactionTable type="sell" dateRange={dateRange} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
