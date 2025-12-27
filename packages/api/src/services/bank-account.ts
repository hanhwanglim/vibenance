import type { BankAccountInsert } from "@vibenance/db/schema/transaction";
import { BankAccountRepository } from "../repository/bank-account";

export const BankAccountService = {
	listAccounts: async () => {
		return await BankAccountRepository.listAccounts();
	},

	createAccount: async (data: BankAccountInsert) => {
		return await BankAccountRepository.createAccount(data);
	},

	deleteAccount: async (id: string) => {
		return await BankAccountRepository.deleteAccount(id);
	},
};
