import type { BunFile } from "bun";
import Papa from "papaparse";
import type { TransactionRow as InvestmentTransactionRow } from "../core/investment";
import type { TransactionRow } from "../core/transaction";
import { AmexCsvHeaders } from "../parsers/amex/config";
import { parse as parseAmex } from "../parsers/amex/csv";
import { isChasePdf } from "../parsers/chase/config";
import { parse as parseChase } from "../parsers/chase/pdf";
import { isChipPdf } from "../parsers/chip/config";
import { parse as parseChip } from "../parsers/chip/pdf";
import { isCoinbaseCsv } from "../parsers/coinbase/config";
import { parse as parseCoinbase } from "../parsers/coinbase/csv";
import { isHsbcPdf } from "../parsers/hsbc/config";
import { parse as parseHsbc } from "../parsers/hsbc/pdf";
import { MonzoCsvHeaders } from "../parsers/monzo/config";
import { parse as parseMonzo } from "../parsers/monzo/csv";

export type ParserType =
	| "monzo"
	| "amex"
	| "hsbc"
	| "chip"
	| "coinbase"
	| "chase"
	| "unknown";

export async function detectParser(file: BunFile): Promise<ParserType> {
	const fileName = file.name || "";
	const extension = fileName.toLowerCase().split(".").pop();

	if (extension === "pdf") {
		if (await isHsbcPdf(file)) {
			return "hsbc";
		}
		if (await isChipPdf(file)) {
			return "chip";
		}
		if (await isChasePdf(file)) {
			return "chase";
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

		if (await isCoinbaseCsv(file)) {
			return "coinbase";
		}
	}

	return "unknown";
}

export async function parseFile(file: BunFile, parserType: ParserType) {
	let transactions: Array<TransactionRow | InvestmentTransactionRow>;

	switch (parserType) {
		case "monzo":
			transactions = await parseMonzo(file);
			break;
		case "amex":
			transactions = await parseAmex(file);
			break;
		case "hsbc":
			transactions = await parseHsbc(file);
			break;
		case "coinbase":
			transactions = await parseCoinbase(file);
			break;
		case "chip":
			transactions = await parseChip(file);
			break;
		case "chase":
			transactions = await parseChase(file);
			break;
		default:
			throw new Error(`Unknown parser type: ${parserType}`);
	}

	return transactions;
}
