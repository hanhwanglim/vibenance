import { db } from "@vibenance/db";
import {
	type TelegramCredentialInsert,
	telegramCredential,
} from "@vibenance/db/schema/telegram";
import { eq } from "drizzle-orm";

export const TelegramCredentialRepository = {
	findByUserId: async (userId: string) => {
		return (
			(await db.query.telegramCredential.findFirst({
				where: (telegramCredential, { eq }) =>
					eq(telegramCredential.userId, userId),
			})) || null
		);
	},

	create: async (data: TelegramCredentialInsert) => {
		const [credential] = await db
			.insert(telegramCredential)
			.values(data)
			.returning();
		return credential || null;
	},

	delete: async (id: string) => {
		// @ts-expect-error - drizzle-orm version mismatch between packages
		await db.delete(telegramCredential).where(eq(telegramCredential.id, id));
	},
};
