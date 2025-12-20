import type { BunFile } from "bun";
import Papa from "papaparse";
import { AmexCsvHeaders } from "../parsers/amex/config";
import { isHsbcPdf } from "../parsers/hsbc/config";
import { MonzoCsvHeaders } from "../parsers/monzo/config";

export type ParserType = "monzo" | "amex" | "hsbc" | "unknown";

export async function detectParser(file: BunFile): Promise<ParserType> {
	const fileName = file.name || "";
	const extension = fileName.toLowerCase().split(".").pop();

	if (extension === "pdf") {
		if (await isHsbcPdf(file)) {
			return "hsbc";
		}
	}

	if (extension === "csv") {
		const text = await file.text();
		const data = Papa.parse(text, {
			header: true,
			skipEmptyLines: true,
			preview: 1,
		});

		const headers = data.meta.fields || [];

		if (MonzoCsvHeaders.every((header) => headers.includes(header))) {
			return "monzo";
		}

		if (AmexCsvHeaders.every((header) => headers.includes(header))) {
			return "amex";
		}
	}

	return "unknown";
}
