import { db } from "@vibenance/db";
import type { BunFile } from "bun";
import Papa from "papaparse";
import type { TransactionRow } from "../../core/transaction";
import type { AmexTransactionRow } from "./config";

export async function parse(file: BunFile) {
	const data: Papa.ParseResult<AmexTransactionRow> = Papa.parse(
		await file.text(),
		{ header: true, skipEmptyLines: true },
	);
	const transactions: Array<TransactionRow> = [];

	const errorRows = new Map(data.errors.map((row) => [row.index, row.message]));

	const categories = await db.query.category.findMany();
	const categoryMap = new Map(
		categories.map((category) => [category.name, category]),
	);

	const remapCategory = (category: string) => {
		switch (category) {
			case "General Purchases-Groceries":
				return categoryMap.get("Groceries");
			case "Entertainment-Bars & Cafés":
				return categoryMap.get("Eating Out");
			case "Entertainment-Restaurants":
				return categoryMap.get("Eating Out");
			default: {
				console.warn("Unmapped category:", category);
				return null;
			}
		}
	};

	data.data.forEach((row, index) => {
		const [day, month, year] = row.Date.split("/").map(Number);
		const category = remapCategory(row.Category);
		const isCredit = Number(row.Amount) > 0;

		const transaction: TransactionRow = {
			transactionId: row.Reference.replaceAll("'", ""), // Amex wraps with "'"
			timestamp: new Date(year as number, (month as number) - 1, day),
			name: row["Appears On Your Statement As"],
			currency: "GBP",
			amount: isCredit ? `-${row.Amount}` : row.Amount,
			categoryId: category?.id || null,
			category: category || null,
			errors: errorRows.get(index),
			metadata: row,
		};

		transactions.push(transaction);
	});

	return transactions;
}
