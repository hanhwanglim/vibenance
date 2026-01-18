import { Link, useMatches } from "@tanstack/react-router";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { FileRouteTypes } from "@/routeTree.gen";

type RouteSegment = {
	label: string;
	path: FileRouteTypes["to"];
	params?: Record<string, string>;
};

const routes: Partial<Record<FileRouteTypes["id"], RouteSegment[]>> = {
	__root__: [],
	"/_app": [],
	"/login": [{ label: "Login", path: "/login" }],
	"/_app/": [{ label: "Dashboard", path: "/" }],
	"/_app/dashboard": [{ label: "Dashboard", path: "/dashboard" }],
	"/_app/accounts": [{ label: "Accounts", path: "/accounts" }],
	"/_app/agent": [{ label: "Agent", path: "/agent" }],
	"/_app/assets/": [{ label: "Assets", path: "/assets" }],
	"/_app/assets/imports": [
		{ label: "Assets", path: "/assets" },
		{ label: "Import History", path: "/assets/imports" },
	],
	"/_app/assets/imports/$id": [
		{ label: "Assets", path: "/assets" },
		{ label: "Import History", path: "/assets/imports" },
		{ label: "Import", path: "/assets/imports/$id" },
	],
	"/_app/budgets/": [{ label: "Budgets", path: "/budgets" }],
	"/_app/transactions/": [{ label: "Transactions", path: "/transactions" }],
	"/_app/transactions/all": [
		{ label: "Transactions", path: "/transactions" },
		{ label: "All Transactions", path: "/transactions/all" },
	],
	"/_app/transactions/imports/": [
		{ label: "Transactions", path: "/transactions" },
		{ label: "Import History", path: "/transactions/imports" },
	],
	"/_app/transactions/imports/$id": [
		{ label: "Transactions", path: "/transactions" },
		{ label: "Import History", path: "/transactions/imports" },
		{ label: "Import", path: "/transactions/imports/$id" },
	],
	"/_app/settings/account": [
		{ label: "Settings", path: "/settings/account" },
		{ label: "Account", path: "/settings/account" },
	],
};

export function SiteHeader() {
	const matches = useMatches();
	const breadcrumbItems = routes[matches.at(-1)?.routeId || "/_app/"] || [];

	return (
		<header className="flex h-10 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
			<div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
				<SidebarTrigger className="-ml-1" />
				<Separator
					orientation="vertical"
					className="mx-2 data-[orientation=vertical]:h-4"
				/>
				<Breadcrumb>
					<BreadcrumbList>
						{breadcrumbItems.map((item, index) => (
							<div key={item.path} className="flex items-center">
								<BreadcrumbItem>
									{index === breadcrumbItems.length - 1 ? (
										<BreadcrumbPage className="font-medium text-base">
											{item.label}
										</BreadcrumbPage>
									) : (
										<BreadcrumbLink asChild>
											<Link to={item.path} className="font-medium text-base">
												{item.label}
											</Link>
										</BreadcrumbLink>
									)}
								</BreadcrumbItem>
								{!(index === breadcrumbItems.length - 1) && (
									<BreadcrumbSeparator />
								)}
							</div>
						))}
					</BreadcrumbList>
				</Breadcrumb>
			</div>
		</header>
	);
}
