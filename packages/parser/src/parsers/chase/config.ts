import type { BunFile } from "bun";

export interface ChaseTransactionRow {
	Date: Date;
	"Transaction details": string;
	Amount: string;
	Balance: string;
	[key: string]: string | number | Date;
}

export async function isChasePdf(file: BunFile) {
	const { PDFParse } = await import("pdf-parse");

	const parser = new PDFParse({ data: await file.arrayBuffer() });
	try {
		const { pages } = await parser.getText();
		if (pages.length < 1) return false;
		return pages.at(0)?.text.includes("Chase app") || false;
	} finally {
		await parser.destroy();
	}
}
