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
		const dateParts = row.Date.split("/").map(Number);
		const timeParts = row.Time.split(":").map(Number);

		if (dateParts.length < 3 || timeParts.length < 3) {
			return;
		}

		const [day, month, year] = dateParts;
		const [hours, mins, secs] = timeParts;

		if (
			day === undefined ||
			month === undefined ||
			year === undefined ||
			hours === undefined ||
			mins === undefined ||
			secs === undefined
		) {
			return;
		}

		const category = categoryMap.get(row.Category);

		const transaction: TransactionRow = {
			transactionId: row["Transaction ID"],
			timestamp: new Date(year, month - 1, day, hours, mins, secs),
			name: row.Name,
			type: Number(row.Amount) < 0 ? "expense" : "income",
			currency: row.Currency,
			amount: row.Amount.replace("-", ""),
			categoryId: category?.id || null,
			category: category || null,
			reference:
				row["Notes and #tags"].length > 0 ? row["Notes and #tags"] : undefined,
			errors: errorRows.get(index),
			metadata: row,
		};

		transactions.push(transaction);
	});

	return transactions;
}
