import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { AppRouterClient } from "@vibenance/api/routers/index";
import { db } from "@vibenance/db";
import { Bot, InlineKeyboard } from "grammy";
import { botState } from "./bot-state";

if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
	console.error("[BOT]\tBot token and chat id not set");
	process.exit();
}

console.log("Starting Telegram Worker");
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

async function getCredential(ctx) {
	return await db.query.telegramCredential.findFirst({
		where: (telegramCredential, { eq, and }) =>
			and(
				eq(telegramCredential.telegramChatId, ctx.chatId),
				eq(telegramCredential.telegramUserId, ctx.from.id),
			),
	});
}

async function getClient(ctx): Promise<AppRouterClient> {
	const credential = await getCredential(ctx);

	const link = new RPCLink({
		url: "http://localhost:3000/rpc",
		headers: {
			"x-api-key": credential?.key,
		},
		fetch(url, options) {
			return fetch(url, {
				...options,
			});
		},
	});

	return createORPCClient(link);
}

// Helper function to send error message
async function sendError(ctx, message: string) {
	await ctx.reply(`❌ Error: ${message}`);
}

// Command: /start
bot.command("start", async (ctx) => {
	const credential = getCredential(ctx);
	if (!credential) return;

	await ctx.reply(
		"👋 Welcome to the Transaction Import Bot!\n\n" +
			"I can help you import transaction data from CSV files.\n\n" +
			"📋 Available commands:\n" +
			"/start - Show this welcome message\n" +
			"/import - Start importing a transaction file\n" +
			"/accounts - List all bank accounts\n" +
			"/help - Show help information\n\n" +
			"📤 To import transactions, simply send me a CSV file or use /import",
	);
});

// Command: /help
bot.command("help", async (ctx) => {
	const credential = getCredential(ctx);
	if (!credential) return;

	await ctx.reply(
		"📖 Help - Transaction Import Bot\n\n" +
			"**How to import transactions:**\n" +
			"1. Send me a CSV file with transaction data\n" +
			`2. I'll parse the file and show you a preview\n` +
			"3. Select a bank account from the list\n" +
			"4. Confirm the import\n\n" +
			"**Supported formats:**\n" +
			"• Monzo CSV export\n" +
			"• American Express CSV export\n" +
			"• Generic CSV (Date, Name, Currency, Amount)\n\n" +
			"**Commands:**\n" +
			"/start - Welcome message\n" +
			"/import - Start import process\n" +
			"/accounts - List bank accounts\n" +
			"/help - This message",
		{ parse_mode: "Markdown" },
	);
});

// Handle file/document messages
bot.on("message:document", async (ctx) => {
	const credential = getCredential(ctx);
	if (!credential) return;

	const document = ctx.message.document;
	if (!document) return;

	// Check if it's a CSV file
	const fileName = document.file_name || "";
	if (!fileName.toLowerCase().endsWith(".csv")) {
		await sendError(ctx, "Please send a CSV file (.csv extension required).");
		return;
	}

	try {
		await ctx.reply("⏳ Processing file...");

		// Download file from Telegram
		const file = await ctx.api.getFile(document.file_id);
		const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

		// Download file content
		const response = await fetch(fileUrl);
		if (!response.ok) {
			throw new Error("Failed to download file from Telegram");
		}

		const arrayBuffer = await response.arrayBuffer();
		const blob = new Blob([arrayBuffer], { type: "text/csv" });
		const fileObj = new File([blob], fileName, { type: "text/csv" });

		const client = await getClient(ctx);

		const uploadedFile = await client.file.upload(fileObj);
		if (!uploadedFile) {
			throw new Error("Failed to upload file");
		}

		const fileImport = await client.transaction.createImport(uploadedFile.id);
		if (!fileImport) {
			throw new Error("Failed to create import record");
		}

		const preview = await client.file.preview(fileImport.id);
		if (!preview || preview.transactions.length === 0) {
			await sendError(
				ctx,
				"No valid transactions found in the file. Please check the file format.",
			);
			return;
		}

		const mappedTransactions = preview.transactions.map((tx) => ({
			transactionHash: tx.transactionHash,
			timestamp: tx.timestamp,
			name: tx.name,
			currency: tx.currency,
			amount: tx.amount,
			categoryId: tx.categoryId ?? null,
			reference: tx.reference ?? undefined,
		}));

		botState.createSession(
			ctx.chat.id,
			uploadedFile.id,
			fileImport.id,
			mappedTransactions,
		);

		// Show preview
		const formatEmoji =
			preview.format === "monzo"
				? "🏦"
				: preview.format === "amex"
					? "💳"
					: "📄";
		const previewMessage =
			"✅ File processed successfully!\n\n" +
			`${formatEmoji} Format: ${preview.format}\n` +
			`📊 Total transactions: ${preview.count}\n` +
			`✅ Valid: ${preview.valid}\n` +
			(preview.invalid > 0 ? `⚠️ Invalid: ${preview.invalid}\n` : "") +
			"\nPlease select a bank account to import these transactions:";

		// Get accounts and create inline keyboard
		const accounts = await client.bankAccount.getAll();

		if (accounts.length === 0) {
			await sendError(
				ctx,
				"No bank accounts found. Please create an account first using /accounts",
			);
			return;
		}

		const keyboard = new InlineKeyboard();
		for (const account of accounts) {
			keyboard
				.text(account.name, `import:${fileImport.id}:${account.id}`)
				.row();
		}

		await ctx.reply(previewMessage, { reply_markup: keyboard });
	} catch (error) {
		console.error("[BOT] Error processing file:", error);
		await sendError(
			ctx,
			error instanceof Error
				? error.message
				: "Failed to process file. Please try again.",
		);
	}
});

// Handle callback queries (account selection)
bot.callbackQuery(/^import:(\d+):(\d+)$/, async (ctx) => {
	const credential = getCredential(ctx);
	if (!credential) return;

	const match = ctx.match;
	if (!match || match.length < 3) return;

	const fileImportIdStr = match[1];
	const accountIdStr = match[2];
	if (!fileImportIdStr || !accountIdStr) return;

	const fileImportId = Number.parseInt(fileImportIdStr, 10);
	const accountId = Number.parseInt(accountIdStr, 10);

	// Get session
	const session = botState.getSession(ctx.chat.id);
	if (!session || session.fileImportId !== fileImportId) {
		await ctx.answerCallbackQuery({
			text: "Session expired. Please upload the file again.",
			show_alert: true,
		});
		return;
	}

	try {
		await ctx.answerCallbackQuery({ text: "Importing transactions..." });
		const client = await getClient(ctx);

		// Create transactions
		await client.transaction.create({
			transactions: session.transactions,
			accountId: accountId,
			fileImportId: fileImportId,
		});

		// Clean up session
		botState.deleteSession(ctx.chat.id);

		// Send success message
		await ctx.editMessageText(
			`✅ Successfully imported ${session.transactions.length} transactions!\n\n` +
				`Account ID: ${accountId}\n` +
				`File Import ID: ${fileImportId}`,
		);
	} catch (error) {
		console.error("[BOT] Error importing transactions:", error);
		await ctx.answerCallbackQuery({
			text: "Failed to import transactions",
			show_alert: true,
		});
		await sendError(
			ctx,
			error instanceof Error
				? error.message
				: "Failed to import transactions. Please try again.",
		);
	}
});

bot.on("message", async (ctx) => {
	const start = new Date();
	console.log(`<-- [BOT] ${start.toISOString()} ${ctx.from?.id} ${ctx.chatId}`);

	const credential = getCredential(ctx);
	if (!credential) {
		console.log(
			`[BOT] Unauthorized access from chat ID: ${ctx.from?.id} ${ctx.chatId}`,
		);
	}

	const text = ctx.message.text;
	if (text?.startsWith("/")) {
		// Commands are handled separately
		return;
	}

	await ctx.reply(
		"Please send me a CSV file to import transactions, or use /help for more information.",
	);

	const end = new Date();
	console.log(
		`--> [BOT] ${end.toISOString()} ${ctx.from?.id} ${ctx.chatId} OK ${end.getTime() - start.getTime()}ms`,
	);
});

export { bot };
