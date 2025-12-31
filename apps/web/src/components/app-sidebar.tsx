import { Link } from "@tanstack/react-router";
import {
	Bot,
	ChartNoAxesCombined,
	LayoutDashboard,
	PiggyBank,
	Receipt,
	Target,
	TrendingUp,
	Wallet,
} from "lucide-react";
import type * as React from "react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	navMain: [
		{
			title: "Dashboard",
			url: "/" as const,
			icon: LayoutDashboard,
		},
		{
			title: "Transactions",
			url: "/transactions" as const,
			icon: Receipt,
			items: [
				{ title: "Dashboard", url: "/transactions" as const },
				{ title: "All Transactions", url: "/transactions/all" as const },
				{ title: "Import History", url: "/transactions/imports" as const },
			],
		},
		{
			title: "Assets",
			url: "/assets" as const,
			icon: ChartNoAxesCombined,
			items: [
				{ title: "Dashboard", url: "/assets" as const },
				{ title: "All Transactions", url: "/assets" as const },
				{ title: "Import History", url: "/assets/imports" as const },
			],
		},
		{
			title: "Accounts",
			url: "/accounts" as const,
			icon: Wallet,
		},
		{
			title: "Finance Agent",
			url: "/agent" as const,
			icon: Bot,
		},
		{
			title: "Budget",
			url: "/" as const,
			icon: PiggyBank,
		},
		{
			title: "Goals",
			url: "/" as const,
			icon: Target,
		},
		{
			title: "Reports",
			url: "/" as const,
			icon: TrendingUp,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:!p-1.5"
						>
							<Link to="/dashboard">
								<LayoutDashboard className="!size-5" />
								<span className="font-semibold text-base">Vibenance</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	);
}
