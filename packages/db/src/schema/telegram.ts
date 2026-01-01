import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const telegramCredential = pgTable("telegram_credential", {
	id: uuid("id").defaultRandom().primaryKey(),
	telegramUserId: text("telegram_user_id").notNull(),
	telegramChatId: text("telegram_chat_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export type TelegramCredentialInsert = typeof telegramCredential.$inferInsert;
