import { db } from "@vibenance/db";
import { investmentTransaction } from "@vibenance/db/schema/asset";
import { type FileImportUpdate, fileImport } from "@vibenance/db/schema/file";
import { transaction } from "@vibenance/db/schema/transaction";
import { desc, eq } from "drizzle-orm";
import type { Pagination } from "../utils/filter";

export const FileImportRepository = {
	findById: async (id: string) => {
		return (
			(await db.query.fileImport.findFirst({
				with: {
					files: true,
				},
				where: {
					id: id,
				},
			})) || null
		);
	},

	create: async (type: "transactions" | "assets") => {
		const [obj] = await db
			.insert(fileImport)
			.values({ type: type })
			.returning();
		return obj || null;
	},

	update: async (id: string, update: FileImportUpdate) => {
		return await db
			.update(fileImport)
			.set(update)
			.where(eq(fileImport.id, id))
			.returning();
	},

	count: async (type: "transactions" | "assets") => {
		return await db.$count(fileImport, eq(fileImport.type, type));
	},

	getAll: async (type: "transactions" | "assets", pagination: Pagination) => {
		return await db.query.fileImport.findMany({
			with: {
				files: true,
			},
			where: {
				type: type,
			},
			orderBy: {
				createdAt: "desc",
			},
			limit: pagination.pageSize,
			offset: pagination.pageIndex * pagination.pageSize,
		});
	},

	getTransactionCount: async (
		type: "transactions" | "assets",
		pagination: Pagination,
	) => {
		const model = type === "transactions" ? transaction : investmentTransaction;

		return await db
			.select({
				id: fileImport.id,
				transactionCount: db.$count(
					model,
					eq(model.fileImportId, fileImport.id),
				),
			})
			.from(fileImport)
			.rightJoin(model, eq(model.fileImportId, fileImport.id))
			.groupBy(fileImport.id)
			.orderBy(desc(fileImport.createdAt))
			.limit(pagination.pageSize)
			.offset(pagination.pageSize * pagination.pageIndex);
	},
};
