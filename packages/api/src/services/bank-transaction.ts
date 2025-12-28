import type { TransactionInsert } from "@vibenance/db/schema/transaction";
import { detectParser, parseFile } from "@vibenance/parser/core/parse";
import { BankTransactionRepository } from "../repository/bank-transaction";
import type { DateRange, Pagination } from "../utils";
import { FileService } from "./file";
import { FileImportService } from "./file-import";

type TransactionCreate = Omit<
	TransactionInsert,
	"id" | "accountId" | "fileImportId"
>;

export const BankTransactionService = {
	getAll: async (
		type: string,
		dateRange: DateRange | undefined,
		pagination: Pagination,
	) => {
		const count = await BankTransactionRepository.count(type, dateRange);
		const transactions = await BankTransactionRepository.getAll(
			type,
			dateRange,
			pagination,
		);

		return { count, transactions };
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

		await FileService.update(fileId, {
			fileImportId: fileImport.id,
		});
		return fileImport || null;
	},

	bulkCreate: async (
		transactions: Array<TransactionCreate>,
		accountId: string,
		fileImportId: string,
	) => {
		const txs = transactions.map((tx) => {
			return {
				...tx,
				accountId: accountId,
				fileImportId: fileImportId,
			};
		});

		const objs = await BankTransactionRepository.bulkCreate(txs);
		await FileImportService.update(fileImportId, { status: "success" });

		return objs;
	},

	getSummary: async (dateRange: DateRange | undefined) => {
		const [count, totalIncome, totalExpenses] = await Promise.all([
			BankTransactionRepository.count("all", dateRange),
			BankTransactionRepository.totalIncome(dateRange),
			BankTransactionRepository.totalExpenses(dateRange),
		]);

		return {
			count: count,
			totalIncome: totalIncome,
			totalExpenses: totalExpenses,
			netAmount: (Number(totalIncome) - Number(totalExpenses)).toString(),
		};
	},

	listCategories: async () => {
		return await BankTransactionRepository.listCategories();
	},

	updateCategory: async (transactionId: string, categoryId: string | null) => {
		return await BankTransactionRepository.updateCategory(
			transactionId,
			categoryId,
		);
	},
};
