import { auth } from "@/lib/auth";
import { db } from "@/db";
import { TransactionInsert } from "@/db/schemas/transactions";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { BankFormat, MonzoTransaction } from "@/lib/parser";
import {
  transaction as transactionTable,
  category as categoryTable,
  bankAccount,
} from "@/db/schemas/transactions";
import { eq, sql } from "drizzle-orm";

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

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const {
    accountId,
    format,
    transactions,
  }: {
    accountId: string;
    format: BankFormat;
    transactions: MonzoTransaction[];
  } = body;

  // Validate accountId
  if (!accountId || typeof accountId !== "string") {
    return NextResponse.json(
      { error: "Account ID is required" },
      { status: 400 },
    );
  }

  // Verify account exists (accounts are not user-specific in the current schema,
  // but we validate it exists)
  const account = await db.query.bankAccount.findFirst({
    where: eq(bankAccount.id, accountId),
  });

  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  let imported = 0;
  let skipped = 0;

  switch (format) {
    case BankFormat.MONZO:
      ({ imported, skipped } = await handleMonzo(
        session.user.id,
        accountId,
        transactions,
      ));
      break;
    case BankFormat.AMEX:
      ({ imported, skipped } = await handleAmex(
        session.user.id,
        accountId,
        transactions,
      ));
      break;
    default:
      return NextResponse.json(
        { error: "Unsupported bank format" },
        { status: 400 },
      );
  }

  return NextResponse.json(
    {
      success: true,
      imported: imported,
      skipped: skipped,
      message: `Successfully imported ${imported} transaction(s), skipped ${skipped} duplicate(s)`,
    },
    { status: 200 },
  );
}
