import { Bot } from "grammy";
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
