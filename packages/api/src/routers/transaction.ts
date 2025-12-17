import { db } from "@vibenance/db";
import { file } from "@vibenance/db/schema/file";
import {
	category,
	fileImport,
	type TransactionInsert,
	transaction,
} from "@vibenance/db/schema/transaction";
import {
	and,
	asc,
	count,
	desc,
	eq,
	gt,
	gte,
	lt,
	max,
	min,
	sql,
	sum,
} from "drizzle-orm";
import z from "zod";
import { publicProcedure } from "../index";

export const transactionRouter = {
	getAll: publicProcedure
		.input(
			z.object({
				pagination: z.object({
					pageIndex: z.number().default(0),
					pageSize: z.number().default(20),
				}),
				type: z.enum(["all", "income", "expenses"]),
				dateRange: z.object({ from: z.date(), to: z.date() }),
			}),
		)
		.handler(async ({ input }) => {
			const typeFilter =
				input.type === "all"
					? []
					: input.type === "income"
						? [gt(transaction.amount, 0)]
						: [lt(transaction.amount, 0)];

			const numTransactions = await db.$count(
				transaction,
				and(
					gte(transaction.timestamp, input.dateRange.from),
					lt(transaction.timestamp, input.dateRange.to),
					...typeFilter,
				),
			);

			const transactions = await db.query.transaction.findMany({
				orderBy: [desc(transaction.timestamp), desc(transaction.createdAt)],
				where: (transaction, { lt, gte, and }) =>
					and(
						gte(transaction.timestamp, input.dateRange.from),
						lt(transaction.timestamp, input.dateRange.to),
						...typeFilter,
					),
				with: {
					account: true,
					category: true,
				},
				limit: input.pagination.pageSize,
				offset: input.pagination.pageIndex * input.pagination.pageSize,
			});

			return {
				count: numTransactions,
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
						categoryId: z.number().nullable().optional(),
						reference: z.string().optional(),
					}),
				),
				accountId: z.number(),
				fileImportId: z.number(),
			}),
		)
		.handler(async ({ input }) => {
			const transactions = input.transactions.map((tx) => {
				return {
					...tx,
					accountId: input.accountId,
					fileImportId: input.fileImportId,
				};
			});

			const objs = await db
				.insert(transaction)
				.values(transactions as TransactionInsert[])
				.onConflictDoNothing();

			await db
				.update(fileImport)
				.set({ status: "success" })
				.where(eq(fileImport.id, input.fileImportId));

			return objs;
		}),

	summary: publicProcedure
		.input(z.object({ dateRange: z.object({ from: z.date(), to: z.date() }) }))
		.handler(async ({ input }) => {
			const totalIncomePromise = db
				.select({ income: sum(transaction.amount) })
				.from(transaction)
				.where(
					and(
						gt(transaction.amount, 0),
						gte(transaction.timestamp, input.dateRange.from),
						lt(transaction.timestamp, input.dateRange.to),
					),
				);
			const totalExpensesPromise = db
				.select({ expenses: sum(transaction.amount) })
				.from(transaction)
				.where(
					and(
						lt(transaction.amount, 0),
						gte(transaction.timestamp, input.dateRange.from),
						lt(transaction.timestamp, input.dateRange.to),
					),
				);
			const netAmountPromise = db
				.select({ net: sum(transaction.amount) })
				.from(transaction)
				.where(
					and(
						gte(transaction.timestamp, input.dateRange.from),
						lt(transaction.timestamp, input.dateRange.to),
					),
				);
			const numTransactionsPromise = db
				.select({ count: count() })
				.from(transaction)
				.where(
					and(
						gte(transaction.timestamp, input.dateRange.from),
						lt(transaction.timestamp, input.dateRange.to),
					),
				);

			const [totalIncome, totalExpenses, netAmount, numTransactions] =
				await Promise.all([
					totalIncomePromise,
					totalExpensesPromise,
					netAmountPromise,
					numTransactionsPromise,
				]);

			return {
				totalIncome: totalIncome[0]?.income,
				totalExpenses: totalExpenses[0]?.expenses,
				netAmount: netAmount[0]?.net,
				count: numTransactions[0]?.count,
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

	categoryTrend: publicProcedure
		.input(
			z
				.object({
					startDate: z.date().optional(),
					endDate: z.date().optional(),
				})
				.optional(),
		)
		.handler(async ({ input }) => {
			if (!input?.startDate || !input?.endDate) {
				return {
					categories: [],
					data: [],
				};
			}
			const previous = new Date(
				input.startDate.getTime() -
					(input.endDate.getTime() - input.startDate.getTime()),
			);

			const currentData = await db
				.select({
					bin: sql<string>`date_trunc('month', ${transaction.timestamp})`,
					category: category.name,
					sum: sum(transaction.amount),
				})
				.from(transaction)
				.leftJoin(category, eq(transaction.categoryId, category.id))
				.where(
					and(
						lt(transaction.amount, 0),
						gte(transaction.timestamp, input?.startDate),
						lt(transaction.timestamp, input?.endDate),
					),
				)
				.groupBy(({ bin, category }) => [bin, category])
				.orderBy(({ bin }) => asc(bin));

			const previousData = await db
				.select({
					bin: sql<string>`date_trunc('month', ${transaction.timestamp})`,
					category: category.name,
					sum: sum(transaction.amount),
				})
				.from(transaction)
				.leftJoin(category, eq(transaction.categoryId, category.id))
				.where(
					and(
						lt(transaction.amount, 0),
						gte(transaction.timestamp, previous),
						lt(transaction.timestamp, input?.startDate),
					),
				)
				.groupBy(({ bin, category }) => [bin, category])
				.orderBy(({ bin }) => asc(bin));

			// Helper function to calculate period number from a date relative to a start date
			const getPeriodNumber = (dateStr: string, startDate: Date): number => {
				const binDate = new Date(dateStr);
				const startMonth = startDate.getMonth();
				const startYear = startDate.getFullYear();
				const binMonth = binDate.getMonth();
				const binYear = binDate.getFullYear();

				// Calculate the difference in months
				const monthDiff = (binYear - startYear) * 12 + (binMonth - startMonth);
				return monthDiff + 1; // +1 to make it 1-indexed (Month 1, Month 2, etc.)
			};

			const dataMap = new Map<number, Record<string, unknown>>();

			// Process previous data - calculate period number relative to previous period start
			for (const transactionBin of previousData) {
				const periodNumber = getPeriodNumber(
					String(transactionBin.bin),
					previous,
				);
				if (!dataMap.has(periodNumber)) {
					dataMap.set(periodNumber, {
						bin: periodNumber,
					});
				}

				const point = dataMap.get(periodNumber);
				if (!point) {
					continue;
				}
				const categoryName = String(transactionBin.category || "Others");
				point[`prev_${categoryName}`] = -Number(transactionBin.sum);
			}

			// Process current data - calculate period number relative to current period start
			for (const transactionBin of currentData) {
				const periodNumber = getPeriodNumber(
					String(transactionBin.bin),
					input.startDate,
				);
				if (!dataMap.has(periodNumber)) {
					dataMap.set(periodNumber, {
						bin: periodNumber,
					});
				}
				const point = dataMap.get(periodNumber);
				if (!point) {
					continue;
				}
				const categoryName = String(transactionBin.category || "Others");
				point[`curr_${categoryName}`] = -Number(transactionBin.sum);
			}

			const data = Array.from(dataMap.values()).sort((a, b) => {
				// Sort by period number extracted from "Month X"
				const aNum = Number.parseInt(String(a.bin).replace("Month ", ""), 10);
				const bNum = Number.parseInt(String(b.bin).replace("Month ", ""), 10);
				return aNum - bNum;
			});

			const categories = await db
				.select({ category: category.name, count: count() })
				.from(category)
				.rightJoin(transaction, eq(category.id, transaction.categoryId))
				.groupBy(({ category }) => category)
				.where(
					and(
						lt(transaction.amount, 0),
						gte(transaction.timestamp, previous),
						lt(transaction.timestamp, input?.endDate),
					),
				)
				.having(({ count }) => gt(count, 0));

			return {
				categories: categories,
				data: data,
			};
		}),

	updateCategory: publicProcedure
		.input(z.object({ id: z.number(), categoryId: z.number() }))
		.handler(async (input) => {
			return await db
				.update(transaction)
				.set({ categoryId: input.categoryId })
				.where(eq(transaction.id, input.id));
		}),

	createImport: publicProcedure.input(z.number()).handler(async ({ input }) => {
		const [obj] = await db.insert(fileImport).values({}).returning();
		await db
			.update(file)
			.set({ fileImportId: obj?.id })
			.where(eq(file.id, input));
		return obj;
	}),

	importList: publicProcedure
		.input(
			z.object({
				pagination: z.object({
					pageIndex: z.number().default(0),
					pageSize: z.number().default(20),
				}),
			}),
		)
		.handler(async ({ input }) => {
			const count = await db.$count(fileImport);
			const fileImports = await db.query.fileImport.findMany({
				with: {
					files: true,
				},
				limit: input.pagination.pageSize,
				offset: input.pagination.pageIndex * input.pagination.pageSize,
				orderBy: [desc(fileImport.createdAt), desc(fileImport.id)],
			});

			return {
				count: count,
				data: fileImports,
			};
		}),
};
