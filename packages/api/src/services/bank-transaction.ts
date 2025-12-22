import type { TransactionInsert } from "@vibenance/db/schema/transaction";
import { detectParser, parseFile } from "@vibenance/parser/core/parse";
import { BankTransactionRepository } from "../repository/bank-transaction";
import { FileRepository } from "../repository/file";
import { FileImportRepository } from "../repository/file-import";

type TransactionCreate = Omit<
	TransactionInsert,
	"id" | "accountId" | "categoryId"
>;

export const BankTransactionService = {
	previewImport: async (id: number) => {
		const fileImport = await FileImportRepository.findById(id);
		if (!fileImport || !fileImport.files[0]) {
			throw new Error("NOT FOUND");
		}

		const file = Bun.file(fileImport.files[0].filePath);

		const parseType = await detectParser(file);
		return await parseFile(file, parseType);
	},

	createImport: async (fileId: number) => {
		const fileImport = await FileImportRepository.create();
		if (!fileImport) {
			throw new Error("INTERNAL SERVER ERROR");
		}

		const [file] = await FileRepository.update(fileId, {
			fileImportId: fileImport.id,
		});
		return file || null;
	},

	bulkCreate: async (
		transactions: Array<TransactionCreate>,
		accountId: number,
		fileImportId: number,
	) => {
		const txs = transactions.map((tx) => {
			return {
				...tx,
				accountId: accountId,
				fileImportId: fileImportId,
			};
		});

		const objs = await BankTransactionRepository.bulkCreate(txs);
		await FileImportRepository.update(fileImportId, { status: "success" });

		return objs;
	},

	updateCategory: async (transactionId: number, categoryId: number | null) => {
		return await BankTransactionRepository.updateCategory(
			transactionId,
			categoryId,
		);
	},
};
