import { db } from "@vibenance/db";
import { bankAccount } from "@vibenance/db/schema/transaction";
import { asc, eq } from "drizzle-orm";
import z from "zod";
import { protectedProcedure } from "../index";

export const bankAccountRouter = {
	getAll: protectedProcedure.handler(async () => {
		return await db.query.bankAccount.findMany({
			orderBy: [asc(bankAccount.name)],
		});
	}),

	create: protectedProcedure
		.input(
			z.object({
				name: z.string(),
				type: z.string(),
				accountNumber: z.string().optional(),
				bankName: z.string().optional(),
				color: z.string().optional(),
			}),
		)
		.handler(async ({ input }) => {
			return await db.insert(bankAccount).values(input);
		}),

	delete: protectedProcedure.input(z.number()).handler(async ({ input }) => {
		return await db.delete(bankAccount).where(eq(bankAccount.id, input));
	}),
};
