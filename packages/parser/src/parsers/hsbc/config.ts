export const HsbcPdfHeaders = [
	"Received By Us",
	"Transaction Date",
	"Details",
	"Amount",
];

export interface HsbcTransactionRow {
	"Received By Us": Date;
	"Transaction Date": Date;
	Details: string;
	Amount: string;
}
