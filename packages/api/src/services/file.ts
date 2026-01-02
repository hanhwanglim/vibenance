import path from "node:path";
import type { FileUpdate } from "@vibenance/db/schema/file";
import type z from "zod";
import { config } from "../config";
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
		const fileName = `${crypto.randomUUID()}${path.extname(f.name)}`;
		const uploadPath = path.join(config.uploadsPath, fileName);

		const arrayBuffer = await f.arrayBuffer();
		await Bun.write(uploadPath, Buffer.from(arrayBuffer));

		const hasher = new Bun.CryptoHasher("md5");
		hasher.update(arrayBuffer);

		const uploadedFile = await FileRepository.create({
			fileName: f.name,
			filePath: uploadPath,
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
