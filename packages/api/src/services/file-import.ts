import type { FileImportUpdate } from "@vibenance/db/schema/file";
import { FileImportRepository } from "../repository/file-import";
import type { Pagination } from "../utils/filter";
import { BankTransactionService } from "./bank-transaction";

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

		// For transactions type, compute preview counts for pending imports
		if (type === "transactions") {
			const pendingImports = fileImports.filter(
				(import_) => import_.status === "pending",
			);

			// Compute preview counts for pending imports in parallel
			const previewCountsPromises = pendingImports.map(async (import_) => {
				const counts = await BankTransactionService.getPreviewCounts(
					import_.id,
				);
				return { id: import_.id, ...counts };
			});

			const previewCounts = await Promise.all(previewCountsPromises);
			const previewCountsMap = new Map(
				previewCounts.map((obj) => [obj.id, obj]),
			);

			const result = fileImports.map((obj) => {
				const base = {
					...obj,
					...(transactionCountMap.get(obj.id) || { transactionCount: 0 }),
				};

				// Add preview counts for pending imports
				if (obj.status === "pending") {
					const counts = previewCountsMap.get(obj.id);
					if (counts) {
						return {
							...base,
							newCount: counts.newCount,
							similarCount: counts.similarCount,
							existingCount: counts.existingCount,
						};
					}
				}

				return base;
			});

			return {
				count: await FileImportRepository.count(type),
				fileImports: result,
			};
		}

		// For assets type, return as before
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
