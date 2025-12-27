import path from "node:path";
import type { FileUpdate } from "@vibenance/db/schema/file";
import type z from "zod";
import { FileRepository } from "../repository/file";

export const FileService = {
	getFile: async (id: string) => {
		const file = await FileRepository.findById(id);
		if (!file) {
			throw new Error("NOT FOUND");
		}
		return file;
	},

	uploadFile: async (f: z.core.File) => {
		const uploadDir = path.join(
			"/tmp",
			`${crypto.randomUUID()}${path.extname(f.name)}`,
		);

		const arrayBuffer = await f.arrayBuffer();
		Bun.write(uploadDir, Buffer.from(arrayBuffer));

		const hasher = new Bun.CryptoHasher("md5");
		hasher.update(arrayBuffer);

		const uploadedFile = await FileRepository.create({
			fileName: f.name,
			filePath: uploadDir,
			fileHash: hasher.digest("hex"),
			fileSize: f.size,
		});

		if (!uploadedFile) {
			throw new Error("INTERNAL SERVER ERROR");
		}

		return uploadedFile;
	},

	update: async (id: string, update: FileUpdate) => {
		return await FileRepository.update(id, update);
	},
};
