import { db } from "@vibenance/db";
import {
	type BankAccountInsert,
	bankAccount,
} from "@vibenance/db/schema/transaction";
import { eq } from "drizzle-orm";

export const BankAccountRepository = {
	listAccounts: async () => {
		return await db.query.bankAccount.findMany({
			orderBy: {
				name: "asc",
			},
		});
	},

	createAccount: async (data: BankAccountInsert) => {
		return await db.insert(bankAccount).values(data).returning();
	},

	deleteAccount: async (id: string) => {
		await db.delete(bankAccount).where(eq(bankAccount.id, id));
	},
};
