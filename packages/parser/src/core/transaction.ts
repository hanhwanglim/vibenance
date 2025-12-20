import type { category } from "@vibenance/db/schema/transaction";

type Category = typeof category.$inferSelect;

export type TransactionRow = {
	transactionId: string;
	timestamp: Date;
	name: string;
	currency: string;
	amount: string;
	reference?: string;
	categoryId: number | null;
	category: Category | null;
	errors?: string;
};
