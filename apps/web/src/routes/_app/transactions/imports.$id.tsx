import { createFileRoute, redirect } from "@tanstack/react-router";
import { ImportTransactions } from "@/modules/transactions/components/import-transactions";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_app/transactions/imports/$id")({
	component: RouteComponent,
	beforeLoad: async ({ params }) => {
		const file = orpc.file.get.queryOptions({ input: params.id });
		if (!file) redirect({ to: "/transactions", throw: true });
		return { file };
	},
});

function RouteComponent() {
	const { id } = Route.useParams();

	return (
		<div className="flex flex-col py-4">
			<ImportTransactions fileId={id} />
		</div>
	);
}
