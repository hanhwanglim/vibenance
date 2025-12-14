import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/transactions/import")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
