import type { BunFile } from "bun";
import type { TransactionRow } from "../../core/transaction";
import type { ChaseTransactionRow } from "./config";

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
		line.includes("Date \tTransaction details \tAmount \tBalance"),
	);
	if (headerIndex < 0) {
		return [];
	}

	const transactionLines: Array<ChaseTransactionRow> = [];
	const relevantLines = lines.slice(headerIndex + 1);

	let currentGroup: string[] = [];
	for (const line of relevantLines) {
		if (line.includes("Opening balance")) {
			continue;
		}
		if (line.includes("Closing balance")) {
			break;
		}

		currentGroup.push(line);
		if (currentGroup.length === 3) {
			const row = parseTransactionLine(currentGroup);
			if (row) {
				transactionLines.push(row);
			}
			currentGroup = [];
		}
	}

	const transactions = transactionLines.map((row) => ({
		transactionId: generateHash(JSON.stringify(row)),
		date: row.Date,
		time: null,
		name: row["Transaction details"],
		type:
			row.Amount.charAt(0) === "-" ? ("expense" as const) : ("income" as const),
		currency: "GBP",
		amount: formatCurrency(row.Amount) || "0",
		categoryId: null,
		metadata: row,
	}));

	return transactions;
}

function parseTransactionLine(line: string[]): ChaseTransactionRow | null {
	const parsedLine = line
		.flatMap((line) => line.split("\t"))
		.map((part) => part.trim())
		.filter((part) => part.length > 0);

	if (parsedLine.length !== 5) {
		return null;
	}

	const [date, details, _, amount, balance] = parsedLine;

	if (!date || !details || !amount || !balance) {
		return null;
	}

	return {
		Date: parseDate(date),
		"Transaction details": details,
		Amount: amount,
		Balance: balance,
	};
}

function generateHash(content: string): string {
	const hasher = new Bun.CryptoHasher("md5");
	hasher.update(content);
	return hasher.digest("hex");
}

function parseDate(dateStr: string): Date {
	// Format: "10 Nov 2025" -> Date
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

	const fullYear = Number.parseInt(year, 10);

	return new Date(fullYear, monthIndex, Number.parseInt(day, 10));
}

function formatCurrency(amount: string | undefined) {
	if (!amount) return undefined;
	return amount
		.replace(",", "")
		.replace("£", "")
		.replace("+", "")
		.replace("-", "");
}
