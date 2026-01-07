import type { TransactionType } from "@vibenance/db/schema/transaction";
import type { BunFile } from "bun";
import type { TransactionRow } from "../../core/transaction";
import { ChipPdfHeaders, type ChipTransactionRow } from "./config";

export async function parse(file: BunFile) {
	const { PDFParse } = await import("pdf-parse");
	const parser = new PDFParse({ data: await file.arrayBuffer() });

	const { pages } = await parser.getText();
	const transactions = pages.flatMap((page) => extractTable(page.text));

	await parser.destroy();
	return transactions;
}

function extractTable(text: string): TransactionRow[] {
	const lines = text
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line.length > 0);

	const headerIndex = lines.findIndex((line) =>
		line.includes(ChipPdfHeaders.join(" ")),
	);
	if (headerIndex < 0) {
		return [];
	}

	const transactions = lines
		.slice(headerIndex + 1)
		.map((line) => parseTransactionLine(line))
		.filter((line) => line !== null)
		.map((extractedTransaction) => ({
			transactionId: generateHash(JSON.stringify(extractedTransaction)),
			timestamp: extractedTransaction.Date,
			type: getTransactionType(extractedTransaction),
			name: extractedTransaction.Description,
			currency: "GBP",
			amount: extractedTransaction["Amount (GBP)"].replace("-", ""),
			categoryId: null,
			category: null,
			metadata: extractedTransaction,
		}));

	return transactions;
}

function parseTransactionLine(line: string): ChipTransactionRow | null {
	const regex =
		/(\d{2}\/\d{2}\/\d{4})\s+([A-Za-z ]+)\s+(-?£[\d,]+\.\d{2}|£-?[\d,]+\.\d{2})(?:\s+(-?£[\d,]+\.\d{2}|£-?[\d,]+\.\d{2}))?/;

	const match = line.match(regex);
	if (!match) return null;
	const [, date, description, amount, balance] = match;

	if (!date || !description || !amount) {
		return null;
	}

	const [day, month, year] = date.split("/").map(Number);
	if (!day || !month || !year) {
		return null;
	}

	return {
		Date: new Date(year, month - 1, day),
		Description: description,
		"Amount (GBP)": formatCurrency(amount) as string,
		"Balance (GBP)": formatCurrency(balance),
	};
}

function generateHash(content: string): string {
	const hasher = new Bun.CryptoHasher("md5");
	hasher.update(content);
	return hasher.digest("hex");
}

function formatCurrency(amount: string | undefined) {
	if (!amount) return undefined;
	return amount.replace(",", "").replace("£", "");
}

function getTransactionType(row: ChipTransactionRow): TransactionType {
	if (row.Description === "Manual save") {
		return "transfer";
	}
	if (row.Description === "Interest") {
		return "interest";
	}
	if (row.Description === "Withdraw") {
		return "transfer";
	}

	console.error("Unsupported type", row.Description);
	throw new Error("Unsupported type");
}
