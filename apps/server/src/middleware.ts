import type { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { config } from "./config";

export function setupMiddleware(app: Hono) {
	app.use(logger());

	app.use(
		"/*",
		cors({
			origin: config.corsOrigin,
			allowMethods: ["GET", "POST", "OPTIONS"],
			allowHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	);
}
