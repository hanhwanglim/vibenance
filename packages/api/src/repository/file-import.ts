import { db } from "@vibenance/db";
import { type FileImportUpdate, fileImport } from "@vibenance/db/schema/file";
import { desc, eq } from "drizzle-orm";
import type { Pagination } from "../utils";

export const FileImportRepository = {
	findById: async (id: string) => {
		return (
			(await db.query.fileImport.findFirst({
				where: (fileImport, { eq }) => eq(fileImport.id, id),
				with: {
					files: true,
				},
			})) || null
		);
	},

	create: async () => {
		const [obj] = await db.insert(fileImport).values({}).returning();
		return obj || null;
	},

	update: async (id: string, update: FileImportUpdate) => {
		return await db
			.update(fileImport)
			.set(update)
			.where(eq(fileImport.id, id))
			.returning();
	},

	count: async () => {
		return await db.$count(fileImport);
	},

	getAll: async (pagination: Pagination) => {
		return await db.query.fileImport.findMany({
			with: {
				files: true,
			},
			limit: pagination.pageSize,
			offset: pagination.pageIndex * pagination.pageSize,
			orderBy: [desc(fileImport.createdAt), desc(fileImport.id)],
		});
	},
};
