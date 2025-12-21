#!/usr/bin/env bun

import type { BunFile } from "bun";
import { detectParser } from "../core/detect";
import type { TransactionRow as InvestmentTransactionRow } from "../core/investment";
import type { TransactionRow } from "../core/transaction";
import { parse as parseAmex } from "../parsers/amex/csv";
import { parse as parseChip } from "../parsers/chip/pdf";
import { parse as parseCoinbase } from "../parsers/coinbase/csv";
import { parse as parseHsbc } from "../parsers/hsbc/pdf";
import { parse as parseMonzo } from "../parsers/monzo/csv";
import { formatTable } from "./table";

async function main() {
	const args = process.argv.slice(2);

	if (args.length === 0) {
		console.error("Usage: bun run cli <file-path>");
		console.error("Example: bun run cli statement.csv");
		process.exit(1);
	}

	const filePath = args[0];
	let file: BunFile;

	try {
		file = Bun.file(filePath);
		if (!(await file.exists())) {
			console.error(`Error: File not found: ${filePath}`);
			process.exit(1);
		}
	} catch (error) {
		console.error(`Error: Failed to read file: ${filePath}`);
		console.error(error);
		process.exit(1);
	}

	// Detect parser type
	const parserType = await detectParser(file);

	if (parserType === "unknown") {
		console.error(
			"Error: Could not detect bank format. Supported formats: Monzo (CSV), Amex (CSV), HSBC (PDF)",
		);
		process.exit(1);
	}

	console.log(`Detected format: ${parserType.toUpperCase()}`);
	console.log("Parsing file...\n");

	try {
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
			default:
				throw new Error(`Unknown parser type: ${parserType}`);
		}

		console.log(`Found ${transactions.length} transaction(s)\n`);
		console.log(formatTable(transactions));
	} catch (error) {
		console.error("Error parsing file:");
		console.error(error);
		process.exit(1);
	}
}

main();
