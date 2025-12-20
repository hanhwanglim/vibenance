import { db } from "@vibenance/db";
import type { BunFile } from "bun";
import Papa from "papaparse";
import type { TransactionRow } from "../../core/transaction";
import type { MonzoTransactionRow } from "./config";

export async function parse(file: BunFile) {
	const data: Papa.ParseResult<MonzoTransactionRow> = Papa.parse(
		await file.text(),
		{ header: true, skipEmptyLines: true },
	);
	const transactions: Array<TransactionRow> = [];

	const errorRows = new Map(data.errors.map((row) => [row.index, row.message]));

	const categories = await db.query.category.findMany();
	const categoryMap = new Map(
		categories.map((category) => [category.name, category]),
	);

	data.data.forEach((row, index) => {
		const [day, month, year] = row.Date.split("/").map(Number);
		const [hours, mins, secs] = row.Time.split(":").map(Number);
		const category = categoryMap.get(row.Category);

		const transaction: TransactionRow = {
			transactionId: row["Transaction ID"],
			timestamp: new Date(year, month - 1, day, hours, mins, secs),
			name: row.Name,
			currency: row.Currency,
			amount: row.Amount,
			categoryId: category?.id || null,
			category: category || null,
			reference: row["Notes and #tags"],
			errors: errorRows.get(index),
		};

		transactions.push(transaction);
	});

	return transactions;
}
