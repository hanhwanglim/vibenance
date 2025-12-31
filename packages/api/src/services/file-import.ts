import type { FileImportUpdate } from "@vibenance/db/schema/file";
import { FileImportRepository } from "../repository/file-import";
import type { Pagination } from "../utils/filter";

export const FileImportService = {
	findById: async (id: string) => {
		return await FileImportRepository.findById(id);
	},

	create: async () => {
		return await FileImportRepository.create();
	},

	update: async (id: string, update: FileImportUpdate) => {
		return await FileImportRepository.update(id, update);
	},

	getAll: async (pagination: Pagination) => {
		return {
			count: await FileImportRepository.count(),
			fileImports: await FileImportRepository.getAll(pagination),
		};
	},
};
