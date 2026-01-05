import z from "zod";
import { protectedProcedure } from "../index";
import { BudgetService } from "../services/budget";
import { dateRange } from "../utils/filter";

export const budgetRouter = {
	getAll: protectedProcedure.input(dateRange).handler(async ({ input }) => {
		return await BudgetService.getAll(input);
	}),

	create: protectedProcedure
		.input(
			z.object({
				categoryId: z.string(),
				currency: z.string(),
				amount: z.string(),
			}),
		)
		.handler(async ({ input }) => {
			return await BudgetService.create(input);
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				categoryId: z.string(),
				currency: z.string(),
				amount: z.string(),
			}),
		)
		.handler(async ({ input }) => {
			const { id, ...values } = input;
			return await BudgetService.update(id, values);
		}),

	delete: protectedProcedure.input(z.string()).handler(async ({ input }) => {
		return await BudgetService.delete(input);
	}),

	summary: protectedProcedure
		.input(z.object({ dateRange: dateRange }))
		.handler(async ({ input }) => {
			return await BudgetService.getSummary(input.dateRange);
		}),

	budgetProcess: protectedProcedure
		.input(z.object({ dateRange: dateRange }))
		.handler(async ({ input }) => {
			return await BudgetService.budgetProcess(input.dateRange);
		}),

	budgetAllocation: protectedProcedure.handler(async () => {
		return await BudgetService.budgetAllocation();
	}),
};
