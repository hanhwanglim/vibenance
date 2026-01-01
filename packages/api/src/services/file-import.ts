import type { FileImportUpdate } from "@vibenance/db/schema/file";
import { FileImportRepository } from "../repository/file-import";
import type { Pagination } from "../utils/filter";

export const FileImportService = {
	findById: async (id: string) => {
		return await FileImportRepository.findById(id);
	},

	create: async (type: "transactions" | "assets") => {
		return await FileImportRepository.create(type);
	},

	update: async (id: string, update: FileImportUpdate) => {
		return await FileImportRepository.update(id, update);
	},

	getAll: async (type: "transactions" | "assets", pagination: Pagination) => {
		const [fileImports, transactionCount] = await Promise.all([
			FileImportRepository.getAll(type, pagination),
			FileImportRepository.getTransactionCount(type, pagination),
		]);

		const transactionCountMap = new Map(
			transactionCount.map((obj) => [obj.id, obj]),
		);
		const result = fileImports.map((obj) => ({
			...obj,
			...(transactionCountMap.get(obj.id) || { transactionCount: 0 }),
		}));

		return {
			count: await FileImportRepository.count(type),
			fileImports: result,
		};
	},
};
