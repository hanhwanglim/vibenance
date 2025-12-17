import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { ImportHistoryTable } from "@/modules/transactions/components/import-history-table";

export const Route = createFileRoute("/transactions/import")({
	component: RouteComponent,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) redirect({ to: "/login", throw: true });
		return { session };
	},
});

function RouteComponent() {
	if (location.pathname !== "/transactions/import") {
		return <Outlet />;
	}

	return <ImportHistoryTable />;
}
