import type { InvestmentTransactionType } from "@vibenance/db/schema/asset";

export type TransactionRow = {
	transactionId: string;
	timestamp: Date;
	name: string;
	type: InvestmentTransactionType;
	asset: string;
	quantity: string;
	currency: string;
	price: string;
	fees: string;
	total: string;
	errors?: string;
	metadata: Record<string, string | number | Date | undefined>;
};
