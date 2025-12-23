import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import Layout from "@/layouts/layout";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_app")({
	component: RouteComponent,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) redirect({ to: "/login", throw: true });
		return { session };
	},
});

function RouteComponent() {
	return (
		<>
			<div className="min-h-svh">
				<Layout>
					<Outlet />
				</Layout>
			</div>
			<Toaster richColors />
		</>
	);
}
