import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { ImportHistoryTable } from "@/modules/transactions/components/import-history-table";

export const Route = createFileRoute("/_app/transactions/imports")({
	component: RouteComponent,
});

function RouteComponent() {
	const location = useLocation();

	if (location.pathname !== "/transactions/import") {
		return <Outlet />;
	}

	return <ImportHistoryTable />;
}
