import { transactionTypeEnumSchema } from "@vibenance/db/schema/transaction";
import z from "zod";
import { protectedProcedure } from "../index";
import { BankTransactionService } from "../services/bank-transaction";
import { FileImportService } from "../services/file-import";
import { dateRange, pagination } from "../utils/filter";

export const transactionRouter = {
	getAll: protectedProcedure
		.input(
			z.object({
				pagination: pagination,
				dateRange: dateRange.optional(),
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
						type: transactionTypeEnumSchema,
						currency: z.string(),
						amount: z.string(),
						categoryId: z.string().nullable().optional(),
						reference: z.string().optional(),
						metadata: z.record(
							z.string(),
							z.union([z.string(), z.number(), z.date(), z.undefined()]),
						),
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
		.input(z.object({ dateRange: dateRange.optional() }))
		.handler(async ({ input }) => {
			return await BankTransactionService.getSummary(input.dateRange);
		}),

	categoryBreakdown: protectedProcedure
		.input(z.object({ dateRange: dateRange.optional() }))
		.handler(async ({ input }) => {
			return await BankTransactionService.categoryBreakdown(input.dateRange);
		}),

	spendingTrend: protectedProcedure
		.input(z.object({ dateRange: dateRange.optional() }))
		.handler(async ({ input }) => {
			return await BankTransactionService.spendingTrend(input.dateRange);
		}),

	spendingTrendByCategory: protectedProcedure
		.input(z.object({ dateRange: dateRange.optional() }))
		.handler(async ({ input }) => {
			return await BankTransactionService.spendingTrendByCategory(
				input.dateRange,
			);
		}),

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
				"transactions",
				input.pagination,
			);
			return {
				count: count,
				data: fileImports,
			};
		}),
};
