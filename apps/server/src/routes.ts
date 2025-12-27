import { createContext } from "@vibenance/api/context";
import { auth } from "@vibenance/auth";
import type { Hono } from "hono";
import type { createApiHandler, createRpcHandler } from "./handlers";

export function setupRoutes(
	app: Hono,
	apiHandler: ReturnType<typeof createApiHandler>,
	rpcHandler: ReturnType<typeof createRpcHandler>,
) {
	app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

	app.use("/*", async (c, next) => {
		const context = await createContext({ context: c });

		const rpcResult = await rpcHandler.handle(c.req.raw, {
			prefix: "/rpc",
			context: context,
		});

		if (rpcResult.matched) {
			return c.newResponse(rpcResult.response.body, rpcResult.response);
		}

		const apiResult = await apiHandler.handle(c.req.raw, {
			prefix: "/api",
			context: context,
		});

		if (apiResult.matched) {
			return c.newResponse(apiResult.response.body, apiResult.response);
		}

		await next();
	});
}
