import { createFileRoute } from "@tanstack/react-router";
import { ImportDialog } from "@/modules/transactions/components/import-dialog";
import { ImportHistoryTable } from "@/modules/transactions/components/import-history-table";

export const Route = createFileRoute("/_app/transactions/imports/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
			<div className="flex items-center justify-between px-4 lg:px-6">
				<h1 className="font-semibold text-2xl">Import History</h1>
				<ImportDialog />
			</div>
			<div className="flex flex-1 flex-col overflow-hidden px-4 lg:px-6">
				<ImportHistoryTable />
			</div>
		</div>
	);
}
