import { Hono } from "hono";
import { bot } from "./bot";
import { createApiHandler, createRpcHandler } from "./handlers";
import { setupMiddleware } from "./middleware";
import { setupRoutes } from "./routes";
import { setupStaticServing } from "./static";

const app = new Hono();

setupMiddleware(app);

const apiHandler = createApiHandler();
const rpcHandler = createRpcHandler();

setupRoutes(app, apiHandler, rpcHandler);

setupStaticServing(app);

bot.start();

export default app;
