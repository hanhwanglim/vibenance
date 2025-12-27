import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import type { AppRouterClient } from "@vibenance/api/routers/index";
import { toast } from "sonner";

// In production, use relative URLs since web app is served from the same server
// In development, use localhost:3000 as fallback
const serverUrl =
	import.meta.env.VITE_SERVER_URL ||
	(import.meta.env.PROD ? "" : "http://localhost:3000");

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error) => {
			console.error(error);
			toast.error(`Error: ${error.message}`, {
				action: {
					label: "retry",
					onClick: () => {
						queryClient.invalidateQueries();
					},
				},
			});
		},
	}),
});

export const link = new RPCLink({
	url: serverUrl ? `${serverUrl}/rpc` : "/rpc",
	fetch(url, options) {
		return fetch(url, {
			...options,
			credentials: "include",
		});
	},
});

export const client: AppRouterClient = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
