import z from "zod";
import { protectedProcedure } from "../index";
import { BudgetService } from "../services/budget";

export const budgetRouter = {
	getAll: protectedProcedure.handler(async () => {
		return await BudgetService.getAll();
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
};
