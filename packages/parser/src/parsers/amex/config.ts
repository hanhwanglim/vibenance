export const AmexCsvHeaders = [
	"Date",
	"Description",
	"Amount",
	"Extended Details",
	"Appears On Your Statement As",
	"Address",
	"Town/City",
	"Postcode",
	"Country",
	"Reference",
	"Category",
] as const;

export interface AmexTransactionRow {
	Date: string;
	Description: string;
	Amount: string;
	"Extended Details": string;
	"Appears On Your Statement As": string;
	Address: string;
	"Town/City": string;
	Postcode: string;
	Country: string;
	Reference: string;
	Category: string;
	[key: string]: string | number;
}
