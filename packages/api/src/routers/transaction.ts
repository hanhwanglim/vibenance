import { db } from "@vibenance/db";
import { transaction } from "@vibenance/db/schema/transaction";
import { eq } from "drizzle-orm";
import z from "zod";
import { publicProcedure } from "../index";

export const transactionRouter = {
	getAll: publicProcedure
		.input(
			z.object({
				page: z.number().default(0),
				pageSize: z.number().default(25),
			}),
		)
		.handler(async ({ input }) => {
			return await db.query.transaction.findMany({
				with: {
					account: true,
					category: true,
				},
				limit: input.pageSize,
				offset: input.page,
			});
		}),

	updateCategory: publicProcedure
		.input(z.object({ id: z.number(), categoryId: z.number() }))
		.handler(async ({ input }) => {
			return await db
				.update(transaction)
				.set({ categoryId: input.categoryId })
				.where(eq(transaction.id, input.id));
		}),
};
