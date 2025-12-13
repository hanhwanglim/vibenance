import { db } from "@vibenance/db";
import {
	type TransactionInsert,
	transaction,
} from "@vibenance/db/schema/transaction";
import { eq, sql } from "drizzle-orm";
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

	create: publicProcedure
		.input(
			z.array(
				z.object({
					transactionHash: z.string(),
					timestamp: z.date(),
					accountId: z.number(),
					name: z.string(),
					currency: z.string(),
					amount: z.string(),
					categoryId: z.number(),
					reference: z.string(),
				}),
			),
		)
		.handler(async ({ input }) => {
			return await db
				.insert(transaction)
				.values(input as TransactionInsert[])
				.onConflictDoUpdate({
					target: transaction.transactionHash,
					set: {
						categoryId: sql.raw(`excluded.${transaction.categoryId.name}`),
					},
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
