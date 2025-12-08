import crypto from "node:crypto";
import path from "node:path";
import { db } from "@vibenance/db";
import { file } from "@vibenance/db/schema/file";
import z from "zod";
import { publicProcedure } from "../index";

export const fileRouter = {
	upload: publicProcedure.input(z.file()).handler(async ({ input }) => {
		const uploadDir = path.join(
			"/tmp",
			`${crypto.randomUUID()}${path.extname(input.name)}`,
		);
		Bun.write(uploadDir, Buffer.from(await input.arrayBuffer()));

		return await db.insert(file).values({
			fileName: input.name,
			filePath: uploadDir,
			fileHash: "",
			fileSize: input.size,
			source: "upload",
		});
	}),
};
