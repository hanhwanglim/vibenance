import type { BunFile } from "bun";
import { PDFParse } from "pdf-parse";

export const ChipPdfHeaders = [
	"Date",
	"Description",
	"Amount (GBP)",
	"Balance (GBP)",
];

export interface ChipTransactionRow {
	Date: Date;
	Description: string;
	"Amount (GBP)": string;
	"Balance (GBP)"?: string;
}

export async function isChipPdf(file: BunFile) {
	const parser = new PDFParse({ data: await file.arrayBuffer() });
	try {
		const { pages } = await parser.getText();
		if (pages.length < 1) return false;
		return pages.at(0)?.text.includes("Chip") || false;
	} finally {
		await parser.destroy();
	}
}
