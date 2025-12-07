import { db } from "@vibenance/db";
import { transaction } from "@vibenance/db/schema/transaction";
import { eq } from "drizzle-orm";
import z from "zod";
import { publicProcedure } from "../index";

export const transactionRouter: Record<string, unknown> = {
	getAll: publicProcedure
		.input(
			z.object({
				page: z.number().default(0),
				pageSize: z.number().default(25),
			}),
		)
		.handler(async ({ input }) => {
			return await db
				.select()
				.from(transaction)
				.limit(input.pageSize)
				.offset(input.page);
		}),

	updateCategory: publicProcedure
		.input(z.object({ id: z.uuid(), categoryId: z.uuid() }))
		.handler(async ({ input }) => {
			return await db
				.update(transaction)
				.set({ categoryId: input.categoryId })
				.where(eq(transaction.id, input.id));
		}),
};
