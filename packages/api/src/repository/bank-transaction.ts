import { db } from "@vibenance/db";
import {
	type TransactionInsert,
	transaction,
} from "@vibenance/db/schema/transaction";
import { and, desc, eq, gt, gte, lt, sum } from "drizzle-orm";
import type { DateRange, Pagination } from "../utils";

export const BankTransactionRepository = {
	count: async (type: string, dateRange: DateRange) => {
		const filters = [];

		if (type && type !== "all") {
			filters.push(eq(transaction.type, type));
		}

		if (dateRange.from) {
			filters.push(gte(transaction.timestamp, dateRange.from));
		}

		if (dateRange.to) {
			filters.push(lt(transaction.timestamp, dateRange.to));
		}

		return await db.$count(transaction, and(...filters));
	},

	totalIncome: async (dateRange: DateRange) => {
		const filters = [];

		if (dateRange.from) {
			filters.push(gte(transaction.timestamp, dateRange.from));
		}

		if (dateRange.to) {
			filters.push(lt(transaction.timestamp, dateRange.to));
		}

		const [result] = await db
			.select({ income: sum(transaction.amount) })
			.from(transaction)
			.where(and(gt(transaction.amount, 0), ...filters));

		return (result?.income as string) || "0";
	},

	totalExpenses: async (dateRange: DateRange) => {
		const filters = [];

		if (dateRange.from) {
			filters.push(gte(transaction.timestamp, dateRange.from));
		}

		if (dateRange.to) {
			filters.push(lt(transaction.timestamp, dateRange.to));
		}

		const [result] = await db
			.select({ expenses: sum(transaction.amount) })
			.from(transaction)
			.where(and(lt(transaction.amount, 0), ...filters));

		return (result?.expenses as string) || "0";
	},

	getAll: async (
		type: string,
		dateRange: DateRange,
		pagination: Pagination,
	) => {
		return await db.query.transaction.findMany({
			with: {
				account: true,
				category: true,
			},
			where: (transaction, { lt, gte, and, eq }) => {
				const filters = [];

				if (type && type !== "all") {
					filters.push(eq(transaction.type, type));
				}

				if (dateRange.from) {
					filters.push(gte(transaction.timestamp, dateRange.from));
				}

				if (dateRange.to) {
					filters.push(lt(transaction.timestamp, dateRange.to));
				}

				return and(...filters);
			},
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
				.where(eq(transaction.id, transactionId))
				.returning()) || null
		);
	},
};
