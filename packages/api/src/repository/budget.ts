import { db } from "@vibenance/db";
import { type BudgetInsert, budget } from "@vibenance/db/schema/budget";
import { eq } from "drizzle-orm";

export const BudgetRepository = {
	count: async () => {
		return await db.$count(budget);
	},

	getAll: async () => {
		return await db.query.budget.findMany({
			with: {
				category: true,
			},
		});
	},

	create: async (values: BudgetInsert) => {
		return await db.insert(budget).values(values).returning();
	},

	update: async (id: string, values: Partial<BudgetInsert>) => {
		return await db
			.update(budget)
			.set(values)
			.where(eq(budget.id, id))
			.returning();
	},

	delete: async (id: string) => {
		await db.delete(budget).where(eq(budget.id, id));
	},
};
