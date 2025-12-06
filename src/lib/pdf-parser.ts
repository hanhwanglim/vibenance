import { BankFormat, ParseResult, MonzoTransaction } from "./parser";

/**
 * Detect bank format from PDF text content
 */
export function detectBankFormatFromPDF(text: string): BankFormat {
  const lowerText = text.toLowerCase();

  // Check for Amex indicators
  if (
    lowerText.includes("american express") ||
    lowerText.includes("amex") ||
    lowerText.includes("americanexpress") ||
    (lowerText.includes("statement") && lowerText.includes("card ending"))
  ) {
    return BankFormat.AMEX;
  }

  // Check for Monzo indicators
  if (lowerText.includes("monzo")) {
    return BankFormat.MONZO;
  }

  return BankFormat.UNKNOWN;
}

/**
 * Parse Amex PDF statement text into transactions
 * Amex PDFs typically have transaction rows with:
 * - Date (DD MMM YYYY or DD/MM/YYYY)
 * - Description/Merchant name
 * - Amount (with or without currency symbol)
 * - Reference number
 */
export function parseAmexPDF(text: string): ParseResult {
  const transactions: MonzoTransaction[] = [];
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // Common date patterns: DD MMM YYYY, DD/MM/YYYY, DD-MM-YYYY
  const datePattern =
    /(\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4})/i;

  // Amount pattern: currency symbol optional, negative for credits, positive for debits
  // Matches: £123.45, -£123.45, 123.45, -123.45, (123.45) for credits
  const amountPattern =
    /[£$€]?\s*-?\d+\.\d{2}|\([£$€]?\s*\d+\.\d{2}\)|[£$€]?\s*\d+\.\d{2}/;

  // Reference pattern: usually alphanumeric, sometimes wrapped in quotes
  const referencePattern = /['"]?([A-Z0-9]{6,})['"]?/;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Skip header lines, page numbers, and summary sections
    if (
      line.toLowerCase().includes("statement") ||
      line.toLowerCase().includes("page") ||
      line.toLowerCase().includes("balance") ||
      line.toLowerCase().includes("summary") ||
      line.toLowerCase().includes("total") ||
      line.match(/^\d+$/) || // Just numbers (likely page numbers)
      line.length < 10 // Too short to be a transaction
    ) {
      i++;
      continue;
    }

    // Try to find a date in the line
    const dateMatch = line.match(datePattern);
    if (!dateMatch) {
      i++;
      continue;
    }

    // Extract date
    const dateStr = dateMatch[1];
    let formattedDate = dateStr;

    // Normalize date format to YYYY-MM-DD or keep original if parsing fails
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        formattedDate = date.toISOString().split("T")[0];
      }
    } catch {
      // Keep original date string if parsing fails
    }

    // Look for amount in current line or next few lines
    let amountMatch = line.match(amountPattern);
    let description = "";
    let amount = "";
    let reference = "";

    // If amount found in same line, extract description from before date
    if (amountMatch) {
      const dateIndex = line.indexOf(dateStr);
      description = line.substring(0, dateIndex).trim();
      amount = amountMatch[0].replace(/[£$€()]/g, "").trim();

      // Check if amount is in parentheses (credit)
      if (line.includes("(") && line.includes(")")) {
        amount = "-" + amount.replace(/[()]/g, "");
      }
    } else {
      // Amount might be in next line or description spans multiple lines
      description = line.substring(0, line.indexOf(dateStr)).trim();

      // Check next few lines for amount
      for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
        const nextLine = lines[j];
        amountMatch = nextLine.match(amountPattern);
        if (amountMatch) {
          amount = amountMatch[0].replace(/[£$€()]/g, "").trim();
          if (nextLine.includes("(") && nextLine.includes(")")) {
            amount = "-" + amount.replace(/[()]/g, "");
          }
          break;
        }
        // If no amount but looks like continuation of description
        if (!nextLine.match(datePattern) && !nextLine.match(amountPattern)) {
          description += " " + nextLine;
        }
      }
    }

    // Try to find reference number (often near the end of transaction line or separate)
    const refMatch = line.match(referencePattern);
    if (refMatch) {
      reference = refMatch[1];
    } else {
      // Check next line for reference
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        const nextRefMatch = nextLine.match(referencePattern);
        if (nextRefMatch && !nextLine.match(datePattern)) {
          reference = nextRefMatch[1];
        }
      }
    }

    // Only create transaction if we have essential fields
    if (dateStr && amount) {
      const transaction: MonzoTransaction = {
        transactionId: reference || `amex-${i}-${Date.now()}`,
        date: formattedDate,
        time: "",
        type:
          amount.startsWith("-") || parseFloat(amount) < 0 ? "Credit" : "Debit",
        name: description || "Unknown",
        category: "",
        currency: "GBP",
        amount: amount,
        notes: "",
      };

      // Validate transaction
      const errors: string[] = [];
      if (!description || description.length < 2) {
        errors.push("Missing or invalid description");
      }
      if (!amount || isNaN(parseFloat(amount))) {
        errors.push("Missing or invalid amount");
      }
      if (errors.length > 0) {
        transaction.errors = errors;
      }

      transactions.push(transaction);
    }

    i++;
  }

  const valid = transactions.filter(
    (t) => !t.errors || t.errors.length === 0,
  ).length;
  const invalid = transactions.length - valid;

  return {
    count: transactions.length,
    valid,
    invalid,
    format: BankFormat.AMEX,
    transactions,
  };
}

/**
 * Parse PDF text and return transactions
 */
export async function parsePDFText(text: string): Promise<ParseResult> {
  const format = detectBankFormatFromPDF(text);

  switch (format) {
    case BankFormat.AMEX:
      return parseAmexPDF(text);
    case BankFormat.MONZO:
      throw new Error("Monzo PDF parsing not yet implemented");
    default:
      throw new Error(
        `Unknown bank format in PDF. Supported formats: ${BankFormat.AMEX}`,
      );
  }
}
