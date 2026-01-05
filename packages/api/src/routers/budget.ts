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
				name: z.string(),
				categoryId: z.string(),
				currency: z.string(),
				amount: z.string(),
				period: z.enum(["weekly", "monthly", "yearly"]),
				startDate: z.date().optional(),
			}),
		)
		.handler(async ({ input }) => {
			return await BudgetService.create(input);
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string(),
				categoryId: z.string(),
				currency: z.string(),
				amount: z.string(),
				period: z.enum(["weekly", "monthly", "yearly"]),
				startDate: z.date().optional(),
			}),
		)
		.handler(async ({ input }) => {
			const { id, ...values } = input;
			return await BudgetService.update(id, values);
		}),

	delete: protectedProcedure.input(z.string()).handler(async ({ input }) => {
		return await BudgetService.delete(input);
	}),
};
