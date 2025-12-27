import type { RouterClient } from "@orpc/server";
import { protectedProcedure, publicProcedure } from "../index";
import { agentRouter } from "./agent";
import { assetRouter } from "./asset";
import { bankAccountRouter } from "./bank-account";
import { fileRouter } from "./file";
import { settingsRouter } from "./settings";
import { transactionRouter } from "./transaction";

const appRouter = {
	healthCheck: publicProcedure.handler(() => {
		return "OK";
	}),
	privateData: protectedProcedure.handler(({ context }) => {
		return {
			message: "This is private",
			user: context.session?.user,
		};
	}),
	transaction: transactionRouter,
	bankAccount: bankAccountRouter,
	asset: assetRouter,
	file: fileRouter,
	settings: settingsRouter,
	agent: agentRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
