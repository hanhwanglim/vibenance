import { db } from "@vibenance/db";
import {
	category,
	type TransactionInsert,
	transaction,
} from "@vibenance/db/schema/transaction";
import { asc, count, desc, eq, gt, lt, max, min, sql, sum } from "drizzle-orm";
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

	categoryBreakdown: publicProcedure.handler(async () => {
		const categoriesPromise = db
			.select({
				name: category.name,
				sum: sum(transaction.amount),
			})
			.from(transaction)
			.leftJoin(category, eq(transaction.categoryId, category.id))
			.where(lt(transaction.amount, 0))
			.groupBy(category.name)
			.orderBy(({ sum }) => asc(sum)); // expenses are negative

		const totalExpensesPromise = db
			.select({ sum: sum(transaction.amount) })
			.from(transaction)
			.where(lt(transaction.amount, "0"));

		const [categories, totalExpenses] = await Promise.all([
			categoriesPromise,
			totalExpensesPromise,
		]);

		// Keep top 6 categories, group the rest into "Others"
		const maxCategories = 6;
		const topCategories = categories.slice(0, maxCategories);
		const otherCategories = categories.slice(maxCategories);

		console.log(categories);

		const formattedCategories = topCategories.map((category, index) => {
			return {
				category: category.name || "Uncategorized",
				sum: -Number(category.sum),
				fill: `var(--chart-${(index % 6) + 1})`,
			};
		});

		// Add "Others" category if there are remaining categories
		if (otherCategories.length > 0) {
			const othersSum = otherCategories.reduce(
				(acc, cat) => acc + Number(cat.sum || 0),
				0,
			);
			formattedCategories.push({
				category: "Others",
				sum: -othersSum,
				fill: "var(--chart-7)",
			});
		}

		return {
			categories: formattedCategories,
			sum: totalExpenses[0]?.sum,
		};
	}),

	spendingTrend: publicProcedure.handler(async () => {
		const data = await db
			.select({
				bin: sql<string>`date_trunc('month', ${transaction.timestamp})`,
				sum: sum(transaction.amount),
			})
			.from(transaction)
			.where(lt(transaction.amount, 0))
			.groupBy(({ bin }) => bin);

		const minPeriod = await db
			.select({
				min: min(transaction.timestamp),
			})
			.from(transaction)
			.where(lt(transaction.amount, 0));

		const maxPeriod = await db
			.select({
				max: max(transaction.timestamp),
			})
			.from(transaction)
			.where(lt(transaction.amount, 0));

		return {
			period: { min: minPeriod[0].min, max: maxPeriod[0].max },
			data: data,
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
