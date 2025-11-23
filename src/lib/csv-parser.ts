import { Transaction } from "@/app/(app)/transactions/_components/columns";

export interface ParsedTransaction {
  transaction: Transaction;
  errors: string[];
  warnings: string[];
}

export interface ParseResult {
  transactions: ParsedTransaction[];
  format: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
}

/**
 * Parse CSV text into rows
 */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      // End of field
      currentRow.push(currentField.trim());
      currentField = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      // End of row
      if (char === "\r" && nextChar === "\n") {
        i++; // Skip \n after \r
      }
      if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
        currentRow = [];
        currentField = "";
      }
    } else {
      currentField += char;
    }
  }

  // Add last field and row
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  return rows;
}

/**
 * Detect CSV format based on headers
 */
function detectFormat(headers: string[]): string {
  const headerStr = headers.join(",").toLowerCase();

  // Monzo format
  if (
    headerStr.includes("date") &&
    headerStr.includes("time") &&
    headerStr.includes("name") &&
    headerStr.includes("amount")
  ) {
    return "monzo";
  }

  // Barclays format
  if (
    headerStr.includes("date") &&
    headerStr.includes("paid out") &&
    headerStr.includes("paid in")
  ) {
    return "barclays";
  }

  // Chase format
  if (
    headerStr.includes("transaction date") &&
    headerStr.includes("description") &&
    headerStr.includes("amount")
  ) {
    return "chase";
  }

  // Amex format
  if (
    headerStr.includes("date") &&
    headerStr.includes("description") &&
    headerStr.includes("amount")
  ) {
    return "amex";
  }

  // Generic format
  return "generic";
}

/**
 * Parse date string in various formats
 */
function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === "") return null;

  // Try common formats
  const formats = [
    /^(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
    /^(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY or MM/DD/YYYY
    /^(\d{2})-(\d{2})-(\d{4})/, // DD-MM-YYYY or MM-DD-YYYY
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})/, // D/M/YYYY or M/D/YYYY
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      let year: number, month: number, day: number;

      if (format.source.startsWith("\\d{4}")) {
        // YYYY-MM-DD
        year = parseInt(match[1], 10);
        month = parseInt(match[2], 10) - 1;
        day = parseInt(match[3], 10);
      } else {
        // DD/MM/YYYY or MM/DD/YYYY - try both
        const first = parseInt(match[1], 10);
        const second = parseInt(match[2], 10);
        year = parseInt(match[3], 10);

        // Heuristic: if first > 12, it's DD/MM/YYYY
        if (first > 12) {
          day = first;
          month = second - 1;
        } else if (second > 12) {
          month = first - 1;
          day = second;
        } else {
          // Ambiguous - default to DD/MM/YYYY
          day = first;
          month = second - 1;
        }
      }

      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  // Try native Date parsing as fallback
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  return null;
}

/**
 * Parse time string (HH:MM or HH:MM:SS)
 */
function parseTime(timeStr: string): { hour: number; minute: number } | null {
  if (!timeStr || timeStr.trim() === "") return null;

  const match = timeStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (match) {
    const hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    if (hour >= 0 && hour < 24 && minute >= 0 && minute < 60) {
      return { hour, minute };
    }
  }

  return null;
}

/**
 * Parse amount string to number
 */
function parseAmount(amountStr: string): number | null {
  if (!amountStr || amountStr.trim() === "") return null;

  // Remove currency symbols and spaces
  const cleaned = amountStr.replace(/[£$€¥,\s]/g, "").replace(/[^\d.-]/g, "");

  const parsed = parseFloat(cleaned);
  if (!isNaN(parsed)) {
    return parsed;
  }

  return null;
}

/**
 * Generate unique transaction ID
 */
function generateTransactionId(index: number): string {
  const timestamp = Date.now();
  return `csv-${timestamp}-${index}`;
}

/**
 * Parse Monzo format CSV
 */
function parseMonzoFormat(
  rows: string[][],
  headers: string[],
  accountName: string,
): ParsedTransaction[] {
  const results: ParsedTransaction[] = [];

  // Find column indices
  const dateIdx = headers.findIndex((h) => h.toLowerCase().includes("date"));
  const timeIdx = headers.findIndex((h) => h.toLowerCase().includes("time"));
  const nameIdx = headers.findIndex((h) => h.toLowerCase().includes("name"));
  const amountIdx = headers.findIndex(
    (h) =>
      h.toLowerCase().includes("amount") && !h.toLowerCase().includes("local"),
  );
  const currencyIdx = headers.findIndex((h) =>
    h.toLowerCase().includes("currency"),
  );
  const categoryIdx = headers.findIndex((h) =>
    h.toLowerCase().includes("category"),
  );
  const notesIdx = headers.findIndex(
    (h) =>
      h.toLowerCase().includes("notes") || h.toLowerCase().includes("tags"),
  );
  const referenceIdx = headers.findIndex(
    (h) =>
      h.toLowerCase().includes("reference") || h.toLowerCase().includes("id"),
  );

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const errors: string[] = [];
    const warnings: string[] = [];

    // Skip empty rows
    if (row.every((cell) => !cell || cell.trim() === "")) continue;

    // Parse date
    const dateStr = dateIdx >= 0 ? row[dateIdx] : "";
    const date = parseDate(dateStr);
    if (!date) {
      errors.push("Invalid or missing date");
    }

    // Parse time
    let hour = 12;
    let minute = 0;
    if (timeIdx >= 0 && row[timeIdx]) {
      const time = parseTime(row[timeIdx]);
      if (time) {
        hour = time.hour;
        minute = time.minute;
      }
    }

    // Build timestamp
    const timestamp = date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`
      : "";

    // Parse name
    const name = nameIdx >= 0 ? row[nameIdx]?.trim() || "" : "";
    if (!name) {
      errors.push("Missing transaction name");
    }

    // Parse amount
    const amountStr = amountIdx >= 0 ? row[amountIdx] : "";
    const amount = parseAmount(amountStr);
    if (amount === null) {
      errors.push("Invalid or missing amount");
    }

    // Parse currency
    const currency =
      currencyIdx >= 0 && row[currencyIdx]
        ? row[currencyIdx].trim().toUpperCase()
        : "GBP";

    // Parse category
    const category =
      categoryIdx >= 0 && row[categoryIdx] ? row[categoryIdx].trim() : "Other";

    // Parse reference
    const reference =
      referenceIdx >= 0 && row[referenceIdx] ? row[referenceIdx].trim() : "";

    // Parse notes
    const notes = notesIdx >= 0 && row[notesIdx] ? row[notesIdx].trim() : "";

    if (errors.length === 0 && timestamp && name && amount !== null) {
      results.push({
        transaction: {
          id: generateTransactionId(i),
          account: accountName,
          timestamp,
          name,
          currency,
          amount: amount || 0,
          category,
          reference,
          notes,
        },
        errors: [],
        warnings,
      });
    } else {
      results.push({
        transaction: {
          id: generateTransactionId(i),
          account: accountName,
          timestamp: timestamp || new Date().toISOString(),
          name: name || "Unknown",
          currency,
          amount: amount || 0,
          category,
          reference,
          notes,
        },
        errors,
        warnings,
      });
    }
  }

  return results;
}

/**
 * Parse Barclays format CSV
 */
function parseBarclaysFormat(
  rows: string[][],
  headers: string[],
  accountName: string,
): ParsedTransaction[] {
  const results: ParsedTransaction[] = [];

  const dateIdx = headers.findIndex((h) => h.toLowerCase().includes("date"));
  const descriptionIdx = headers.findIndex((h) =>
    h.toLowerCase().includes("description"),
  );
  const paidOutIdx = headers.findIndex((h) =>
    h.toLowerCase().includes("paid out"),
  );
  const paidInIdx = headers.findIndex((h) =>
    h.toLowerCase().includes("paid in"),
  );

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const errors: string[] = [];

    if (row.every((cell) => !cell || cell.trim() === "")) continue;

    const dateStr = dateIdx >= 0 ? row[dateIdx] : "";
    const date = parseDate(dateStr);
    if (!date) {
      errors.push("Invalid or missing date");
    }

    const timestamp = date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} 12:00:00`
      : "";

    const name = descriptionIdx >= 0 ? row[descriptionIdx]?.trim() || "" : "";
    if (!name) {
      errors.push("Missing description");
    }

    const paidOutStr = paidOutIdx >= 0 ? row[paidOutIdx] : "";
    const paidInStr = paidInIdx >= 0 ? row[paidInIdx] : "";

    let amount = 0;
    if (paidOutStr) {
      const parsed = parseAmount(paidOutStr);
      if (parsed !== null) {
        amount = -Math.abs(parsed);
      } else {
        errors.push("Invalid paid out amount");
      }
    } else if (paidInStr) {
      const parsed = parseAmount(paidInStr);
      if (parsed !== null) {
        amount = Math.abs(parsed);
      } else {
        errors.push("Invalid paid in amount");
      }
    } else {
      errors.push("Missing amount");
    }

    results.push({
      transaction: {
        id: generateTransactionId(i),
        account: accountName,
        timestamp: timestamp || new Date().toISOString(),
        name: name || "Unknown",
        currency: "GBP",
        amount: amount || 0,
        category: "Other",
        reference: "",
        notes: "",
      },
      errors,
      warnings: [],
    });
  }

  return results;
}

/**
 * Parse Chase format CSV
 */
function parseChaseFormat(
  rows: string[][],
  headers: string[],
  accountName: string,
): ParsedTransaction[] {
  const results: ParsedTransaction[] = [];

  const dateIdx = headers.findIndex(
    (h) =>
      h.toLowerCase().includes("transaction date") ||
      h.toLowerCase().includes("date"),
  );
  const descriptionIdx = headers.findIndex((h) =>
    h.toLowerCase().includes("description"),
  );
  const amountIdx = headers.findIndex((h) =>
    h.toLowerCase().includes("amount"),
  );
  const categoryIdx = headers.findIndex((h) =>
    h.toLowerCase().includes("category"),
  );

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const errors: string[] = [];

    if (row.every((cell) => !cell || cell.trim() === "")) continue;

    const dateStr = dateIdx >= 0 ? row[dateIdx] : "";
    const date = parseDate(dateStr);
    if (!date) {
      errors.push("Invalid or missing date");
    }

    const timestamp = date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} 12:00:00`
      : "";

    const name = descriptionIdx >= 0 ? row[descriptionIdx]?.trim() || "" : "";
    if (!name) {
      errors.push("Missing description");
    }

    const amountStr = amountIdx >= 0 ? row[amountIdx] : "";
    const amount = parseAmount(amountStr);
    if (amount === null) {
      errors.push("Invalid or missing amount");
    }

    const category =
      categoryIdx >= 0 && row[categoryIdx] ? row[categoryIdx].trim() : "Other";

    results.push({
      transaction: {
        id: generateTransactionId(i),
        account: accountName,
        timestamp: timestamp || new Date().toISOString(),
        name: name || "Unknown",
        currency: "USD",
        amount: amount || 0,
        category,
        reference: "",
        notes: "",
      },
      errors,
      warnings: [],
    });
  }

  return results;
}

/**
 * Parse Amex format CSV
 */
function parseAmexFormat(
  rows: string[][],
  headers: string[],
  accountName: string,
): ParsedTransaction[] {
  // Similar to Chase format
  return parseChaseFormat(rows, headers, accountName);
}

/**
 * Parse generic format CSV (flexible column mapping)
 */
function parseGenericFormat(
  rows: string[][],
  headers: string[],
  accountName: string,
): ParsedTransaction[] {
  const results: ParsedTransaction[] = [];

  // Try to find common column names
  const dateIdx = headers.findIndex((h) => h.toLowerCase().includes("date"));
  const descriptionIdx = headers.findIndex(
    (h) =>
      h.toLowerCase().includes("description") ||
      h.toLowerCase().includes("name") ||
      h.toLowerCase().includes("merchant"),
  );
  const amountIdx = headers.findIndex((h) =>
    h.toLowerCase().includes("amount"),
  );
  const categoryIdx = headers.findIndex((h) =>
    h.toLowerCase().includes("category"),
  );

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const errors: string[] = [];

    if (row.every((cell) => !cell || cell.trim() === "")) continue;

    const dateStr = dateIdx >= 0 ? row[dateIdx] : "";
    const date = parseDate(dateStr);
    if (!date && dateIdx >= 0) {
      errors.push("Invalid or missing date");
    }

    const timestamp = date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} 12:00:00`
      : new Date().toISOString();

    const name = descriptionIdx >= 0 ? row[descriptionIdx]?.trim() || "" : "";
    if (!name && descriptionIdx >= 0) {
      errors.push("Missing description");
    }

    const amountStr = amountIdx >= 0 ? row[amountIdx] : "";
    const amount = parseAmount(amountStr);
    if (amount === null && amountIdx >= 0) {
      errors.push("Invalid or missing amount");
    }

    const category =
      categoryIdx >= 0 && row[categoryIdx] ? row[categoryIdx].trim() : "Other";

    results.push({
      transaction: {
        id: generateTransactionId(i),
        account: accountName,
        timestamp,
        name: name || "Unknown",
        currency: "GBP",
        amount: amount || 0,
        category,
        reference: "",
        notes: "",
      },
      errors,
      warnings: [],
    });
  }

  return results;
}

/**
 * Main CSV parsing function
 */
export function parseCSVFile(
  csvText: string,
  accountName: string = "Imported",
): ParseResult {
  // Parse CSV into rows
  const rows = parseCSV(csvText.trim());

  if (rows.length === 0) {
    return {
      transactions: [],
      format: "unknown",
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
    };
  }

  // First row is headers
  const headers = rows[0].map((h) => h.trim());
  const dataRows = rows.slice(1);

  // Detect format
  const format = detectFormat(headers);

  // Parse based on format
  let parsedTransactions: ParsedTransaction[];
  switch (format) {
    case "monzo":
      parsedTransactions = parseMonzoFormat(dataRows, headers, accountName);
      break;
    case "barclays":
      parsedTransactions = parseBarclaysFormat(dataRows, headers, accountName);
      break;
    case "chase":
      parsedTransactions = parseChaseFormat(dataRows, headers, accountName);
      break;
    case "amex":
      parsedTransactions = parseAmexFormat(dataRows, headers, accountName);
      break;
    default:
      parsedTransactions = parseGenericFormat(dataRows, headers, accountName);
  }

  // Calculate stats
  const validRows = parsedTransactions.filter(
    (p) => p.errors.length === 0,
  ).length;
  const invalidRows = parsedTransactions.length - validRows;

  return {
    transactions: parsedTransactions,
    format,
    totalRows: dataRows.length,
    validRows,
    invalidRows,
  };
}
