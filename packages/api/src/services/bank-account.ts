import type { BankAccountInsert } from "@vibenance/db/schema/account";
import { BankAccountRepository } from "../repository/bank-account";

export const BankAccountService = {
	listAccounts: async () => {
		return await BankAccountRepository.listAccounts();
	},

	createAccount: async (data: BankAccountInsert) => {
		return await BankAccountRepository.createAccount(data);
	},

	updateAccount: async (id: string, values: Partial<BankAccountInsert>) => {
		return await BankAccountRepository.updateAccount(id, values);
	},

	deleteAccount: async (id: string) => {
		return await BankAccountRepository.deleteAccount(id);
	},
};
