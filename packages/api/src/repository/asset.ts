import { db } from "@vibenance/db";
import {
	type InvestmentTransactionInsert,
	investmentTransaction,
} from "@vibenance/db/schema/asset";
import { and, gte, lt } from "drizzle-orm";
import type { DateRange, Pagination } from "../utils";

export const AssetRepository = {
	count: async (type: string, dateRange: DateRange) => {
		const filters = [];

		if (type && type !== "all") {
			filters.push(eq(investmentTransaction.type, type));
		}

		if (dateRange.from) {
			filters.push(gte(investmentTransaction.timestamp, dateRange.from));
		}

		if (dateRange.to) {
			filters.push(lt(investmentTransaction.timestamp, dateRange.to));
		}

		return await db.$count(investmentTransaction, and(...filters));
	},

	getAll: async (
		type: string,
		dateRange: DateRange,
		pagination: Pagination,
	) => {
		return await db.query.investmentTransaction.findMany({
			where: (investmentTransaction, { lt, gte, and, eq }) => {
				const filters = [];

				if (type && type !== "all") {
					filters.push(eq(investmentTransaction.type, type));
				}

				if (dateRange.from) {
					filters.push(gte(investmentTransaction.timestamp, dateRange.from));
				}

				if (dateRange.to) {
					filters.push(lt(investmentTransaction.timestamp, dateRange.to));
				}

				return and(...filters);
			},
			limit: pagination.pageSize,
			offset: pagination.pageIndex * pagination.pageSize,
		});
	},

	bulkCreate: async (transactions: InvestmentTransactionInsert[]) => {
		return await db
			.insert(investmentTransaction)
			.values(transactions)
			.onConflictDoNothing()
			.returning();
	},
};
