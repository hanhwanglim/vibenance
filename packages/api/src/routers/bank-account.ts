import { accountTypeEnumSchema } from "@vibenance/db/schema/account";
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
				type: accountTypeEnumSchema,
				accountNumber: z.string().optional(),
				bankName: z.string().optional(),
				color: z.string().optional(),
				currency: z.string().optional(),
				balance: z.string().optional(),
			}),
		)
		.handler(async ({ input }) => {
			return await BankAccountService.createAccount(input);
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string(),
				type: accountTypeEnumSchema,
				accountNumber: z.string().optional(),
				bankName: z.string().optional(),
				color: z.string().optional(),
				currency: z.string().optional(),
				balance: z.string().optional(),
			}),
		)
		.handler(async ({ input }) => {
			const { id, ...values } = input;
			return await BankAccountService.updateAccount(input.id, values);
		}),

	delete: protectedProcedure.input(z.string()).handler(async ({ input }) => {
		return await BankAccountService.deleteAccount(input);
	}),
};
