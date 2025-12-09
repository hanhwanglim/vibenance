import {
	createFileRoute,
	Link,
	Outlet,
	redirect,
	useLocation,
} from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { TransactionTable } from "@/modules/transactions/components/transaction-table";

export const Route = createFileRoute("/transactions")({
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

	if (location.pathname !== "/transactions") {
		return <Outlet />;
	}

	return (
		<div>
			<Link to="/transactions/upload">Upload</Link>
			<TransactionTable />
		</div>
	);
}
