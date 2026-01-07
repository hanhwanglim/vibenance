import type { BunFile } from "bun";
import type { TransactionRow } from "../../core/transaction";
import type { HsbcTransactionRow } from "./config";

export async function parse(file: BunFile) {
	const { PDFParse } = await import("pdf-parse");

	const parser = new PDFParse({ data: await file.arrayBuffer() });

	const { pages } = await parser.getText();
	const transactions = pages
		.slice(1, pages.length - 1)
		.flatMap((page) => extractTable(page.text));

	await parser.destroy();
	return transactions;
}

function extractTable(text: string): TransactionRow[] {
	const lines = text
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line.length > 0);

	const headerIndex = lines.findIndex((line) =>
		line.includes("Received By Us Transaction Date Details"),
	);
	if (lines[headerIndex + 1] !== "Amount") {
		console.warn("HSBC statement table shifted");
		return [];
	}

	const tableStartIndex = headerIndex + 2;
	const tableEndIndex = lines.findIndex((line) =>
		line.includes("Summary Of Interest On this Statement"),
	);

	const transactions = lines
		.slice(tableStartIndex, tableEndIndex)
		.map((line) => parseTransactionLine(line))
		.filter((line) => line !== null)
		.map((extractedTransaction) => ({
			transactionId: generateHash(JSON.stringify(extractedTransaction)),
			timestamp: extractedTransaction["Transaction Date"],
			name: extractedTransaction.Details,
			type:
				Number(extractedTransaction.Amount) < 0
					? ("expense" as const)
					: ("transfer" as const),
			currency: "GBP",
			amount: extractedTransaction.Amount.replace("-", ""),
			categoryId: null,
			category: null,
			metadata: extractedTransaction,
		}));

	return transactions;
}

function parseTransactionLine(line: string): HsbcTransactionRow | null {
	// Pattern: DD MMM YY DD MMM YY ...details... amount
	// Date format: "10 Nov 25" (DD MMM YY)
	const datePattern = /(\d{1,2}\s+[A-Za-z]{3}\s+\d{2})/g;
	const dates = line.match(datePattern);

	if (!dates || dates.length < 2) {
		return null;
	}

	const receivedDate = dates[0];
	const transactionDate = dates[1];

	if (!transactionDate) {
		return null;
	}

	const secondDateEndIndex =
		line.indexOf(transactionDate) + transactionDate.length;
	const rest = line.substring(secondDateEndIndex).trim();

	// Amount is at the end - match last number (with optional commas and CR suffix)
	const amountMatch = rest.match(/([\d,]+\.?\d*)\s*(CR)?\s*$/);
	if (!amountMatch || !amountMatch[1]) {
		return null;
	}

	const originalAmountStr = amountMatch[1];
	const amountStr = originalAmountStr.replace(/,/g, "");

	const isCredit = amountMatch[2] === "CR";
	const amount = isCredit ? amountStr : `-${amountStr}`;

	const amountStartIndex = rest.lastIndexOf(originalAmountStr);
	const details = rest.substring(0, amountStartIndex).trim();

	return {
		"Received By Us": parseDate(receivedDate),
		"Transaction Date": parseDate(transactionDate),
		Details: details,
		Amount: amount,
	};
}

function generateHash(content: string): string {
	const hasher = new Bun.CryptoHasher("md5");
	hasher.update(content);
	return hasher.digest("hex");
}
function parseDate(dateStr: string): Date {
	// Format: "10 Nov 25" -> Date
	const [day, month, year] = dateStr.split(/\s+/);
	const monthMap: Record<string, number> = {
		Jan: 0,
		Feb: 1,
		Mar: 2,
		Apr: 3,
		May: 4,
		Jun: 5,
		Jul: 6,
		Aug: 7,
		Sep: 8,
		Oct: 9,
		Nov: 10,
		Dec: 11,
	};

	if (!month) {
		throw new Error(`Invalid date format: ${dateStr}`);
	}

	const monthIndex = monthMap[month];
	if (monthIndex === undefined) {
		throw new Error(`Invalid month: ${month}`);
	}

	if (!year || !day) {
		throw new Error(`Invalid date format: ${dateStr}`);
	}

	// Convert 2-digit year to 4-digit (assuming 2000s)
	const fullYear = 2000 + Number.parseInt(year, 10);

	return new Date(fullYear, monthIndex, Number.parseInt(day, 10));
}
