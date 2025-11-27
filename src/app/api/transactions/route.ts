import { auth } from "@/lib/auth";
import { db } from "@/db";
import { transaction } from "@/db/schemas/transactions";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { and, between, eq, count, desc } from "drizzle-orm";

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

  return NextResponse.json({ count: rowCount[0].count, data: transactions });
}
