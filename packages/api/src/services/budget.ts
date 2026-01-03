import type { BudgetInsert } from "@vibenance/db/schema/budget";
import { BudgetRepository } from "../repository/budget";

export const BudgetService = {
	getAll: async () => {
		return await BudgetRepository.getAll();
	},

	create: async (values: BudgetInsert) => {
		return await BudgetRepository.create(values);
	},
};
