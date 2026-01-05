import type { BudgetInsert } from "@vibenance/db/schema/budget";
import { DateTime } from "@vibenance/utils/date";
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

	getSummary: async (dateRange: DateRange) => {
		const prevMonth = new DateTime(dateRange.from)
			.subtract({ months: 1 })
			.startOfMonth();
		const prevRange = { from: prevMonth, to: prevMonth.endOfMonth() };

		const budgets = await BudgetRepository.getAll();
		const activeBudgetsCount = await BudgetRepository.count();

		const totalBudgeted = budgets.reduce(
			(sum, budget) => sum + Number(budget.amount),
			0,
		);

		const [currentCategories, previousCategories] = await Promise.all([
			BankTransactionService.categoriesWithTransactions(dateRange),
			BankTransactionService.categoriesWithTransactions(prevRange),
		]);

		const currentCategoriesMap = new Map(
			currentCategories.map((cat) => [cat.id, cat]),
		);
		const previousCategoriesMap = new Map(
			previousCategories.map((cat) => [cat.id, cat]),
		);

		const totalSpent = budgets.reduce((sum, budget) => {
			const categorySpending = currentCategoriesMap.get(budget.categoryId);
			if (categorySpending) {
				return sum + Math.abs(Number(categorySpending.sum));
			}
			return sum;
		}, 0);

		const prevTotalSpent = budgets.reduce((sum, budget) => {
			const categorySpending = previousCategoriesMap.get(budget.categoryId);
			if (categorySpending) {
				return sum + Math.abs(Number(categorySpending.sum));
			}
			return sum;
		}, 0);

		const remaining = totalBudgeted - totalSpent;
		const prevRemaining = totalBudgeted - prevTotalSpent;
		const utilization =
			totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
		const prevUtilization =
			totalBudgeted > 0 ? (prevTotalSpent / totalBudgeted) * 100 : 0;

		return {
			totalBudgeted,
			totalSpent,
			remaining,
			utilization,
			activeBudgetsCount,
			prevTotalBudgeted: totalBudgeted,
			prevTotalSpent,
			prevRemaining,
			prevUtilization,
		};
	},

	create: async (values: BudgetInsert) => {
		return await BudgetRepository.create(values);
	},

	update: async (id: string, values: Partial<BudgetInsert>) => {
		return await BudgetRepository.update(id, values);
	},

	delete: async (id: string) => {
		return await BudgetRepository.delete(id);
	},
};
