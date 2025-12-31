import type { BunFile } from "bun";
import Papa from "papaparse";
import type { TransactionRow } from "../../core/investment";
import {
	JPMorganInvestmentActivityCsvHeaders,
	type JPMorganInvestmentActivityRow,
	JPMorganTransactionHistoryCsvHeaders,
	type JPMorganTransactionHistoryRow,
} from "./config";

export async function parse(file: BunFile): Promise<TransactionRow[]> {
	const result: Papa.ParseResult<
		JPMorganInvestmentActivityRow | JPMorganTransactionHistoryRow
	> = Papa.parse(await file.text(), { header: true, skipEmptyLines: true });

	const headers = result.meta.fields || [];

	if (
		JSON.stringify(headers) ===
		JSON.stringify(JPMorganInvestmentActivityCsvHeaders)
	) {
		return await parseInvestmentActivity(
			result as Papa.ParseResult<JPMorganInvestmentActivityRow>,
		);
	}
	if (
		JSON.stringify(headers) ===
		JSON.stringify(JPMorganTransactionHistoryCsvHeaders)
	) {
		return await parseTransactionHistory(
			result as Papa.ParseResult<JPMorganTransactionHistoryRow>,
		);
	}

	return [];
}

async function parseInvestmentActivity(
	result: Papa.ParseResult<JPMorganInvestmentActivityRow>,
): Promise<TransactionRow[]> {
	const transactions: Array<TransactionRow> = [];

	const errorRows = new Map(
		result.errors.map((row) => [row.index, row.message]),
	);

	const remapType = (type: string) => {
		const upper = type.toLowerCase();
		if (upper.indexOf("purchase") >= 0) {
			return "buy";
		}
		if (upper.indexOf("sale") >= 0) {
			return "sell";
		}
		if (upper.indexOf("dividend") >= 0) {
			return "dividend";
		}
		if (upper.indexOf("interest") >= 0) {
			return "interest";
		}
		if (upper.indexOf("fee") >= 0) {
			return "fee";
		}
		console.warn("Unsupported type:", type);
		return "other";
	};

	result.data.forEach((row, index) => {
		const type = remapType(row.Description);

		const transaction = {
			transactionId: generateHash(JSON.stringify(row)),
			timestamp: new Date(row.Date),
			name: `${row.Pot} - ${row.Description}`,
			type: type,
			asset: row["Asset Code"],
			quantity: row["No. Shares"],
			currency: "GBP",
			price: row["Share Price (£)"],
			fees: type === "fee" ? row["Total Value (£)"] : "0",
			total: row["Total Value (£)"],
			error: errorRows.get(index),
			metadata: row,
		};

		transactions.push(transaction);
	});

	return transactions;
}

async function parseTransactionHistory(
	result: Papa.ParseResult<JPMorganTransactionHistoryRow>,
): Promise<TransactionRow[]> {
	const transactions: Array<TransactionRow> = [];

	const errorRows = new Map(
		result.errors.map((row) => [row.index, row.message]),
	);

	result.data.forEach((row, index) => {
		const transaction = {
			transactionId: generateHash(JSON.stringify(row)),
			timestamp: new Date(row.Date),
			name: `${row.Description} - ${row.Pot}`,
			type: "deposit",
			asset: "GBP",
			quantity: row["Amount (£)"],
			currency: "GBP",
			price: "1",
			fees: "0",
			total: row["Amount (£)"],
			error: errorRows.get(index),
			metadata: row,
		};

		transactions.push(transaction);
	});

	return transactions;
}

function generateHash(content: string): string {
	const hasher = new Bun.CryptoHasher("md5");
	hasher.update(content);
	return hasher.digest("hex");
}
