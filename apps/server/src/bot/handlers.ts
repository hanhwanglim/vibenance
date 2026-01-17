import { BankAccountService } from "@vibenance/api/services/bank-account";
import { BankTransactionService } from "@vibenance/api/services/bank-transaction";
import { FileService } from "@vibenance/api/services/file";
import { type CommandContext, type Context, InlineKeyboard } from "grammy";
import { botState } from "./state";
import { sendError } from "./utils";

export async function start(ctx: CommandContext<Context>) {
	await ctx.reply(`Hi!\nChat ID: ${ctx.chatId}\nUser ID: ${ctx.from?.id}`);
}

export async function help(ctx: CommandContext<Context>) {
	await ctx.reply("Help");
}

export async function handleDocuments(ctx: Context) {
	const document = ctx.message?.document;
	if (!document) return;
	if (!ctx.chatId) return;

	ctx.react("👀");

	try {
		const file = await ctx.api.getFile(document.file_id);
		const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

		const response = await fetch(fileUrl);
		if (!response.ok) {
			throw new Error("Failed to download file from Telegram");
		}

		const arrayBuffer = await response.arrayBuffer();
		const blob = new Blob([arrayBuffer], { type: "text/csv" });
		const fileObj = new File([blob], document.file_name || "");

		const uploadedFile = await FileService.uploadFile(fileObj);
		const fileImport = await BankTransactionService.createImport(
			uploadedFile.id,
		);
		if (!fileImport) {
			throw new Error("Failed to import file");
		}

		const preview = await BankTransactionService.previewImport(fileImport.id);
		if (!preview) {
			throw new Error("No valid transactions found");
		}

		const accounts = await BankAccountService.listAccounts();
		if (accounts.length === 0) {
			throw new Error("No bank accounts found. Please create account first.");
		}

		const transactionData = preview.new.map((transaction) => {
			const timestamp = new Date(
				transaction.date.getFullYear(),
				transaction.date.getMonth(),
				transaction.date.getDate(),
				transaction.time?.getHours() || 0,
				transaction.time?.getMinutes() || 0,
				transaction.time?.getSeconds() || 0,
				transaction.time?.getMilliseconds() || 0,
			);

			return {
				...transaction,
				timestamp: timestamp,
			};
		});

		botState.createSession(
			ctx.chatId,
			uploadedFile.id,
			fileImport.id,
			transactionData,
			accounts.map((account) => ({ id: account.id, name: account.name })),
		);

		const previewMessage =
			"File processed successfully!\n\n" +
			`Total transactions: ${preview.new.length}\n\n` +
			"Please select a bank account to import these transactions:";

		const keyboard = new InlineKeyboard();
		for (let i = 0; i < accounts.length; i++) {
			const account = accounts[i];
			if (!account) continue;
			keyboard.text(account.name, `import:${i}`).row();
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
}

export async function handleImport(ctx: Context) {
	const match = ctx.match;
	if (!match || match.length < 2) return;

	if (!ctx.chatId) return;

	const accountIndex = Number.parseInt(match[1] || "", 10);
	if (Number.isNaN(accountIndex)) return;

	const session = botState.getSession(ctx.chatId);
	if (!session) {
		await ctx.answerCallbackQuery({
			text: "Session expired. Please upload the file again.",
			show_alert: true,
		});
		return;
	}

	if (accountIndex < 0 || accountIndex >= session.accounts.length) {
		await ctx.answerCallbackQuery({
			text: "Invalid account selection.",
			show_alert: true,
		});
		return;
	}

	const selectedAccount = session.accounts[accountIndex];
	if (!selectedAccount) {
		await ctx.answerCallbackQuery({
			text: "Invalid account selection.",
			show_alert: true,
		});
		return;
	}

	const accountId = selectedAccount.id;

	try {
		await ctx.answerCallbackQuery({ text: "Importing transactions..." });
		await BankTransactionService.bulkCreate(
			session.transactions,
			accountId,
			session.fileImportId,
		);

		botState.deleteSession(ctx.chatId);

		ctx.react("👍");
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
}
