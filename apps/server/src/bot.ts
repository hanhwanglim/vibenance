import { Bot } from "grammy";

if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
	console.error("[BOT]\tBot token and chat id not set");
	process.exit();
}

console.log("Starting Telegram Worker");
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

bot.on("message", async (ctx) => {
	const start = new Date();
	console.log(`<-- [BOT] ${start.toISOString()}${ctx.from.first_name}`);

	if (ctx.message.chat.id.toString() !== process.env.TELEGRAM_CHAT_ID) return;

	const end = new Date();
	console.log(
		`--> [BOT] ${end.toISOString()} ${ctx.from.first_name} OK ${end.getTime() - start.getTime()}ms`,
	);
});

export { bot };
