import type { TransactionRow } from "../core/transaction";

export function formatTable(transactions: TransactionRow[]): string {
	if (transactions.length === 0) {
		return "No transactions found.";
	}

	const terminalWidth = process.stdout.columns || 120;
	const minColumnWidth = 10;

	const dateWidth = 12;
	const amountWidth = 12;
	const currencyWidth = 8;
	const categoryWidth = 10;

	const separatorWidth = 5 * 3;

	const fixedColumnsWidth =
		dateWidth + amountWidth + currencyWidth + categoryWidth;
	const remainingWidth = terminalWidth - fixedColumnsWidth - separatorWidth;

	const nameWidth = Math.max(
		minColumnWidth,
		Math.min(40, Math.floor(remainingWidth * 0.6)),
	);
	const referenceWidth = Math.max(minColumnWidth, remainingWidth - nameWidth);

	const lines: string[] = [];

	const header = [
		"Date".padEnd(dateWidth),
		"Name".padEnd(nameWidth),
		"Amount".padEnd(amountWidth),
		"Currency".padEnd(currencyWidth),
		"Category".padEnd(categoryWidth),
		"Reference".padEnd(referenceWidth),
	].join(" | ");

	lines.push(header);
	lines.push("-".repeat(header.length));

	for (const tx of transactions) {
		const date = formatDate(tx.timestamp);
		const name = truncate(tx.name, nameWidth);
		const amount = tx.amount.padStart(amountWidth);
		const currency = (tx.currency || "").padEnd(currencyWidth);
		const category = (tx.category?.name || "").padEnd(categoryWidth);
		const reference = truncate(tx.reference || "", referenceWidth);

		const row = [
			date.padEnd(dateWidth),
			name.padEnd(nameWidth),
			amount.padEnd(amountWidth),
			currency.padEnd(currencyWidth),
			category,
			reference.padEnd(referenceWidth),
		].join(" | ");

		lines.push(row);
	}

	return lines.join("\n");
}

function formatDate(date: Date): string {
	return date.toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

function truncate(str: string, maxLen: number): string {
	if (str.length <= maxLen) return str;
	return `${str.substring(0, maxLen - 3)}...`;
}
