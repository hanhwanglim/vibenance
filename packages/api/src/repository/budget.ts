import { db } from "@vibenance/db";
import { type BudgetInsert, budget } from "@vibenance/db/schema/budget";

export const BudgetRepository = {
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
};
