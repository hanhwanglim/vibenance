import { db } from "@vibenance/db";
import {
	type TransactionInsert,
	transaction,
} from "@vibenance/db/schema/transaction";
import { and, desc, eq, gt, gte, lt, sum } from "drizzle-orm";
import type { DateRange, Pagination } from "../utils";

export const BankTransactionRepository = {
	count: async (type: string, dateRange: DateRange | undefined) => {
		const filters = [];

		if (type === "income") {
			// @ts-expect-error - drizzle-orm version mismatch between packages
			filters.push(gt(transaction.amount, 0));
		}

		if (type === "expenses") {
			// @ts-expect-error - drizzle-orm version mismatch between packages
			filters.push(lt(transaction.amount, 0));
		}

		if (dateRange?.from) {
			// @ts-expect-error - drizzle-orm version mismatch between packages
			filters.push(gte(transaction.timestamp, dateRange.from));
		}

		if (dateRange?.to) {
			// @ts-expect-error - drizzle-orm version mismatch between packages
			filters.push(lt(transaction.timestamp, dateRange.to));
		}

		return await db.$count(
			transaction,
			// @ts-expect-error - drizzle-orm version mismatch between packages
			filters.length > 0 ? and(...filters) : undefined,
		);
	},

	totalIncome: async (dateRange: DateRange | undefined) => {
		const filters = [];

		if (dateRange?.from) {
			// @ts-expect-error - drizzle-orm version mismatch between packages
			filters.push(gte(transaction.timestamp, dateRange.from));
		}

		if (dateRange?.to) {
			// @ts-expect-error - drizzle-orm version mismatch between packages
			filters.push(lt(transaction.timestamp, dateRange.to));
		}

		const [result] = await db
			// @ts-expect-error - drizzle-orm version mismatch between packages
			.select({ income: sum(transaction.amount) })
			.from(transaction)
			// @ts-expect-error - drizzle-orm version mismatch between packages
			.where(and(gt(transaction.amount, 0), ...filters));

		return (result?.income as string) || "0";
	},

	totalExpenses: async (dateRange: DateRange | undefined) => {
		const filters = [];

		if (dateRange?.from) {
			// @ts-expect-error - drizzle-orm version mismatch between packages
			filters.push(gte(transaction.timestamp, dateRange.from));
		}

		if (dateRange?.to) {
			// @ts-expect-error - drizzle-orm version mismatch between packages
			filters.push(lt(transaction.timestamp, dateRange.to));
		}

		const [result] = await db
			// @ts-expect-error - drizzle-orm version mismatch between packages
			.select({ expenses: sum(transaction.amount) })
			.from(transaction)
			// @ts-expect-error - drizzle-orm version mismatch between packages
			.where(and(lt(transaction.amount, 0), ...filters));

		return (result?.expenses as string) || "0";
	},

	getAll: async (
		type: string,
		dateRange: DateRange | undefined,
		pagination: Pagination,
	) => {
		return await db.query.transaction.findMany({
			with: {
				account: true,
				category: true,
			},
			where: (transaction, { lt, gte, and }) => {
				const filters = [];

				if (type === "income") {
					// @ts-expect-error - drizzle-orm version mismatch between packages
					filters.push(gt(transaction.amount, 0));
				}

				if (type === "expenses") {
					// @ts-expect-error - drizzle-orm version mismatch between packages
					filters.push(lt(transaction.amount, 0));
				}

				if (dateRange?.from) {
					filters.push(gte(transaction.timestamp, dateRange.from));
				}

				if (dateRange?.to) {
					filters.push(lt(transaction.timestamp, dateRange.to));
				}

				// @ts-expect-error - drizzle-orm version mismatch between packages
				return filters.length > 0 ? and(...filters) : undefined;
			},
			// @ts-expect-error - drizzle-orm version mismatch between packages
			orderBy: [desc(transaction.timestamp), desc(transaction.createdAt)],
			limit: pagination.pageSize,
			offset: pagination.pageIndex * pagination.pageSize,
		});
	},

	bulkCreate: async (transactions: TransactionInsert[]) => {
		return await db
			.insert(transaction)
			.values(transactions)
			.onConflictDoNothing()
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
				// @ts-expect-error - drizzle-orm version mismatch between packages
				.where(eq(transaction.id, transactionId))
				.returning()) || null
		);
	},
};
