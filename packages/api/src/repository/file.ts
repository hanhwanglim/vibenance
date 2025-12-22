import { db } from "@vibenance/db";
import { file } from "@vibenance/db/schema/file";
import { eq } from "drizzle-orm";

type FileInsert = typeof file.$inferInsert;
type FileUpdate = Partial<Omit<FileInsert, "id" | "createdAt">>;

export const FileRepository = {
	findById: async (id: number) => {
		return (
			(await db.query.file.findFirst({
				where: (file, { eq }) => eq(file.id, id),
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

	update: async (id: number, update: FileUpdate) => {
		return await db.update(file).set(update).where(eq(file.id, id)).returning();
	},
};

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
};
