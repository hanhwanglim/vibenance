import z from "zod";
import { protectedProcedure } from "../index";
import { BankAccountService } from "../services/bank-account";

export const bankAccountRouter = {
	getAll: protectedProcedure.handler(async () => {
		return await BankAccountService.listAccounts();
	}),

	create: protectedProcedure
		.input(
			z.object({
				name: z.string(),
				type: z.enum([
					"other",
					"savings",
					"current",
					"checking",
					"credit_card",
					"investment",
					"loan",
				]),
				accountNumber: z.string().optional(),
				bankName: z.string().optional(),
				color: z.string().optional(),
			}),
		)
		.handler(async ({ input }) => {
			return await BankAccountService.createAccount(input);
		}),

	delete: protectedProcedure.input(z.string()).handler(async ({ input }) => {
		return await BankAccountService.deleteAccount(input);
	}),
};
