import { auth } from "@/lib/auth";
import { db } from "@/db";
import { transaction, bankAccount, category } from "@/db/schemas/transactions";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { and, between, eq, count, desc, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const page = searchParams.get("page");
  const limit = searchParams.get("limit");

  const whereConditions = [eq(transaction.userId, session.user.id)];

  if (from && to) {
    whereConditions.push(
      between(transaction.timestamp, new Date(from), new Date(to)),
    );
  }

  const transactions = await db.query.transaction.findMany({
    where: and(...whereConditions),
    limit: limit ? parseInt(limit) : 100,
    offset: page ? parseInt(page) * (limit ? parseInt(limit) : 100) : 0,
    orderBy: [desc(transaction.timestamp), desc(transaction.createdAt)],
  });

  const rowCount = await db
    .select({ count: count() })
    .from(transaction)
    .where(and(...whereConditions));

  // Fetch all unique account and category IDs
  const accountIds = [...new Set(transactions.map((t) => t.accountId))];
  const categoryIds = [...new Set(transactions.map((t) => t.categoryId))];

  // Fetch accounts and categories
  const accounts =
    accountIds.length > 0
      ? await db
          .select()
          .from(bankAccount)
          .where(inArray(bankAccount.id, accountIds))
      : [];

  const categories =
    categoryIds.length > 0
      ? await db
          .select()
          .from(category)
          .where(inArray(category.id, categoryIds))
      : [];

  // Create lookup maps
  const accountMap = new Map(accounts.map((a) => [a.id, a.name]));
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  // Transform transactions to include denormalized account and category fields
  const transformedTransactions = transactions.map((t) => ({
    id: t.id,
    account: accountMap.get(t.accountId) || "",
    timestamp: t.timestamp.toISOString(),
    name: t.name,
    currency: t.currency,
    amount: parseFloat(t.amount),
    category: categoryMap.get(t.categoryId) || "",
    reference: t.reference || "",
    notes: t.notes || "",
  }));

  return NextResponse.json({
    count: rowCount[0].count,
    data: transformedTransactions,
  });
}
