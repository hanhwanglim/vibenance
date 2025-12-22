import type { BunFile } from "bun";

export const HsbcPdfHeaders = [
	"Received By Us",
	"Transaction Date",
	"Details",
	"Amount",
];

export interface HsbcTransactionRow {
	"Received By Us": Date;
	"Transaction Date": Date;
	Details: string;
	Amount: string;
}

export async function isHsbcPdf(file: BunFile) {
	const { PDFParse } = await import("pdf-parse");

	const parser = new PDFParse({ data: await file.arrayBuffer() });

	const { pages } = await parser.getText();
	if (pages.length < 1) return false;
	const isHsbc = pages.at(0)?.text.includes("HSBC") || false;

	await parser.destroy();
	return isHsbc;
}
