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
			url: "/",
			icon: LayoutDashboard,
		},
		{
			title: "Transactions",
			url: "/transactions",
			icon: Receipt,
		},
		{
			title: "Assets",
			url: "/assets",
			icon: ChartNoAxesCombined,
		},
		{
			title: "Accounts",
			url: "/accounts",
			icon: Wallet,
		},
		{
			title: "Finance Agent",
			url: "/agent",
			icon: Bot,
		},
		{
			title: "Budget",
			url: "#",
			icon: PiggyBank,
		},
		{
			title: "Goals",
			url: "#",
			icon: Target,
		},
		{
			title: "Reports",
			url: "#",
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
							<a href="/dashboard">
								<LayoutDashboard className="!size-5" />
								<span className="font-semibold text-base">Vibenance</span>
							</a>
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
