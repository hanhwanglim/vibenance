import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/assets/imports")({
	component: RouteComponent,
});

function RouteComponent() {
	const location = useLocation();

	if (location.pathname !== "/assets/imports") {
		return <Outlet />;
	}

	return <div>Hello "/assets/imports"!</div>;
}
