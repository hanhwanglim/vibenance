import crypto from "node:crypto";
import path from "node:path";
import { db } from "@vibenance/db";
import { file } from "@vibenance/db/schema/file";
import { detectParser, parseFile } from "@vibenance/parser/core/parse";
import z from "zod";
import { protectedProcedure } from "../index";

export const fileRouter = {
	upload: protectedProcedure.input(z.file()).handler(async ({ input }) => {
		const uploadDir = path.join(
			"/tmp",
			`${crypto.randomUUID()}${path.extname(input.name)}`,
		);
		const arrayBuffer = await input.arrayBuffer();

		const hasher = new Bun.CryptoHasher("md5");
		hasher.update(arrayBuffer);

		Bun.write(uploadDir, Buffer.from(arrayBuffer));

		const [uploadedFile] = await db
			.insert(file)
			.values({
				fileName: input.name,
				filePath: uploadDir,
				fileHash: hasher.digest("hex"),
				fileSize: input.size,
				source: "upload",
			})
			.returning();

		return uploadedFile;
	}),

	get: protectedProcedure.input(z.number()).handler(async ({ input }) => {
		return await db.query.file.findFirst({
			where: (file, { eq }) => eq(file.id, input),
		});
	}),

	preview: protectedProcedure.input(z.number()).handler(async ({ input }) => {
		const fileImport = await db.query.fileImport.findFirst({
			where: (fileImport, { eq }) => eq(fileImport.id, input),
			with: {
				files: true,
			},
		});

		const filePath = fileImport?.files[0]?.filePath;
		const file = Bun.file(filePath);
		const parseType = await detectParser(file);
		return await parseFile(file, parseType);
	}),
};
