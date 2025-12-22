import { BankAccountRepository } from "../repository/bank-account";

export const BankAccountService = {
	listAccounts: async () => {
		return await BankAccountRepository.listAccounts();
	},
};
