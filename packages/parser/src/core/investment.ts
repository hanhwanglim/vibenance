export type TransactionRow = {
	transactionId: string;
	timestamp: Date;
	name: string;
	type: string;
	asset: string;
	quantity: string;
	currency: string;
	price: string;
	fees: string;
	total: string;
	errors?: string;
};
