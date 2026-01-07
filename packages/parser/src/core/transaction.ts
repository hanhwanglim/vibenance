import type {
	category,
	TransactionType,
} from "@vibenance/db/schema/transaction";

type Category = typeof category.$inferSelect;

export type TransactionRow = {
	transactionId: string;
	timestamp: Date;
	name: string;
	type: TransactionType;
	currency: string;
	amount: string;
	reference?: string;
	categoryId: string | null;
	category: Category | null;
	errors?: string;
	metadata: Record<string, string | number | Date | undefined>;
};
