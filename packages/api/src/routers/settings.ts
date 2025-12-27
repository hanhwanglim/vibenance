import { db } from "@vibenance/db";
import { telegramCredential } from "@vibenance/db/schema/telegram";
import { eq } from "drizzle-orm";
import z from "zod";
import { protectedProcedure } from "../index";

export const settingsRouter = {
	createTelegramCredential: protectedProcedure
		.input(z.object({ telegramUserId: z.string(), telegramChatId: z.string() }))
		.handler(async ({ input, context }) => {
			const credential = await db
				.insert(telegramCredential)
				.values({ ...input, userId: context.session.user.id })
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

	delete: protectedProcedure.input(z.number()).handler(async ({ input }) => {
		await db.delete(telegramCredential).where(eq(telegramCredential.id, input));
	}),
};
