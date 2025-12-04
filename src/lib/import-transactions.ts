import { db } from "@/db";
import { TransactionInsert } from "@/db/schemas/transactions";
import { BankFormat, MonzoTransaction } from "@/lib/parser";
import {
  transaction as transactionTable,
  category as categoryTable,
} from "@/db/schemas/transactions";
import { sql } from "drizzle-orm";

/**
 * Resolves a category name to a categoryId.
 * If the category doesn't exist, creates it.
 * Falls back to "Other" category if name is empty.
 */
async function resolveCategoryId(
  categoryName: string | undefined,
): Promise<string> {
  const name = categoryName?.trim() || "Other";

  // Try to find existing category (case-insensitive)
  const existingCategories = await db
    .select()
    .from(categoryTable)
    .where(sql`LOWER(${categoryTable.name}) = LOWER(${name})`)
    .limit(1);

  if (existingCategories.length > 0) {
    return existingCategories[0].id;
  }

  // Create new category if it doesn't exist
  const newCategoryId = crypto.randomUUID();
  await db
    .insert(categoryTable)
    .values({
      id: newCategoryId,
      name: name,
    })
    .onConflictDoNothing();

  // If insert was skipped due to conflict, fetch the existing one
  const categories = await db
    .select()
    .from(categoryTable)
    .where(sql`LOWER(${categoryTable.name}) = LOWER(${name})`)
    .limit(1);

  return categories[0]?.id || newCategoryId;
}

async function handleMonzo(
  userId: string,
  accountId: string,
  transactions: MonzoTransaction[],
): Promise<{ imported: number; skipped: number }> {
  let imported = 0;
  let skipped = 0;

  await db.transaction(async (tx) => {
    const transactionsToInsert: TransactionInsert[] = [];

    for (const transaction of transactions) {
      if (transaction.errors) {
        skipped++;
        continue;
      }

      const [day, month, year] = transaction.date.split("/");
      const timestamp = new Date(`${year}-${month}-${day}T${transaction.time}`);

      // Resolve category name to categoryId
      const categoryId = await resolveCategoryId(transaction.category);

      const txn: TransactionInsert = {
        id: crypto.randomUUID(),
        userId: userId,
        transactionHash: transaction.transactionId,
        accountId: accountId,
        timestamp: timestamp,
        name: transaction.name,
        currency: transaction.currency,
        amount: transaction.amount,
        categoryId: categoryId,
        notes: transaction.notes,
      };

      transactionsToInsert.push(txn);

      if (transactionsToInsert.length >= 1000) {
        const count = (
          await tx
            .insert(transactionTable)
            .values(transactionsToInsert)
            .onConflictDoUpdate({
              target: transactionTable.transactionHash,
              set: {
                categoryId: transactionTable.categoryId,
                notes: transactionTable.notes,
              },
            })
        ).rowCount;
        transactionsToInsert.length = 0;
        imported += count ?? 0;
        skipped += transactionsToInsert.length - (count ?? 0);
      }
    }

    if (transactionsToInsert.length > 0) {
      const count = (
        await tx
          .insert(transactionTable)
          .values(transactionsToInsert)
          .onConflictDoUpdate({
            target: transactionTable.transactionHash,
            set: {
              categoryId: transactionTable.categoryId,
              notes: transactionTable.notes,
            },
          })
      ).rowCount;
      imported += count ?? 0;
      skipped += transactionsToInsert.length - (count ?? 0);
    }
  });

  return { imported, skipped };
}

async function handleAmex(
  userId: string,
  accountId: string,
  transactions: MonzoTransaction[],
): Promise<{ imported: number; skipped: number }> {
  let imported = 0;
  let skipped = 0;

  await db.transaction(async (tx) => {
    const transactionsToInsert: TransactionInsert[] = [];

    for (const transaction of transactions) {
      if (transaction.errors) {
        skipped++;
        continue;
      }

      const [day, month, year] = transaction.date.split("/");
      const timestamp = new Date(`${year}-${month}-${day}`);

      // Resolve category name to categoryId
      const categoryId = await resolveCategoryId(transaction.category);

      const txn: TransactionInsert = {
        id: crypto.randomUUID(),
        userId: userId,
        transactionHash: transaction.transactionId,
        accountId: accountId,
        timestamp: timestamp,
        name: transaction.name,
        currency: transaction.currency,
        amount: transaction.amount.startsWith("-")
          ? transaction.amount.substring(1)
          : `-${transaction.amount}`,
        categoryId: categoryId,
        notes: transaction.notes,
      };

      transactionsToInsert.push(txn);

      if (transactionsToInsert.length >= 1000) {
        const count = (
          await tx
            .insert(transactionTable)
            .values(transactionsToInsert)
            .onConflictDoUpdate({
              target: transactionTable.transactionHash,
              set: {
                categoryId: transactionTable.categoryId,
                notes: transactionTable.notes,
              },
            })
        ).rowCount;
        transactionsToInsert.length = 0;
        imported += count ?? 0;
        skipped += transactionsToInsert.length - (count ?? 0);
      }
    }

    if (transactionsToInsert.length > 0) {
      const count = (
        await tx
          .insert(transactionTable)
          .values(transactionsToInsert)
          .onConflictDoUpdate({
            target: transactionTable.transactionHash,
            set: {
              categoryId: transactionTable.categoryId,
              notes: transactionTable.notes,
            },
          })
      ).rowCount;
      imported += count ?? 0;
      skipped += transactionsToInsert.length - (count ?? 0);
    }
  });

  return { imported, skipped };
}

/**
 * Imports transactions into the database.
 * @param userId - The user ID to associate transactions with
 * @param accountId - The bank account ID to associate transactions with
 * @param format - The bank format (MONZO or AMEX)
 * @param transactions - Array of parsed transactions
 * @returns Object with imported and skipped counts
 */
export async function importTransactions(
  userId: string,
  accountId: string,
  format: BankFormat,
  transactions: MonzoTransaction[],
): Promise<{ imported: number; skipped: number }> {
  switch (format) {
    case BankFormat.MONZO:
      return handleMonzo(userId, accountId, transactions);
    case BankFormat.AMEX:
      return handleAmex(userId, accountId, transactions);
    default:
      throw new Error("Unsupported bank format");
  }
}
