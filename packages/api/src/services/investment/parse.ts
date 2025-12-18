import Papa from "papaparse";

interface Transaction {
	transactionId: string;
	timestamp: Date;
	name: string;
	type: string;
	asset: string;
	quantity: string;
	currency: string;
	price: string;
	fees: string;
	total: string;
}

export interface ParseResult {
	count: number;
	transactions: Transaction[];
}

interface CoinbaseTransactionRow {
	ID: string;
	Timestamp: string;
	"Transaction Type": string;
	Asset: string;
	"Quantity Transacted": string;
	"Price Currency": string;
	"Price at Transaction": string;
	Subtotal: string;
	"Total (inclusive of fees and/or spread)": string;
	"Fees and/or Spread": string;
	Notes: string;
}

export async function parseFile(file: File) {
	try {
		const text = await file.text();
		return await parseText(text);
	} catch (e) {
		console.error(e);
	}
}

export async function parseText(text: string) {
	const dataPreview = Papa.parse(text, { skipEmptyLines: true, preview: 5 });

	if (
		dataPreview.data[0][0] !== "Transactions" ||
		dataPreview.data[1][0] !== "User"
	) {
		throw new Error("Unrecognized file format");
	}

	const data = Papa.parse(text, {
		skipEmptyLines: true,
		header: true,
		skipFirstNLines: 3,
	});
	return parseCoinbase(data as Papa.ParseResult<CoinbaseTransactionRow>);
}

async function parseCoinbase(data: Papa.ParseResult<CoinbaseTransactionRow>) {
	const result: ParseResult = {
		count: data.data.length,
		transactions: [],
	};

	const remapType = (type: string) => {
		const upper = type.toLowerCase();
		if (upper.indexOf("buy") >= 0) {
			return "buy";
		}
		if (upper.indexOf("sell") >= 0) {
			return "sell";
		}
		if (upper.indexOf("deposit") >= 0) {
			return "deposit";
		}
		if (upper.indexOf("reward") >= 0) {
			return "reward";
		}
		return "other";
	};

	data.data.forEach((row) => {
		const transaction = {
			transactionId: row.ID,
			timestamp: new Date(row.Timestamp),
			name: row.Notes,
			type: remapType(row["Transaction Type"]),
			asset: row.Asset,
			quantity: row["Quantity Transacted"],
			currency: row["Price Currency"].replace("$", ""),
			price: row["Price at Transaction"].replace("$", ""),
			fees: row["Fees and/or Spread"].replace("$", ""),
			total: row["Total (inclusive of fees and/or spread)"].replace("$", ""),
		};

		result.transactions.push(transaction);
	});

	return result;
}
