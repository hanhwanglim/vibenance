import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { AppRouterClient } from "@vibenance/api/routers/index";
import { db } from "@vibenance/db";
import { Bot } from "grammy";

if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
	console.error("[BOT]\tBot token and chat id not set");
	process.exit();
}

console.log("Starting Telegram Worker");
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

async function createClient(ctx): Promise<AppRouterClient> {
	const credential = await db.query.telegramCredential.findFirst({
		where: (telegramCredential, { eq, and }) =>
			and(
				eq(telegramCredential.telegramChatId, ctx.chatId),
				eq(telegramCredential.telegramUserId, ctx.from.id),
			),
	});

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

bot.on("message", async (ctx) => {
	const start = new Date();
	console.log(`<-- [BOT] ${start.toISOString()} ${ctx.from?.id} ${ctx.chatId}`);

	const client = await createClient(ctx);

	try {
		console.log(await client.privateData());
	} catch (_error) {}

	const end = new Date();
	console.log(
		`--> [BOT] ${end.toISOString()} ${ctx.from?.id} ${ctx.chatId} OK ${end.getTime() - start.getTime()}ms`,
	);
});

export { bot };
