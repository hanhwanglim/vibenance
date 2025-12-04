import { auth } from "@/lib/auth";
import { db } from "@/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { BankFormat, MonzoTransaction } from "@/lib/parser";
import { importTransactions } from "@/lib/import-transactions";
import { bankAccount } from "@/db/schemas/transactions";
import { eq } from "drizzle-orm";

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

  try {
    ({ imported, skipped } = await importTransactions(
      session.user.id,
      accountId,
      format,
      transactions,
    ));
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    if (errorMessage.includes("Unsupported bank format")) {
      return NextResponse.json(
        { error: "Unsupported bank format" },
        { status: 400 },
      );
    }
    throw error;
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
