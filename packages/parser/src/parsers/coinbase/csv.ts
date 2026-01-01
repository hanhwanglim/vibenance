import type { BunFile } from "bun";
import Papa from "papaparse";
import type { TransactionRow } from "../../core/investment";
import type { CoinbaseTransactionRow } from "./config";

export async function parse(file: BunFile) {
	const result: Papa.ParseResult<CoinbaseTransactionRow> = Papa.parse(
		await file.text(),
		{ header: true, skipEmptyLines: true, skipFirstNLines: 3 },
	);
	const transactions: Array<TransactionRow> = [];

	const errorRows = new Map(
		result.errors.map((row) => [row.index, row.message]),
	);

	const remapType = (type: string) => {
		const upper = type.toLowerCase();
		if (upper.indexOf("buy") >= 0) {
			return "buy" as const;
		}
		if (upper.indexOf("sell") >= 0) {
			return "sell" as const;
		}
		if (upper.indexOf("deposit") >= 0) {
			return "deposit" as const;
		}
		if (upper.indexOf("reward") >= 0) {
			return "reward" as const;
		}
		console.warn("Unsupported type:", type);
		return "other" as const;
	};

	result.data.forEach((row, index) => {
		const transaction = {
			transactionId: row.ID,
			timestamp: new Date(row.Timestamp),
			name: row.Notes,
			type: remapType(row["Transaction Type"]),
			asset: row.Asset,
			quantity: row["Quantity Transacted"],
			currency: row["Price Currency"].replace("$", ""),
			price: row["Price at Transaction"].replace("$", ""),
			fees: row["Fees and/or Spread"].replace("$", ""),
			total: row["Total (inclusive of fees and/or spread)"].replace("$", ""),
			error: errorRows.get(index),
			metadata: row,
		};

		transactions.push(transaction);
	});

	return transactions;
}
