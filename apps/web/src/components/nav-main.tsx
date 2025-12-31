"use client";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import type { FileRouteTypes } from "@/routeTree.gen";

type LinkTo = FileRouteTypes["to"];

type NavMainProps = {
	items: {
		title: string;
		url: LinkTo;
		icon?: React.ComponentType<{ className?: string }>;
		isActive?: boolean;
		items?: {
			title: string;
			url: LinkTo;
		}[];
	}[];
};

export function NavMain({ items }: NavMainProps) {
	return (
		<SidebarGroup>
			<SidebarMenu>
				{items.map((item) => {
					return item.items ? (
						<Collapsible
							key={item.title}
							asChild
							defaultOpen={item.isActive}
							className="group/collapsible"
						>
							<SidebarMenuItem>
								<div className="flex justify-between px-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
									<div className="flex items-center gap-2">
										<Link to={item.url}>
											<div className="flex items-center gap-2 text-sm">
												{item.icon && <item.icon className="h-4 w-4" />}
												<span>{item.title}</span>
											</div>
										</Link>
									</div>
									<CollapsibleTrigger asChild>
										<SidebarMenuButton tooltip={item.title}>
											<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
										</SidebarMenuButton>
									</CollapsibleTrigger>
								</div>
								<CollapsibleContent>
									<SidebarMenuSub>
										{item.items?.map((subItem) => (
											<SidebarMenuSubItem key={subItem.title}>
												<SidebarMenuSubButton asChild>
													<Link to={subItem.url}> {subItem.title} </Link>
												</SidebarMenuSubButton>
											</SidebarMenuSubItem>
										))}
									</SidebarMenuSub>
								</CollapsibleContent>
							</SidebarMenuItem>
						</Collapsible>
					) : (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton tooltip={item.title} asChild>
								<Link to={item.url}>
									{item.icon && <item.icon />}
									<span>{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
