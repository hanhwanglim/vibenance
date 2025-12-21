import type { BunFile } from "bun";
import { PDFParse } from "pdf-parse";

export interface ChaseTransactionRow {
	Date: Date;
	"Transaction details": string;
	Amount: string;
	Balance: string;
}

export async function isChasePdf(file: BunFile) {
	const parser = new PDFParse({ data: await file.arrayBuffer() });
	try {
		const { pages } = await parser.getText();
		if (pages.length < 1) return false;
		return pages.at(0)?.text.includes("Chase app") || false;
	} finally {
		await parser.destroy();
	}
}
