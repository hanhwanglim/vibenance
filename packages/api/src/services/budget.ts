import type { BudgetInsert } from "@vibenance/db/schema/budget";
import { BudgetRepository } from "../repository/budget";
import type { DateRange } from "../utils/filter";
import { BankTransactionService } from "./bank-transaction";

export const BudgetService = {
	getAll: async (dateRange: DateRange) => {
		const categories =
			await BankTransactionService.categoriesWithTransactions(dateRange);
		const budgets = await BudgetRepository.getAll();

		const categoriesMap = new Map(
			categories.map((category) => [category.id, category]),
		);
		const result = budgets.map((budget) => {
			const spent = categoriesMap.get(budget.categoryId)?.sum || "0";
			return { ...budget, spent: Math.abs(Number(spent)) };
		});

		return result;
	},

	create: async (values: BudgetInsert) => {
		return await BudgetRepository.create(values);
	},
};
