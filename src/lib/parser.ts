import Papa from "papaparse";

export enum BankFormat {
  MONZO = "monzo",
  AMEX = "amex",
  UNKNOWN = "unknown",
}

export interface ParseResult {
  count: number;
  valid: number;
  invalid: number;
  format: BankFormat;
  transactions: MonzoTransaction[];
}

export interface MonzoTransaction {
  transactionId: string;
  date: string;
  time: string;
  type: string;
  name: string;
  category: string;
  amount: string;
  currency: string;
  notes: string;

  errors?: string[];
}

interface MonzoTransactionRow {
  "Transaction ID": string;
  Date: string;
  Time: string;
  Type: string;
  Name: string;
  Category: string;
  Amount: string;
  Currency: string;
  "Notes and #tags": string;
}

interface AmexTransactionRow {
  Date: string;
  Description: string;
  Amount: string;
  "Appears On Your Statement As": string;
  Reference: string;
  Category: string;
}

export async function parseFile(file: File): Promise<ParseResult> {
  const text = await file.text();

  let data: Papa.ParseResult<MonzoTransactionRow | AmexTransactionRow>;
  data = Papa.parse(text, { header: true, skipEmptyLines: true });
  if (!isHeader(data.meta.fields || [])) {
    data = Papa.parse(text, { header: false, skipEmptyLines: true });
  }

  const bankFormat = detectBankFormat(data.meta.fields || []);

  switch (bankFormat) {
    case BankFormat.MONZO:
      return parseMonzo(data as Papa.ParseResult<MonzoTransactionRow>);
    case BankFormat.AMEX:
      return parseAmex(data as Papa.ParseResult<AmexTransactionRow>);
    default:
      throw new Error("Unknown bank format");
  }
}

// If a header contains a number, it quite likely is not a header
function isHeader(headers: string[]) {
  return !headers.some((header) => /\d/.test(header));
}

function detectBankFormat(headers: string[]): BankFormat {
  if (
    headers.includes("Transaction ID") &&
    headers.includes("Date") &&
    headers.includes("Emoji") &&
    headers.includes("Amount") &&
    headers.includes("Notes and #tags") &&
    headers.includes("Description")
  ) {
    return BankFormat.MONZO;
  }
  if (
    headers.includes("Date") &&
    headers.includes("Description") &&
    headers.includes("Amount") &&
    headers.includes("Appears On Your Statement As") &&
    headers.includes("Reference") &&
    headers.includes("Category")
  ) {
    return BankFormat.AMEX;
  }
  return BankFormat.UNKNOWN;
}

function parseMonzo(data: Papa.ParseResult<MonzoTransactionRow>): ParseResult {
  const result: ParseResult = {
    count: data.data.length,
    valid: data.data.length - data.errors.length,
    invalid: data.errors.length,
    format: BankFormat.MONZO,
    transactions: [],
  };

  const errorRows = new Set<number>();
  data.errors.forEach((error) => {
    errorRows.add(error.row as number);
  });

  data.data.forEach((row, index: number) => {
    const transaction: MonzoTransaction = {
      transactionId: row["Transaction ID"],
      date: row["Date"],
      time: row["Time"],
      type: row["Type"],
      name: row["Name"],
      category: row["Category"],
      currency: row["Currency"],
      amount: row["Amount"],
      notes: row["Notes and #tags"],
    };

    if (errorRows.has(index)) {
      transaction.errors = [data.errors[index].message];
    }

    result.transactions.push(transaction);
  });
  return result;
}

function parseAmex(data: Papa.ParseResult<AmexTransactionRow>): ParseResult {
  const result: ParseResult = {
    count: data.data.length,
    valid: data.data.length - data.errors.length,
    invalid: data.errors.length,
    format: BankFormat.AMEX,
    transactions: [],
  };

  const errorRows = new Set<number>();
  data.errors.forEach((error) => {
    errorRows.add(error.row as number);
  });

  data.data.forEach((row, index: number) => {
    const transaction: MonzoTransaction = {
      transactionId: row["Reference"].replaceAll("'", ""), // Amex wraps with "'"
      date: row["Date"],
      time: "",
      type: Number(row["Amount"]) < 0 ? "Credit" : "Debit",
      name: row["Appears On Your Statement As"],
      currency: "GBP",
      amount: row["Amount"],
      category: row["Category"],
      notes: "",
    };

    if (errorRows.has(index)) {
      transaction.errors = [data.errors[index].message];
    }

    result.transactions.push(transaction);
  });
  return result;
}
