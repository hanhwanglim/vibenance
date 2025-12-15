import {
	createFileRoute,
	Outlet,
	redirect,
	useLocation,
} from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { CategoryChart } from "@/modules/transactions/components/category-chart";
import { ImportDialog } from "@/modules/transactions/components/import-dialog";
import { SpendingTrendChart } from "@/modules/transactions/components/spending-trend-chart";
import { SummaryCards } from "@/modules/transactions/components/summary-cards";
import { TransactionTable } from "@/modules/transactions/components/transaction-table";

export const Route = createFileRoute("/transactions/")({
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
		<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
			<ImportDialog />
			<SummaryCards />
			<div className="flex w-full gap-3 px-4 lg:px-6">
				<div className="flex-1">
					<CategoryChart />
				</div>
				<div className="flex-1">
					<CategoryChart />
				</div>
				<div className="flex-1">
					<SpendingTrendChart />
				</div>
			</div>
			<TransactionTable />
		</div>
	);
}
