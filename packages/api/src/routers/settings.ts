import { auth } from "@vibenance/auth";
import { db } from "@vibenance/db";
import { apikey } from "@vibenance/db/schema/auth";
import { telegramCredential } from "@vibenance/db/schema/telegram";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { protectedProcedure } from "../index";

export const settingsRouter = {
	createTelegramCredential: protectedProcedure
		.input(z.object({ telegramUserId: z.string(), telegramChatId: z.string() }))
		.handler(async ({ input, context }) => {
			const key = await auth.api.createApiKey({
				body: {
					name: "telegram-bot-api-key",
					expiresIn: 60 * 60 * 24 * 7,
					userId: context.session.user.id,
					rateLimitEnabled: false,
				},
			});

			const credential = await db
				.insert(telegramCredential)
				// Yes setting the key in the credential is fucking stupid.
				// But its server to server rpc communication so it should be ok
				.values({ ...input, key: key.key, userId: context.session.user.id })
				.returning();

			return { credential };
		}),

	list: protectedProcedure.handler(async ({ context }) => {
		return (
			(await db.query.telegramCredential.findFirst({
				where: (telegramCredential, { eq }) =>
					eq(telegramCredential.userId, context.session.user.id),
			})) || null
		);
	}),

	delete: protectedProcedure
		.input(z.number())
		.handler(async ({ input, context }) => {
			await db
				.delete(telegramCredential)
				.where(eq(telegramCredential.id, input));
			await db
				.delete(apikey)
				.where(
					and(
						eq(apikey.userId, context.session.user.id),
						eq(apikey.name, "telegram-bot-api-key"),
					),
				);
		}),
};
