import {
	createFileRoute,
	Outlet,
	redirect,
	useLocation,
} from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { ImportHistoryTable } from "@/modules/transactions/components/import-history-table";

export const Route = createFileRoute("/_app/transactions/imports")({
	component: RouteComponent,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) redirect({ to: "/login", throw: true });
		return { session };
	},
});

function RouteComponent() {
	const location = useLocation();

	if (location.pathname !== "/transactions/import") {
		return <Outlet />;
	}

	return <ImportHistoryTable />;
}
