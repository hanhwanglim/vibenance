import { auth } from "@/lib/auth";
import { db } from "@/db";
import { bankAccount } from "@/db/schemas/transactions";
import { transaction } from "@/db/schemas/transactions";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const accountId = params.id;
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Account name is required" },
        { status: 400 },
      );
    }

    const trimmedName = name.trim();

    // Check if account exists
    const existingAccount = await db.query.bankAccount.findFirst({
      where: eq(bankAccount.id, accountId),
    });

    if (!existingAccount) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Check if another account with this name already exists
    const duplicateAccount = await db.query.bankAccount.findFirst({
      where: eq(bankAccount.name, trimmedName),
    });

    if (duplicateAccount && duplicateAccount.id !== accountId) {
      return NextResponse.json(
        { error: "An account with this name already exists" },
        { status: 409 },
      );
    }

    // Update the account
    const [updatedAccount] = await db
      .update(bankAccount)
      .set({ name: trimmedName })
      .where(eq(bankAccount.id, accountId))
      .returning();

    return NextResponse.json({ data: updatedAccount });
  } catch (error: unknown) {
    console.error("Error updating account:", error);

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
      { error: "Failed to update account" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const accountId = params.id;

    // Check if account exists
    const existingAccount = await db.query.bankAccount.findFirst({
      where: eq(bankAccount.id, accountId),
    });

    if (!existingAccount) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Check if account has transactions
    const transactionCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(transaction)
      .where(eq(transaction.accountId, accountId));

    if (transactionCount[0]?.count && transactionCount[0].count > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete account with existing transactions. Please remove all transactions first.",
        },
        { status: 400 },
      );
    }

    // Delete the account
    await db.delete(bankAccount).where(eq(bankAccount.id, accountId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 },
    );
  }
}
