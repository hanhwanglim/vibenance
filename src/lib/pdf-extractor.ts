import pdfParse from "pdf-parse";

/**
 * Extract text from a PDF buffer
 * @param buffer - PDF file buffer
 * @returns Extracted text as a single string
 * @throws Error if PDF extraction fails (encrypted, corrupted, etc.)
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes("encrypted") ||
        error.message.includes("password")
      ) {
        throw new Error("PDF is encrypted and cannot be processed");
      }
      if (error.message.includes("Invalid PDF")) {
        throw new Error("Invalid or corrupted PDF file");
      }
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
    throw new Error("Unknown error occurred while extracting text from PDF");
  }
}
