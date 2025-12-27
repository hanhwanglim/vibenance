import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const telegramCredential = pgTable("telegram_credential", {
	id: uuid("id").defaultRandom().primaryKey(),
	telegramUserId: text("telegram_user_id").notNull(),
	telegramChatId: text("telegram_chat_id").notNull(),
	userId: uuid("user_id")
		.notNull()
		.references(() => user.id),
	key: text("key").notNull(),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const telegramCredentialRelations = relations(
	telegramCredential,
	({ one }) => ({
		user: one(user, {
			fields: [telegramCredential.userId],
			references: [user.id],
		}),
	}),
);
