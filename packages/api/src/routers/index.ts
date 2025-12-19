import type { RouterClient } from "@orpc/server";
import { protectedProcedure, publicProcedure } from "../index";
import { assetRouter } from "./asset";
import { bankAccountRouter } from "./bank-account";
import { fileRouter } from "./file";
import { settingsRouter } from "./settings";
import { todoRouter } from "./todo";
import { transactionRouter } from "./transaction";

export const appRouter = {
	healthCheck: publicProcedure.handler(() => {
		return "OK";
	}),
	privateData: protectedProcedure.handler(({ context }) => {
		return {
			message: "This is private",
			user: context.session?.user,
		};
	}),
	todo: todoRouter,
	transaction: transactionRouter,
	bankAccount: bankAccountRouter,
	asset: assetRouter,
	file: fileRouter,
	settings: settingsRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
