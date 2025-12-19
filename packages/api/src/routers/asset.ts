import { db } from "@vibenance/db";
import { investmentTransaction } from "@vibenance/db/schema/asset";
import { file, fileImport } from "@vibenance/db/schema/file";
import { transaction } from "@vibenance/db/schema/transaction";
import { and, desc, eq, gte, lt } from "drizzle-orm";
import z from "zod";
import { protectedProcedure } from "../index";
import { parseFile } from "../services/investment/parse";

export const assetRouter = {
	getAll: protectedProcedure
		.input(
			z.object({
				pagination: z.object({
					pageIndex: z.number().default(0),
					pageSize: z.number().default(20),
				}),
				dateRange: z.object({ from: z.date(), to: z.date() }),
				type: z.string(),
			}),
		)
		.handler(async ({ input }) => {
			const filter =
				input.type === "all"
					? []
					: [eq(investmentTransaction.type, input.type)];

			const numTransactions = await db.$count(
				investmentTransaction,
				and(
					gte(investmentTransaction.timestamp, input.dateRange.from),
					lt(investmentTransaction.timestamp, input.dateRange.to),
					...filter,
				),
			);

			const transactions = await db.query.investmentTransaction.findMany({
				orderBy: [desc(transaction.timestamp), desc(transaction.createdAt)],
				where: (investmentTransaction, { lt, gte, and }) =>
					and(
						gte(investmentTransaction.timestamp, input.dateRange.from),
						lt(investmentTransaction.timestamp, input.dateRange.to),
						...filter,
					),
				with: {
					account: true,
				},
				limit: input.pagination.pageSize,
				offset: input.pagination.pageIndex * input.pagination.pageSize,
			});

			return {
				count: numTransactions,
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
				.insert(investmentTransaction)
				.values(transactions)
				.onConflictDoNothing();

			await db
				.update(fileImport)
				.set({ status: "success" })
				.where(eq(fileImport.id, input.fileImportId));

			return objs;
		}),

	importPreview: protectedProcedure
		.input(z.number())
		.handler(async ({ input }) => {
			const fileImport = await db.query.fileImport.findFirst({
				where: (fileImport, { eq }) => eq(fileImport.id, input),
				with: {
					files: true,
				},
			});
			const file = fileImport?.files[0];
			return await parseFile(Bun.file(file?.filePath) as File);
		}),

	createImport: protectedProcedure
		.input(z.number())
		.handler(async ({ input }) => {
			const [obj] = await db.insert(fileImport).values({}).returning();
			await db
				.update(file)
				.set({ fileImportId: obj?.id })
				.where(eq(file.id, input));
			return obj;
		}),

	importList: protectedProcedure
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
