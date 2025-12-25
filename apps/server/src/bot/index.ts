import { Bot, GrammyError, HttpError } from "grammy";
import { handleDocuments, handleImport, help, start } from "./handlers";
import { logging } from "./middleware";

if (!process.env.TELEGRAM_BOT_TOKEN) {
	console.error("[BOT]\tBot token not set");
	process.exit();
}

console.log("Starting Telegram Worker");
export const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

bot.use(logging);

bot.command("start", start);
bot.command("help", help);

bot.on("message:document", handleDocuments);
bot.callbackQuery(/^import:(\d+):(\d+)$/, handleImport);

bot.catch((err) => {
	const ctx = err.ctx;
	console.error(`Error while handling update ${ctx.update.update_id}:`);
	const e = err.error;
	if (e instanceof GrammyError) {
		console.error("Error in request:", e.description);
	} else if (e instanceof HttpError) {
		console.error("Could not contact Telegram:", e);
	} else {
		console.error("Unknown error:", e);
	}
});
