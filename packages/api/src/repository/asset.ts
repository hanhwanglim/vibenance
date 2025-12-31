import { db } from "@vibenance/db";
import {
	type InvestmentTransactionInsert,
	investmentTransaction,
} from "@vibenance/db/schema/asset";
import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import type { DateRange, Pagination } from "../utils";

export const AssetRepository = {
	count: async (type: string, dateRange?: DateRange) => {
		const filters = [];

		if (type && type !== "all") {
			filters.push(
				eq(
					// @ts-expect-error - drizzle-orm version mismatch between packages
					investmentTransaction.type,
					type as "buy" | "sell" | "deposit" | "reward" | "other",
				),
			);
		}

		if (dateRange?.from) {
			// @ts-expect-error - drizzle-orm version mismatch between packages
			filters.push(gte(investmentTransaction.timestamp, dateRange.from));
		}

		if (dateRange?.to) {
			// @ts-expect-error - drizzle-orm version mismatch between packages
			filters.push(lt(investmentTransaction.timestamp, dateRange.to));
		}

		return await db.$count(
			investmentTransaction,
			// @ts-expect-error - drizzle-orm version mismatch between packages
			filters.length > 0 ? and(...filters) : undefined,
		);
	},

	getAll: async (
		type: string,
		dateRange: DateRange | undefined,
		pagination: Pagination,
	) => {
		return await db.query.investmentTransaction.findMany({
			where: (investmentTransaction, { lt, gte, and, eq }) => {
				const filters = [];

				if (type && type !== "all") {
					filters.push(
						eq(
							investmentTransaction.type,
							type as "buy" | "sell" | "deposit" | "reward" | "other",
						),
					);
				}

				if (dateRange?.from) {
					filters.push(gte(investmentTransaction.timestamp, dateRange.from));
				}

				if (dateRange?.to) {
					filters.push(lt(investmentTransaction.timestamp, dateRange.to));
				}

				return and(...filters);
			},
			// @ts-expect-error - drizzle-orm version mismatch between packages
			orderBy: [
				desc(investmentTransaction.timestamp),
				desc(investmentTransaction.createdAt),
			],
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
