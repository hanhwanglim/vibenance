import type { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { config } from "./config";

function setupProductionStaticServing(app: Hono) {
	app.use("/*", async (c, next) => {
		const path = new URL(c.req.url).pathname;
		// Only serve static files for paths that look like assets (have extensions)
		// This allows SPA routes to fall through to index.html
		if (path.match(/\.[\w]+$/)) {
			return serveStatic({
				root: config.staticPath,
				rewriteRequestPath: (p) => {
					return p.startsWith("/") ? p.slice(1) : p;
				},
			})(c, next);
		}
		await next();
	});

	app.get(
		"*",
		serveStatic({
			root: config.staticPath,
			rewriteRequestPath: () => "index.html",
		}),
	);
}

export function setupStaticServing(app: Hono) {
	if (config.nodeEnv === "production") {
		setupProductionStaticServing(app);
	}
}
