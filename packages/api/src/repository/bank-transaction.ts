import { db } from "@vibenance/db";
import { transaction } from "@vibenance/db/schema/transaction";

type TransactionInsert = typeof transaction.$inferInsert;

export const BankTransactionRepository = {
	bulkCreate: async (transactions: TransactionInsert[]) => {
		return await db
			.insert(transaction)
			.values(transactions)
			.onConflictDoNothing()
			.returning();
	},

	updateCategory: async (transactionId: number, categoryId: number | null) => {
		return (
			(await db
				.update(transaction)
				.set({ categoryId: categoryId })
				.where(eq(transaction.id, transactionId))
				.returning()) || null
		);
	},
};
