import { auth } from "@/lib/auth";
import { db } from "@/db";
import { transaction, TransactionInsert } from "@/db/schemas/transactions";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { BankFormat, MonzoTransaction } from "@/lib/parser";
import { transaction as transactionTable } from "@/db/schemas/transactions";
import { and, between, eq } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { DateRange } from "@/app/(app)/transactions/_components/date-range-picker";

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

  const today = new Date();
  const dateRange: { from: Date; to: Date } = {
    from: from ? new Date(from) : new Date(today.setDate(today.getDate() - 30)),
    to: to ? new Date(to) : new Date(today.setDate(today.getDate())),
  };

  const transactions = await db.query.transaction.findMany({
    where: and(
      eq(transaction.userId, session.user.id),
      between(transaction.timestamp, dateRange.from, dateRange.to),
    ),
    limit: 100,
    orderBy: [desc(transaction.timestamp), desc(transaction.createdAt)],
  });

  return NextResponse.json(transactions);
}
