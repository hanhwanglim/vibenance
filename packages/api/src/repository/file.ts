import { db } from "@vibenance/db";
import {
	type FileInsert,
	type FileUpdate,
	file,
} from "@vibenance/db/schema/file";
import { eq } from "drizzle-orm";

export const FileRepository = {
	findById: async (id: string) => {
		return (
			(await db.query.file.findFirst({
				where: {
					id: id,
				},
			})) || null
		);
	},

	create: async ({ fileName, filePath, fileHash, fileSize }: FileInsert) => {
		const [uploadedFile] = await db
			.insert(file)
			.values({
				fileName: fileName,
				filePath: filePath,
				fileHash: fileHash,
				fileSize: fileSize,
				source: "upload",
			})
			.returning();
		return uploadedFile || null;
	},

	update: async (id: string, update: FileUpdate) => {
		return await db.update(file).set(update).where(eq(file.id, id)).returning();
	},
};

export const FileImportRepository = {
	findById: async (id: string) => {
		return (
			(await db.query.fileImport.findFirst({
				where: {
					id: id,
				},
				with: {
					files: true,
				},
			})) || null
		);
	},
};
