import { Bot } from "grammy";
import fs from "node:fs/promises";
import { parseText, BankFormat } from "@/lib/parser";
import { importTransactions } from "@/lib/import-transactions";
import { db } from "@/db";
import { bankAccount } from "@/db/schemas/transactions";
import { user } from "@/db/schemas/auth";
import { sql } from "drizzle-orm";

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);

console.log("Starting Telegram Worker");

/**
 * Finds a bank account by matching the account name with the bank format
 */
async function findAccountByFormat(format: BankFormat): Promise<string | null> {
  const searchTerm = (
    format === BankFormat.MONZO ? "monzo" : "amex"
  ).toLowerCase();

  const accounts = await db
    .select()
    .from(bankAccount)
    .where(sql`LOWER(${bankAccount.name}) LIKE ${`%${searchTerm}%`}`)
    .limit(1);

  return accounts.length > 0 ? accounts[0].id : null;
}

/**
 * Gets the first user from the database
 */
async function getFirstUser(): Promise<string | null> {
  const users = await db.select().from(user).limit(1);
  return users.length > 0 ? users[0].id : null;
}

bot.on("message", async (ctx) => {
  if (ctx.message.chat.id.toString() != process.env.TELEGRAM_CHAT_ID!) return;

  console.log(`[BOT]\t${new Date().toISOString()}\t${ctx.from.first_name}`);

  let file;
  try {
    file = await ctx.getFile();
  } catch (error) {
    console.log("No file", error);
    return;
  }

  if (file) {
    const filePath = `/tmp/${file.file_id}`;

    try {
      ctx.react("👀");

      // Download file
      const response = await fetch(
        `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      await fs.writeFile(filePath, Buffer.from(buffer));
      console.log(`File saved to ${filePath}`);

      ctx.react("🙈");

      // Read and parse file
      const fileContent = await fs.readFile(filePath, "utf-8");
      const parseResult = await parseText(fileContent);

      console.log(
        `Parsed ${parseResult.count} transactions (${parseResult.valid} valid, ${parseResult.invalid} invalid), format: ${parseResult.format}`,
      );

      // Auto-detect account
      const accountId = await findAccountByFormat(parseResult.format);
      if (!accountId) {
        throw new Error(
          `No account found for format: ${parseResult.format}. Please create an account with "${parseResult.format}" in the name.`,
        );
      }

      // Get first user
      const userId = await getFirstUser();
      if (!userId) {
        throw new Error("No users found in database");
      }

      // Import transactions
      const { imported, skipped } = await importTransactions(
        userId,
        accountId,
        parseResult.format,
        parseResult.transactions,
      );

      console.log(`Import complete: ${imported} imported, ${skipped} skipped`);

      // Clean up file
      await fs.unlink(filePath);
      console.log(`File deleted: ${filePath}`);

      ctx.react("👍");
    } catch (error) {
      console.error("Error processing file:", error);

      // Try to clean up file even on error
      try {
        await fs.unlink(filePath);
      } catch (unlinkError) {
        // Ignore cleanup errors
      }

      ctx.react("👎");

      // Send error message to user
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      await ctx.reply(`Error processing file: ${errorMessage}`);
    }
  }
});

bot.start();
