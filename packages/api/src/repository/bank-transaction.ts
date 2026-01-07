import { db } from "@vibenance/db";
import {
	category,
	type TransactionInsert,
	transaction,
} from "@vibenance/db/schema/transaction";
import { DateTime } from "@vibenance/utils/date";
import { and, eq, gt, gte, lt, max, min, sql, sum } from "drizzle-orm";
import type { DateRange, Pagination } from "../utils/filter";

export const BankTransactionRepository = {
	count: async (type: string, dateRange: DateRange | undefined) => {
		const filters = [];

		if (type === "income") {
			filters.push(gte(transaction.amount, "0"));
		}

		if (type === "expenses") {
			filters.push(lt(transaction.amount, "0"));
		}

		return await db.$count(
			transaction,
			and(...filters, ...dateRangeFilters(dateRange)),
		);
	},

	totalIncome: async (dateRange: DateRange | undefined) => {
		const [result] = await db
			.select({ income: sum(transaction.amount) })
			.from(transaction)
			.where(and(gt(transaction.amount, "0"), ...dateRangeFilters(dateRange)));

		return (result?.income as string) || "0";
	},

	totalExpenses: async (dateRange: DateRange | undefined) => {
		const [result] = await db
			.select({ expenses: sum(transaction.amount) })
			.from(transaction)
			.where(and(lt(transaction.amount, "0"), ...dateRangeFilters(dateRange)));

		return (result?.expenses as string) || "0";
	},

	getAll: async (
		type: string,
		dateRange: DateRange | undefined,
		pagination: Pagination,
	) => {
		const filters = [];

		if (type === "income") {
			filters.push({ amount: { gte: "0" } });
		}

		if (type === "expenses") {
			filters.push({ amount: { lt: "0" } });
		}

		if (dateRange?.from) {
			filters.push({ timestamp: { gte: dateRange.from } });
		}

		if (dateRange?.to) {
			filters.push({ timestamp: { lt: dateRange.to } });
		}

		return await db.query.transaction.findMany({
			with: {
				bankAccount: true,
				category: true,
			},
			where: {
				AND: [...filters],
			},
			orderBy: {
				timestamp: "desc",
				createdAt: "desc",
			},
			limit: pagination.pageSize,
			offset: pagination.pageIndex * pagination.pageSize,
		});
	},

	bulkCreate: async (transactions: TransactionInsert[]) => {
		return await db
			.insert(transaction)
			.values(transactions)
			.onConflictDoUpdate({
				target: transaction.transactionId,
				set: { metadata: sql.raw(`excluded.${transaction.metadata.name}`) },
			})
			.returning();
	},

	listCategories: async () => {
		return await db.query.category.findMany();
	},

	updateCategory: async (transactionId: string, categoryId: string | null) => {
		return (
			(await db
				.update(transaction)
				.set({ categoryId: categoryId })
				.where(eq(transaction.id, transactionId))
				.returning()) || null
		);
	},

	categoriesWithTransactions: async (dateRange?: DateRange) => {
		return await db
			.select({
				id: category.id,
				name: category.name,
				sum: sum(transaction.amount),
			})
			.from(transaction)
			.leftJoin(category, eq(transaction.categoryId, category.id))
			.where(and(lt(transaction.amount, "0"), ...dateRangeFilters(dateRange)))
			.groupBy(category.id)
			.orderBy(({ sum }) => sum); // expenses are negative
	},

	spendingPeriod: async () => {
		const [result] = await db
			.select({
				min: min(transaction.timestamp),
				max: max(transaction.timestamp),
			})
			.from(transaction)
			.where(lt(transaction.amount, "0"));

		return {
			min: result?.min as Date | undefined,
			max: result?.max as Date | undefined,
		};
	},

	spendingTrend: async (dateRange?: DateRange, interval?: string) => {
		return await db
			.select({
				bin: sql<string>`date_trunc(${sql.raw(`'${interval || "month"}'`)}, ${transaction.timestamp})`,
				sum: sum(transaction.amount),
			})
			.from(transaction)
			.where(and(lt(transaction.amount, "0"), ...dateRangeFilters(dateRange)))
			.groupBy(({ bin }) => bin)
			.orderBy(({ bin }) => bin);
	},

	spendingTrendAvg: async (dateRange?: DateRange, interval?: string) => {
		const range = {
			from: new DateTime(dateRange?.from).subtract({ days: 90 }),
			to: new DateTime(dateRange?.to).add({ days: 90 }),
		};

		const intervalStr = interval || "month";
		const fromDate = range.from.toISOString();
		const toDate = range.to.toISOString();

		const result = await db.execute(sql`
			WITH bins AS (
				SELECT generate_series(
					date_trunc(${sql.raw(`'${intervalStr}'`)}, ${sql.raw(`'${fromDate}'`)}::timestamp),
					date_trunc(${sql.raw(`'${intervalStr}'`)}, ${sql.raw(`'${toDate}'`)}::timestamp),
					${sql.raw(`'1 ${intervalStr}'`)}::interval
				) AS bin
			),
			transaction_sums AS (
				SELECT
					date_trunc(${sql.raw(`'${intervalStr}'`)}, ${transaction.timestamp}) AS bin,
					SUM(${transaction.amount}) AS sum
				FROM ${transaction}
				WHERE ${transaction.amount} < 0
					${range.from ? sql`AND ${transaction.timestamp} >= ${new Date(range.from)}` : sql``}
					${range.to ? sql`AND ${transaction.timestamp} < ${new Date(range.to)}` : sql``}
				GROUP BY bin
			)
			SELECT
				b.bin,
				AVG(COALESCE(ts.sum, 0)) OVER (
					ORDER BY b.bin
					RANGE BETWEEN INTERVAL '90 days' PRECEDING AND CURRENT ROW
				) AS avg
			FROM bins b
			LEFT JOIN transaction_sums ts ON b.bin = ts.bin
			ORDER BY b.bin
		`);

		return result.rows as { bin: string; avg: string }[];
	},

	spendingTrendByCategory: async (dateRange?: DateRange, interval?: string) => {
		return await db
			.select({
				bin: sql<string>`date_trunc(${sql.raw(`'${interval || "month"}'`)}, ${transaction.timestamp})`,
				category: category.name,
				sum: sum(transaction.amount),
			})
			.from(transaction)
			.leftJoin(category, eq(transaction.categoryId, category.id))
			.where(and(lt(transaction.amount, "0"), ...dateRangeFilters(dateRange)))
			.groupBy(({ bin, category }) => [bin, category])
			.orderBy(({ bin }) => bin);
	},
};

function dateRangeFilters(dateRange?: DateRange) {
	const filters = [];

	if (dateRange?.from) {
		filters.push(gte(transaction.timestamp, dateRange.from));
	}

	if (dateRange?.to) {
		filters.push(lt(transaction.timestamp, dateRange.to));
	}

	return filters;
}
