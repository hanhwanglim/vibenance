#!/usr/bin/env bun

import type { BunFile } from "bun";
import { detectParser, parseFile } from "../core/parse";
import type { TransactionRow } from "../core/transaction";
import { formatTable } from "./table";

async function main() {
	const args = process.argv.slice(2);

	if (args.length === 0) {
		console.error("Usage: bun run cli <file-path>");
		console.error("Example: bun run cli statement.csv");
		process.exit(1);
	}

	const filePath = args[0];
	if (!filePath) {
		console.error("Error: File path is required");
		process.exit(1);
	}
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
		const transactions = await parseFile(file, parserType);
		const regularTransactions = transactions.filter(
			(tx): tx is TransactionRow => "categoryId" in tx,
		);
		console.log(`Found ${regularTransactions.length} transaction(s)\n`);
		console.log(formatTable(regularTransactions));
	} catch (error) {
		console.error("Error parsing file:");
		console.error(error);
		process.exit(1);
	}
}

main();
