import { db } from "@vibenance/db";
import type { Context, NextFunction } from "grammy";

export async function logging(ctx: Context, next: NextFunction) {
	let status = "OK";
	const start = new Date();

	try {
		console.log(
			`<-- [BOT] ${start.toISOString()} ${ctx.from?.id} ${ctx.chatId}`,
		);

		await next();
	} catch (err) {
		status = "ERR";
		throw err;
	} finally {
		const end = new Date();
		console.log(
			`--> [BOT] ${end.toISOString()} ${ctx.from?.id} ${ctx.chatId} ${status} ${end.getTime() - start.getTime()}ms`,
		);
	}
}

export async function authenticate(ctx: Context, next: NextFunction) {
	const credential = await db.query.telegramCredential.findFirst({
		with: {
			user: true,
		},
		where: {
			AND: [
				{ telegramChatId: { eq: (ctx.chatId || -1).toString() } },
				{ telegramUserId: { eq: (ctx.from?.id || -1).toString() } },
			],
		},
	});

	if (credential) {
		return await next();
	}

	console.warn(
		`[BOT] unrecognized user [${ctx.from?.id}] chat id ${ctx.chatId}`,
	);

	if (ctx.hasCommand("start")) {
		return await next();
	}
}
