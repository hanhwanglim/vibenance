import { google } from "@ai-sdk/google";
import { db } from "@vibenance/db";
import { investmentTransaction } from "@vibenance/db/schema/asset";
import {
	bankAccount,
	category,
	transaction,
} from "@vibenance/db/schema/transaction";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { asc, desc, eq, gt, lt, sum } from "drizzle-orm";

async function getFinancialSummary() {
	// Get transaction summary
	const totalIncome = await db
		.select({ income: sum(transaction.amount) })
		.from(transaction)
		.where(gt(transaction.amount, 0));

	const totalExpenses = await db
		.select({ expenses: sum(transaction.amount) })
		.from(transaction)
		.where(lt(transaction.amount, 0));

	const netAmount = await db
		.select({ net: sum(transaction.amount) })
		.from(transaction);

	// Get bank accounts
	const accounts = await db.query.bankAccount.findMany({
		orderBy: [asc(bankAccount.name)],
	});

	// Get recent transactions
	const recentTransactions = await db.query.transaction.findMany({
		orderBy: [desc(transaction.timestamp)],
		limit: 10,
		with: {
			account: true,
			category: true,
		},
	});

	// Get category breakdown
	const categoryBreakdown = await db
		.select({
			name: category.name,
			sum: sum(transaction.amount),
		})
		.from(transaction)
		.leftJoin(category, eq(transaction.categoryId, category.id))
		.where(lt(transaction.amount, 0))
		.groupBy(category.name);

	// Get asset transactions (if any)
	const assetTransactions = await db.query.investmentTransaction.findMany({
		orderBy: [desc(investmentTransaction.timestamp)],
		limit: 10,
		with: {
			account: true,
		},
	});

	return {
		summary: {
			totalIncome: totalIncome[0]?.income || "0",
			totalExpenses: totalExpenses[0]?.expenses || "0",
			netAmount: netAmount[0]?.net || "0",
		},
		accounts: accounts.map((acc) => ({
			id: acc.id,
			name: acc.name,
			type: acc.type,
			bankName: acc.bankName,
		})),
		recentTransactions: recentTransactions.map((tx) => ({
			id: tx.id,
			timestamp: tx.timestamp,
			name: tx.name,
			amount: tx.amount,
			currency: tx.currency,
			account: tx.account?.name,
			category: tx.category?.name,
		})),
		categoryBreakdown: categoryBreakdown.map((cat) => ({
			name: cat.name || "Uncategorized",
			sum: cat.sum || "0",
		})),
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
	stream: async (messages: UIMessage[]) => {
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

Category Breakdown:
${financialData.categoryBreakdown.map((cat) => `- ${cat.name}: ${cat.sum}`).join("\n")}

${financialData.assetTransactions.length > 0 ? `\nAsset Transactions:\n${financialData.assetTransactions.map((tx) => `- ${tx.name}: ${tx.type} - ${tx.quantity} ${tx.asset} @ ${tx.price} = ${tx.total}`).join("\n")}` : ""}

Answer questions about the user's financial situation in a helpful, clear, and concise manner. Be specific with numbers and dates when available.`;

		return streamText({
			model: google("gemini-3-flash-preview"),
			system: systemPrompt,
			messages: await convertToModelMessages(messages),
		});
	},
};
