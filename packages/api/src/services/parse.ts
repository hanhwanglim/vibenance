import { db } from "@vibenance/db";
import type { transaction } from "@vibenance/db/schema/transaction";
import Papa from "papaparse";

type Transaction = typeof transaction.$inferInsert;

export enum BankFormat {
	MONZO = "monzo",
	AMEX = "amex",
	UNKNOWN = "unknown",
}

export interface ParseResult {
	count: number;
	valid: number;
	invalid: number;
	format: BankFormat;
	transactions: Transaction[];
}

export interface MonzoTransaction {
	transactionId: string;
	date: string;
	time: string;
	type: string;
	name: string;
	category: string;
	amount: string;
	currency: string;
	notes: string;

	errors?: string[];
}

interface MonzoTransactionRow {
	"Transaction ID": string;
	Date: string;
	Time: string;
	Type: string;
	Name: string;
	Category: string;
	Amount: string;
	Currency: string;
	"Notes and #tags": string;
}

interface AmexTransactionRow {
	Date: string;
	Description: string;
	Amount: string;
	"Appears On Your Statement As": string;
	Reference: string;
	Category: string;
}

export async function parseFile(file: File) {
	try {
		const text = await file.text();
		return await parseText(text);
	} catch (e) {
		console.error(e);
	}
}

export async function parseText(text: string): Promise<ParseResult> {
	let data: Papa.ParseResult<Record<string, unknown>>;
	data = Papa.parse(text, { header: true, skipEmptyLines: true });
	if (!isHeader(data.meta.fields || [])) {
		data = Papa.parse(text, { header: false, skipEmptyLines: true });
	}

	const bankFormat = detectBankFormat(data.meta.fields || []);

	switch (bankFormat) {
		case BankFormat.MONZO:
			return parseMonzo(
				data as unknown as Papa.ParseResult<MonzoTransactionRow>,
			);
		case BankFormat.AMEX:
			return parseAmex(data as unknown as Papa.ParseResult<AmexTransactionRow>);
		default:
			throw new Error("Unknown bank format");
	}
}

// If a header contains a number, it quite likely is not a header
function isHeader(headers: string[]) {
	return !headers.some((header) => /\d/.test(header));
}

function detectBankFormat(headers: string[]): BankFormat {
	if (
		headers.includes("Transaction ID") &&
		headers.includes("Date") &&
		headers.includes("Emoji") &&
		headers.includes("Amount") &&
		headers.includes("Notes and #tags") &&
		headers.includes("Description")
	) {
		return BankFormat.MONZO;
	}
	if (
		headers.includes("Date") &&
		headers.includes("Description") &&
		headers.includes("Amount") &&
		headers.includes("Appears On Your Statement As") &&
		headers.includes("Reference") &&
		headers.includes("Category")
	) {
		return BankFormat.AMEX;
	}
	return BankFormat.UNKNOWN;
}

async function parseMonzo(
	data: Papa.ParseResult<MonzoTransactionRow>,
): Promise<ParseResult> {
	const result: ParseResult = {
		count: data.data.length,
		valid: data.data.length - data.errors.length,
		invalid: data.errors.length,
		format: BankFormat.MONZO,
		transactions: [],
	};

	const errorRows = new Set<number>();
	data.errors.forEach((error) => {
		errorRows.add(error.row as number);
	});

	const categories = await db.query.category.findMany();
	const categoryMap = new Map(categories.map((cat) => [cat.name, cat]));

	data.data.forEach((row) => {
		const [day, month, year] = row.Date.split("/").map(Number);
		const [hours, mins, secs] = row.Time.split(":").map(Number);
		const category = categoryMap.get(row.Category);

		const transaction: Transaction = {
			transactionHash: row["Transaction ID"],
			timestamp: new Date(
				year as number,
				(month as number) - 1,
				day,
				hours,
				mins,
				secs,
			),
			name: row.Name,
			currency: row.Currency,
			amount: row.Amount,
			categoryId: category?.id,
			category: category,
			reference: row["Notes and #tags"],
		};

		result.transactions.push(transaction);
	});
	return result;
}

async function parseAmex(
	data: Papa.ParseResult<AmexTransactionRow>,
): Promise<ParseResult> {
	const result: ParseResult = {
		count: data.data.length,
		valid: data.data.length - data.errors.length,
		invalid: data.errors.length,
		format: BankFormat.AMEX,
		transactions: [],
	};

	const errorRows = new Set<number>();
	data.errors.forEach((error) => {
		errorRows.add(error.row as number);
	});

	const categories = await db.query.category.findMany();
	const categoryMap = new Map(categories.map((cat) => [cat.name, cat]));

	data.data.forEach((row) => {
		const [day, month, year] = row.Date.split("/").map(Number);
		const category = categoryMap.get(row.Category);

		const transaction: Transaction = {
			transactionHash: row.Reference.replaceAll("'", ""), // Amex wraps with "'"
			timestamp: new Date(year as number, (month as number) - 1, day),
			name: row["Appears On Your Statement As"],
			currency: "GBP",
			amount: row.Amount,
			categoryId: category.id,
			category: category,
		};

		result.transactions.push(transaction);
	});

	return result;
}
