import { db } from "@vibenance/db";
import {
	type TransactionInsert,
	transaction,
} from "@vibenance/db/schema/transaction";
import { count, desc, eq, gt, lt, sql, sum } from "drizzle-orm";
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
			const numTransactions = await db
				.select({ count: count() })
				.from(transaction);
			const transactions = await db.query.transaction.findMany({
				orderBy: [desc(transaction.timestamp), desc(transaction.createdAt)],
				with: {
					account: true,
					category: true,
				},
				limit: input.pageSize,
				offset: input.page * input.pageSize,
			});

			return {
				count: numTransactions[0]?.count || 0,
				data: transactions,
			};
		}),

	create: publicProcedure
		.input(
			z.object({
				transactions: z.array(
					z.object({
						transactionHash: z.string(),
						timestamp: z.date(),
						name: z.string(),
						currency: z.string(),
						amount: z.string(),
						categoryId: z.number().optional(),
						reference: z.string().optional(),
					}),
				),
				accountId: z.number(),
			}),
		)
		.handler(async ({ input }) => {
			const transactions = input.transactions.map((tx) => {
				return {
					...tx,
					accountId: input.accountId,
				};
			});

			return await db
				.insert(transaction)
				.values(transactions as TransactionInsert[])
				.onConflictDoUpdate({
					target: transaction.transactionHash,
					set: {
						categoryId: sql.raw(`excluded.${transaction.categoryId.name}`),
					},
				});
		}),

	summary: publicProcedure.handler(async () => {
		const totalIncomePromise = db
			.select({ income: sum(transaction.amount) })
			.from(transaction)
			.where(gt(transaction.amount, "0"));
		const totalExpensesPromise = db
			.select({ expenses: sum(transaction.amount) })
			.from(transaction)
			.where(lt(transaction.amount, "0"));
		const netAmountPromise = db
			.select({ asdf: sum(transaction.amount) })
			.from(transaction);
		const numTransactionsPromise = db
			.select({ count: count() })
			.from(transaction);

		const result = await Promise.all([
			totalIncomePromise,
			totalExpensesPromise,
			netAmountPromise,
			numTransactionsPromise,
		]);

		return {
			totalIncome: result[0][0]?.income,
			totalExpenses: result[1][0]?.expenses,
			netAmount: result[2][0]?.asdf,
			count: result[3][0]?.count,
		};
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
