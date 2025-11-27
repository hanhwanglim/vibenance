import { auth } from "@/lib/auth";
import { db } from "@/db";
import { TransactionInsert } from "@/db/schemas/transactions";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { BankFormat, MonzoTransaction } from "@/lib/parser";
import { transaction as transactionTable } from "@/db/schemas/transactions";

async function handleMonzo(
  userId: string,
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

      const txn: TransactionInsert = {
        id: crypto.randomUUID(),
        userId: userId,
        transactionHash: transaction.transactionId,
        account: "Monzo",
        timestamp: timestamp,
        name: transaction.name,
        currency: transaction.currency,
        amount: transaction.amount,
        category: transaction.category,
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
                category: transactionTable.category,
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
              category: transactionTable.category,
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

      const txn: TransactionInsert = {
        id: crypto.randomUUID(),
        userId: userId,
        transactionHash: transaction.transactionId,
        account: "Amex",
        timestamp: timestamp,
        name: transaction.name,
        currency: transaction.currency,
        amount: transaction.amount.startsWith("-")
          ? transaction.amount.substring(1)
          : `-${transaction.amount}`,
        category: transaction.category,
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
                category: transactionTable.category,
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
              category: transactionTable.category,
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
    account,
    transactions,
  }: { account: BankFormat; transactions: MonzoTransaction[] } = body;
  let imported = 0;
  let skipped = 0;

  switch (account) {
    case BankFormat.MONZO:
      ({ imported, skipped } = await handleMonzo(
        session.user.id,
        transactions,
      ));
      break;
    case BankFormat.AMEX:
      ({ imported, skipped } = await handleAmex(session.user.id, transactions));
      break;
    default:
      return NextResponse.json(
        { error: "Unsupported account type" },
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
