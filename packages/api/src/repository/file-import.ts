import { db } from "@vibenance/db";
import { fileImport } from "@vibenance/db/schema/file";
import { eq } from "drizzle-orm";

type FileImportUpdate = Partial<typeof fileImport.$inferInsert>;

export const FileImportRepository = {
	findById: async (id: number) => {
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

	update: async (id: number, update: FileImportUpdate) => {
		return await db
			.update(fileImport)
			.set(update)
			.where(eq(fileImport.id, id))
			.returning();
	},
};
