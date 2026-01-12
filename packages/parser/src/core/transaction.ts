import type { TransactionType } from "@vibenance/db/schema/transaction";

export type TransactionRow = {
	transactionId: string;
	date: Date;
	time: Date | null;
	name: string;
	type: TransactionType;
	currency: string;
	amount: string;
	reference?: string;
	categoryId: string | null;
	errors?: string;
	metadata: Record<string, string | number | Date | undefined>;
};
