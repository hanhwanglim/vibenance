export const MonzoCsvHeaders = [
	"Transaction ID",
	"Date",
	"Time",
	"Type",
	"Name",
	"Emoji",
	"Category",
	"Amount",
	"Currency",
	"Local amount",
	"Local currency",
	"Notes and #tags",
	"Address",
	"Receipt",
	"Description",
	"Category split",
	"Money Out",
	"Money In",
] as const;

export interface MonzoTransactionRow {
	"Transaction ID": string;
	Date: string;
	Time: string;
	Type: string;
	Name: string;
	Emoji: string;
	Category: string;
	Amount: string;
	Currency: string;
	"Local amount": string;
	"Local currency": string;
	"Notes and #tags": string;
	Address: string;
	Receipt: string;
	Description: string;
	"Category split": string;
	"Money Out": string;
	"Money In": string;
	[key: string]: string | number;
}
