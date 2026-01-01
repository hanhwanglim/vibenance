import { db } from "@vibenance/db";
import {
	type InvestmentTransactionInsert,
	type InvestmentTransactionType,
	investmentTransaction,
} from "@vibenance/db/schema/asset";
import { and, eq, gte, lt, sql } from "drizzle-orm";
import type { DateRange, Pagination } from "../utils/filter";

export const AssetRepository = {
	count: async (
		type: InvestmentTransactionType | undefined,
		dateRange?: DateRange,
	) => {
		const filters = [];

		if (type) {
			filters.push(eq(investmentTransaction.type, type));
		}

		if (dateRange?.from) {
			filters.push(gte(investmentTransaction.timestamp, dateRange.from));
		}

		if (dateRange?.to) {
			filters.push(lt(investmentTransaction.timestamp, dateRange.to));
		}

		return await db.$count(
			investmentTransaction,
			filters.length > 0 ? and(...filters) : undefined,
		);
	},

	getAll: async (
		type: InvestmentTransactionType | undefined,
		dateRange: DateRange | undefined,
		pagination: Pagination,
	) => {
		const filters = [];

		if (type) {
			filters.push({ type: { eq: type } });
		}

		if (dateRange?.from) {
			filters.push({ timestamp: { gte: dateRange.from } });
		}

		if (dateRange?.to) {
			filters.push({ timestamp: { lt: dateRange.to } });
		}

		return await db.query.investmentTransaction.findMany({
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

	bulkCreate: async (transactions: InvestmentTransactionInsert[]) => {
		return await db
			.insert(investmentTransaction)
			.values(transactions)
			.onConflictDoUpdate({
				target: investmentTransaction.transactionId,
				set: {
					metadata: sql.raw(`excluded.${investmentTransaction.metadata.name}`),
				},
			})
			.returning();
	},
};
