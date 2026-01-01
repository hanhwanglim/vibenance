import { google } from "@ai-sdk/google";
import type { StreamTextResult } from "ai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { AssetService } from "./asset";
import { BankAccountService } from "./bank-account";
import { BankTransactionService } from "./bank-transaction";

async function getFinancialSummary() {
	const { totalIncome, totalExpenses, netAmount } =
		await BankTransactionService.getSummary({});

	const accounts = await BankAccountService.listAccounts();
	const { transactions: recentTransactions } =
		await BankTransactionService.getAll(
			"all",
			{},
			{ pageIndex: 1, pageSize: 10 },
		);
	const { transactions: assetTransactions } = await AssetService.getAll(
		undefined,
		{},
		{ pageIndex: 1, pageSize: 10 },
	);

	return {
		summary: {
			totalIncome: totalIncome,
			totalExpenses: totalExpenses,
			netAmount: netAmount,
		},
		accounts: accounts.map((acc) => ({
			id: acc.id,
			name: acc.name,
			type: acc.type,
			bankName: acc.bankName,
		})),
		recentTransactions: recentTransactions.map((tx) => {
			const txWithRelations = tx as typeof tx & {
				account?: { name: string } | null;
				category?: { name: string } | null;
			};
			return {
				id: tx.id,
				timestamp: tx.timestamp,
				name: tx.name,
				amount: tx.amount,
				currency: tx.currency,
				account: txWithRelations.account?.name,
				category: txWithRelations.category?.name,
			};
		}),
		assetTransactions: assetTransactions.map((tx) => ({
			id: tx.id,
			timestamp: tx.timestamp,
			name: tx.name,
			type: tx.type,
			asset: tx.asset,
			quantity: tx.quantity,
			price: tx.price,
			total: tx.total,
		})),
	};
}

export const AgentService = {
	stream: async (
		messages: UIMessage[],
	): Promise<StreamTextResult<never, never>> => {
		const financialData = await getFinancialSummary();

		const systemPrompt = `You are a helpful personal finance assistant. You have access to the user's financial data:

Financial Summary:
- Total Income: ${financialData.summary.totalIncome}
- Total Expenses: ${financialData.summary.totalExpenses}
- Net Amount: ${financialData.summary.netAmount}

Bank Accounts:
${financialData.accounts.map((acc) => `- ${acc.name} (${acc.type})${acc.bankName ? ` - ${acc.bankName}` : ""}`).join("\n")}

Recent Transactions (last 10):
${financialData.recentTransactions.map((tx) => `- ${tx.name}: ${tx.amount} ${tx.currency} on ${tx.timestamp.toISOString().split("T")[0]}${tx.account ? ` (${tx.account})` : ""}${tx.category ? ` [${tx.category}]` : ""}`).join("\n")}

${financialData.assetTransactions.length > 0 ? `\nAsset Transactions:\n${financialData.assetTransactions.map((tx) => `- ${tx.name}: ${tx.type} - ${tx.quantity} ${tx.asset} @ ${tx.price} = ${tx.total}`).join("\n")}` : ""}

Answer questions about the user's financial situation in a helpful, clear, and concise manner. Be specific with numbers and dates when available.`;

		return streamText({
			model: google("gemini-3-flash-preview"),
			system: systemPrompt,
			messages: await convertToModelMessages(messages),
		});
	},
};
