import z from "zod";
import { protectedProcedure } from "../index";
import { AssetService } from "../services/asset";
import { FileImportService } from "../services/file-import";
import { dateRange, pagination } from "../utils";

export const assetRouter = {
	getAll: protectedProcedure
		.input(
			z.object({
				pagination,
				dateRange,
				type: z.string(),
			}),
		)
		.handler(async ({ input }) => {
			const { count, transactions } = await AssetService.getAll(
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
						type: z.string(),
						asset: z.string(),
						quantity: z.string(),
						currency: z.string(),
						price: z.string(),
						fees: z.string(),
						total: z.string(),
					}),
				),
				accountId: z.string(),
				fileImportId: z.string(),
			}),
		)
		.handler(async ({ input }) => {
			return AssetService.bulkCreate(
				input.transactions,
				input.accountId,
				input.fileImportId,
			);
		}),

	importPreview: protectedProcedure
		.input(z.string())
		.handler(async ({ input }) => {
			return AssetService.previewImport(input);
		}),

	createImport: protectedProcedure
		.input(z.string())
		.handler(async ({ input }) => {
			return await AssetService.createImport(input);
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
