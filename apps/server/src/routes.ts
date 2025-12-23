import type { OpenAPIHandler } from "@orpc/openapi/fetch";
import type { RPCHandler } from "@orpc/server/fetch";
import { createContext } from "@vibenance/api/context";
import { auth } from "@vibenance/auth";
import type { Hono } from "hono";

export function setupRoutes(
	app: Hono,
	apiHandler: OpenAPIHandler,
	rpcHandler: RPCHandler,
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
			prefix: "/api-reference",
			context: context,
		});

		if (apiResult.matched) {
			return c.newResponse(apiResult.response.body, apiResult.response);
		}

		await next();
	});
}
