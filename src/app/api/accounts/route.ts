import { auth } from "@/lib/auth";
import { db } from "@/db";
import { bankAccount, BankAccountInsert } from "@/db/schemas/transactions";
import { transaction } from "@/db/schemas/transactions";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { eq, sql, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all accounts
    const accounts = await db.query.bankAccount.findMany({
      orderBy: [desc(bankAccount.createdAt)],
    });

    // Get stats for each account
    const accountsWithStats = await Promise.all(
      accounts.map(async (account) => {
        // Get transaction count and balance
        const stats = await db
          .select({
            transactionCount: sql<number>`count(*)::int`,
            totalBalance: sql<string>`coalesce(sum(${transaction.amount})::text, '0')`,
            lastTransactionDate: sql<Date | null>`max(${transaction.timestamp})`,
          })
          .from(transaction)
          .where(eq(transaction.accountId, account.id));

        const stat = stats[0];

        return {
          ...account,
          transactionCount: stat?.transactionCount ?? 0,
          totalBalance: stat?.totalBalance ? parseFloat(stat.totalBalance) : 0,
          lastTransactionDate: stat?.lastTransactionDate ?? null,
        };
      }),
    );

    return NextResponse.json({ data: accountsWithStats });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Account name is required" },
        { status: 400 },
      );
    }

    const trimmedName = name.trim();

    // Check if account with this name already exists
    const existingAccount = await db.query.bankAccount.findFirst({
      where: eq(bankAccount.name, trimmedName),
    });

    if (existingAccount) {
      return NextResponse.json(
        { error: "An account with this name already exists" },
        { status: 409 },
      );
    }

    const newAccount: BankAccountInsert = {
      id: crypto.randomUUID(),
      name: trimmedName,
    };

    const [insertedAccount] = await db
      .insert(bankAccount)
      .values(newAccount)
      .returning();

    return NextResponse.json({ data: insertedAccount }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating account:", error);

    // Handle unique constraint violation
    const isUniqueError =
      (error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "23505") ||
      (error instanceof Error && error.message?.includes("unique"));

    if (isUniqueError) {
      return NextResponse.json(
        { error: "An account with this name already exists" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 },
    );
  }
}
