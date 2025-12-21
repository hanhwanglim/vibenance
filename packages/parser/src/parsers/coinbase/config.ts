import type { BunFile } from "bun";
import Papa from "papaparse";

export const CoinbaseCsvHeaders = [
	"ID",
	"Timestamp",
	"Transaction Type",
	"Asset",
	"Quantity Transacted",
	"Price Currency",
	"Price at Transaction",
	"Subtotal",
	"Total (inclusive of fees and/or spread)",
	"Fees and/or Spread",
	"Notes",
];

export interface CoinbaseTransactionRow {
	ID: string;
	Timestamp: string;
	"Transaction Type": string;
	Asset: string;
	"Quantity Transacted": string;
	"Price Currency": string;
	"Price at Transaction": string;
	Subtotal: string;
	"Total (inclusive of fees and/or spread)": string;
	"Fees and/or Spread": string;
	Notes: string;
}

export async function isCoinbaseCsv(file: BunFile) {
	const result = Papa.parse(await file.text(), {
		skipEmptyLines: true,
		preview: 4,
	});
	if (result.data.length < 3) {
		return false;
	}

	if (result.data.at(0).at(0) !== "Transactions") {
		return false;
	}

	return CoinbaseCsvHeaders.every((header) =>
		result.data.at(2).includes(header),
	);
}
