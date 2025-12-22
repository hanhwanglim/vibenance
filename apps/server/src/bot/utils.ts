import type { Context } from "grammy";

export async function sendError(ctx: Context, message: string) {
	await ctx.reply(`Error: ${message}`);
}
