import { Bot } from "grammy";
import { pipeline } from "node:stream/promises";
import fs from "node:fs";

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);

console.log("Starting Telegram Worker");

bot.on("message", async (ctx) => {
  if (ctx.message.chat.id.toString() != process.env.TELEGRAM_CHAT_ID!) return;

  console.log(`[BOT]\t${new Date().toISOString()}\t${ctx.from.first_name}`);

  let file;
  try {
    file = await ctx.getFile();
  } catch (error) {
    console.log("No file", error);
    return;
  }

  if (file) {
    ctx.react("👀");
    const response = await fetch(
      `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`,
    );

    if (response.ok) {
      await pipeline(
        response.body,
        fs.createWriteStream(`/tmp/${file.file_id}`),
      );
      console.log("File saved");
    }

    ctx.react("🙈");

    // Process file

    ctx.react("👍");
  }
});

bot.start();
