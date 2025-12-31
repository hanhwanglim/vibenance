export const JPMorganInvestmentActivityCsvHeaders = [
	"Date",
	"Description",
	"Investment",
	"Asset Code",
	"Pot",
	"Account",
	"No. Shares",
	"Share Price (£)",
	"Total Value (£)",
];

export interface JPMorganInvestmentActivityRow {
	Date: Date;
	Description: string;
	Investment: string;
	"Asset Code": string;
	Pot: string;
	Account: string;
	"No. Shares": string;
	"Share Price (£)": string;
	"Total Value (£)": string;
	[key: string]: string | Date;
}

export const JPMorganTransactionHistoryCsvHeaders = [
	"Date",
	"Description",
	"Pot",
	"Amount (£)",
];

export interface JPMorganTransactionHistoryRow {
	Date: Date;
	Description: string;
	Pot: string;
	"Amount (£)": string;
	[key: string]: string | Date;
}
