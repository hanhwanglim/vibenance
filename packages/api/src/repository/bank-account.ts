import { db } from "@vibenance/db";
import {
	type BankAccountInsert,
	bankAccount,
} from "@vibenance/db/schema/transaction";
import { asc, eq } from "drizzle-orm";

export const BankAccountRepository = {
	listAccounts: async () => {
		return await db.query.bankAccount.findMany({
			// @ts-expect-error - drizzle-orm version mismatch between packages
			orderBy: [asc(bankAccount.name)],
		});
	},

	createAccount: async (data: BankAccountInsert) => {
		return await db.insert(bankAccount).values(data).returning();
	},

	deleteAccount: async (id: string) => {
		// @ts-expect-error - drizzle-orm version mismatch between packages
		await db.delete(bankAccount).where(eq(bankAccount.id, id));
	},
};
