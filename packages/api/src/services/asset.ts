import type {
	InvestmentTransactionInsert,
	InvestmentTransactionType,
} from "@vibenance/db/schema/asset";
import { detectParser, parseFile } from "@vibenance/parser/core/parse";
import { AssetRepository } from "../repository/asset";
import type { DateRange, Pagination } from "../utils/filter";
import { FileService } from "./file";
import { FileImportService } from "./file-import";

type TransactionCreate = Omit<
	InvestmentTransactionInsert,
	"id" | "accountId" | "categoryId"
>;

export const AssetService = {
	getAll: async (
		type: InvestmentTransactionType | undefined,
		dateRange: DateRange | undefined,
		pagination: Pagination,
	) => {
		const count = await AssetRepository.count(type, dateRange);
		const transactions = await AssetRepository.getAll(
			type,
			dateRange,
			pagination,
		);

		return { count, transactions };
	},

	bulkCreate: async (
		transactions: TransactionCreate[],
		accountId: string,
		fileImportId: string,
	) => {
		const txs = transactions.map((transaction) => {
			return {
				...transaction,
				accountId: accountId,
				fileImportId: fileImportId,
			};
		});

		const objs = await AssetRepository.bulkCreate(txs);
		await FileImportService.update(fileImportId, { status: "success" });

		return objs;
	},

	previewImport: async (id: string) => {
		const fileImport = await FileImportService.findById(id);
		if (!fileImport || !fileImport.files[0]) {
			throw new Error("NOT FOUND");
		}

		const file = Bun.file(fileImport.files[0].filePath);

		const parseType = await detectParser(file);
		return await parseFile(file, parseType);
	},

	createImport: async (fileId: string) => {
		const fileImport = await FileImportService.create();
		if (!fileImport) {
			throw new Error("INTERNAL SERVER ERROR");
		}

		await FileService.update(fileId, { fileImportId: fileImport.id });
		return fileImport || null;
	},
};
