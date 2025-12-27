import z from "zod";
import { protectedProcedure } from "../index";
import { BankTransactionService } from "../services/bank-transaction";
import { FileImportService } from "../services/file-import";
import { dateRange, pagination } from "../utils";

export const transactionRouter = {
	getAll: protectedProcedure
		.input(
			z.object({
				pagination,
				dateRange,
				type: z.enum(["all", "income", "expenses"]),
			}),
		)
		.handler(async ({ input }) => {
			const { count, transactions } = await BankTransactionService.getAll(
				input.type,
				input.dateRange,
				input.pagination,
			);

			return {
				count: count,
				data: transactions,
			};
		}),

	create: protectedProcedure
		.input(
			z.object({
				transactions: z.array(
					z.object({
						transactionId: z.string(),
						timestamp: z.date(),
						name: z.string(),
						currency: z.string(),
						amount: z.string(),
						categoryId: z.number().nullable().optional(),
						reference: z.string().optional(),
					}),
				),
				accountId: z.string(),
				fileImportId: z.string(),
			}),
		)
		.handler(async ({ input }) => {
			return await BankTransactionService.bulkCreate(
				input.transactions,
				input.accountId,
				input.fileImportId,
			);
		}),

	summary: protectedProcedure
		.input(z.object({ dateRange }))
		.handler(async ({ input }) => {
			return await BankTransactionService.getSummary(input.dateRange);
		}),

	// categoryBreakdown: protectedProcedure.handler(async () => {
	// 	const categoriesPromise = db
	// 		.select({
	// 			name: category.name,
	// 			sum: sum(transaction.amount),
	// 		})
	// 		.from(transaction)
	// 		.leftJoin(category, eq(transaction.categoryId, category.id))
	// 		.where(lt(transaction.amount, 0))
	// 		.groupBy(category.name)
	// 		.orderBy(({ sum }) => asc(sum)); // expenses are negative

	// 	const totalExpensesPromise = db
	// 		.select({ sum: sum(transaction.amount) })
	// 		.from(transaction)
	// 		.where(lt(transaction.amount, "0"));

	// 	const [categories, totalExpenses] = await Promise.all([
	// 		categoriesPromise,
	// 		totalExpensesPromise,
	// 	]);

	// 	// Keep top 6 categories, group the rest into "Others"
	// 	const maxCategories = 6;
	// 	const topCategories = categories.slice(0, maxCategories);
	// 	const otherCategories = categories.slice(maxCategories);

	// 	const formattedCategories = topCategories.map((category, index) => {
	// 		return {
	// 			category: category.name || "Uncategorized",
	// 			sum: -Number(category.sum),
	// 			fill: `var(--chart-${(index % 6) + 1})`,
	// 		};
	// 	});

	// 	// Add "Others" category if there are remaining categories
	// 	if (otherCategories.length > 0) {
	// 		const othersSum = otherCategories.reduce(
	// 			(acc, cat) => acc + Number(cat.sum || 0),
	// 			0,
	// 		);
	// 		formattedCategories.push({
	// 			category: "Others",
	// 			sum: -othersSum,
	// 			fill: "var(--chart-7)",
	// 		});
	// 	}

	// 	return {
	// 		categories: formattedCategories,
	// 		sum: totalExpenses[0]?.sum,
	// 	};
	// }),

	// spendingTrend: protectedProcedure.handler(async () => {
	// 	const data = await db
	// 		.select({
	// 			bin: sql<string>`date_trunc('month', ${transaction.timestamp})`,
	// 			sum: sum(transaction.amount),
	// 		})
	// 		.from(transaction)
	// 		.where(lt(transaction.amount, 0))
	// 		.groupBy(({ bin }) => bin);

	// 	const minPeriod = await db
	// 		.select({
	// 			min: min(transaction.timestamp),
	// 		})
	// 		.from(transaction)
	// 		.where(lt(transaction.amount, 0));

	// 	const maxPeriod = await db
	// 		.select({
	// 			max: max(transaction.timestamp),
	// 		})
	// 		.from(transaction)
	// 		.where(lt(transaction.amount, 0));

	// 	return {
	// 		period: { min: minPeriod[0].min, max: maxPeriod[0].max },
	// 		data: data,
	// 	};
	// }),

	// categoryTrend: protectedProcedure
	// 	.input(
	// 		z
	// 			.object({
	// 				startDate: z.date().optional(),
	// 				endDate: z.date().optional(),
	// 			})
	// 			.optional(),
	// 	)
	// 	.handler(async ({ input }) => {
	// 		if (!input?.startDate || !input?.endDate) {
	// 			return {
	// 				categories: [],
	// 				data: [],
	// 			};
	// 		}
	// 		const previous = new Date(
	// 			input.startDate.getTime() -
	// 			(input.endDate.getTime() - input.startDate.getTime()),
	// 		);

	// 		const currentData = await db
	// 			.select({
	// 				bin: sql<string>`date_trunc('month', ${transaction.timestamp})`,
	// 				category: category.name,
	// 				sum: sum(transaction.amount),
	// 			})
	// 			.from(transaction)
	// 			.leftJoin(category, eq(transaction.categoryId, category.id))
	// 			.where(
	// 				and(
	// 					lt(transaction.amount, 0),
	// 					gte(transaction.timestamp, input?.startDate),
	// 					lt(transaction.timestamp, input?.endDate),
	// 				),
	// 			)
	// 			.groupBy(({ bin, category }) => [bin, category])
	// 			.orderBy(({ bin }) => asc(bin));

	// 		const previousData = await db
	// 			.select({
	// 				bin: sql<string>`date_trunc('month', ${transaction.timestamp})`,
	// 				category: category.name,
	// 				sum: sum(transaction.amount),
	// 			})
	// 			.from(transaction)
	// 			.leftJoin(category, eq(transaction.categoryId, category.id))
	// 			.where(
	// 				and(
	// 					lt(transaction.amount, 0),
	// 					gte(transaction.timestamp, previous),
	// 					lt(transaction.timestamp, input?.startDate),
	// 				),
	// 			)
	// 			.groupBy(({ bin, category }) => [bin, category])
	// 			.orderBy(({ bin }) => asc(bin));

	// 		// Helper function to calculate period number from a date relative to a start date
	// 		const getPeriodNumber = (dateStr: string, startDate: Date): number => {
	// 			const binDate = new Date(dateStr);
	// 			const startMonth = startDate.getMonth();
	// 			const startYear = startDate.getFullYear();
	// 			const binMonth = binDate.getMonth();
	// 			const binYear = binDate.getFullYear();

	// 			// Calculate the difference in months
	// 			const monthDiff = (binYear - startYear) * 12 + (binMonth - startMonth);
	// 			return monthDiff + 1; // +1 to make it 1-indexed (Month 1, Month 2, etc.)
	// 		};

	// 		const dataMap = new Map<number, Record<string, unknown>>();

	// 		// Process previous data - calculate period number relative to previous period start
	// 		for (const transactionBin of previousData) {
	// 			const periodNumber = getPeriodNumber(
	// 				String(transactionBin.bin),
	// 				previous,
	// 			);
	// 			if (!dataMap.has(periodNumber)) {
	// 				dataMap.set(periodNumber, {
	// 					bin: periodNumber,
	// 				});
	// 			}

	// 			const point = dataMap.get(periodNumber);
	// 			if (!point) {
	// 				continue;
	// 			}
	// 			const categoryName = String(transactionBin.category || "Others");
	// 			point[`prev_${categoryName}`] = -Number(transactionBin.sum);
	// 		}

	// 		// Process current data - calculate period number relative to current period start
	// 		for (const transactionBin of currentData) {
	// 			const periodNumber = getPeriodNumber(
	// 				String(transactionBin.bin),
	// 				input.startDate,
	// 			);
	// 			if (!dataMap.has(periodNumber)) {
	// 				dataMap.set(periodNumber, {
	// 					bin: periodNumber,
	// 				});
	// 			}
	// 			const point = dataMap.get(periodNumber);
	// 			if (!point) {
	// 				continue;
	// 			}
	// 			const categoryName = String(transactionBin.category || "Others");
	// 			point[`curr_${categoryName}`] = -Number(transactionBin.sum);
	// 		}

	// 		const data = Array.from(dataMap.values()).sort((a, b) => {
	// 			// Sort by period number extracted from "Month X"
	// 			const aNum = Number.parseInt(String(a.bin).replace("Month ", ""), 10);
	// 			const bNum = Number.parseInt(String(b.bin).replace("Month ", ""), 10);
	// 			return aNum - bNum;
	// 		});

	// 		const categories = await db
	// 			.select({ category: category.name, count: count() })
	// 			.from(category)
	// 			.rightJoin(transaction, eq(category.id, transaction.categoryId))
	// 			.groupBy(({ category }) => category)
	// 			.where(
	// 				and(
	// 					lt(transaction.amount, 0),
	// 					gte(transaction.timestamp, previous),
	// 					lt(transaction.timestamp, input?.endDate),
	// 				),
	// 			)
	// 			.having(({ count }) => gt(count, 0));

	// 		return {
	// 			categories: categories,
	// 			data: data,
	// 		};
	// 	}),

	listCategories: protectedProcedure.handler(async () => {
		return await BankTransactionService.listCategories();
	}),

	updateCategory: protectedProcedure
		.input(z.object({ id: z.string(), categoryId: z.string().nullable() }))
		.handler(async ({ input }) => {
			BankTransactionService.updateCategory(input.id, input.categoryId);
		}),

	previewImport: protectedProcedure
		.input(z.string())
		.handler(async ({ input }) => {
			return BankTransactionService.previewImport(input);
		}),

	createImport: protectedProcedure
		.input(z.string())
		.handler(async ({ input }) => {
			return await BankTransactionService.createImport(input);
		}),

	importList: protectedProcedure
		.input(z.object({ pagination }))
		.handler(async ({ input }) => {
			const { count, fileImports } = await FileImportService.getAll(
				input.pagination,
			);
			return {
				count: count,
				data: fileImports,
			};
		}),
};
