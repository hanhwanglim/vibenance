import crypto from "node:crypto";
import path from "node:path";
import { db } from "@vibenance/db";
import { file } from "@vibenance/db/schema/file";
import z from "zod";
import { publicProcedure } from "../index";
import { parseFile } from "../services/parse";

export const fileRouter = {
	upload: publicProcedure.input(z.file()).handler(async ({ input }) => {
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

	get: publicProcedure.input(z.number()).handler(async ({ input }) => {
		return await db.query.file.findFirst({
			where: (file, { eq }) => eq(file.id, input),
		});
	}),

	preview: publicProcedure.input(z.number()).handler(async ({ input }) => {
		const file = await db.query.file.findFirst({
			where: (file, { eq }) => eq(file.id, input),
		});

		return await parseFile(Bun.file(file?.filePath) as File);
	}),
};
