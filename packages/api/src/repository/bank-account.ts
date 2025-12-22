import { db } from "@vibenance/db";
import { bankAccount } from "@vibenance/db/schema/transaction";
import { asc } from "drizzle-orm";

export const BankAccountRepository = {
	listAccounts: async () => {
		return await db.query.bankAccount.findMany({
			orderBy: [asc(bankAccount.name)],
		});
	},
};
