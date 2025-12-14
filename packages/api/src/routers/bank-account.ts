import { db } from "@vibenance/db";
import { bankAccount } from "@vibenance/db/schema/transaction";
import { asc } from "drizzle-orm";
import { publicProcedure } from "../index";

export const bankAccountRouter = {
	getAll: publicProcedure.handler(async () => {
		return await db.query.bankAccount.findMany({
			orderBy: [asc(bankAccount.name)],
		});
	}),
};
