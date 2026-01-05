import {
	numeric,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { category } from "./transaction";

export const periodEnum = pgEnum("period", ["weekly", "monthly", "yearly"]);

export const budget = pgTable("budget", {
	id: uuid("id").defaultRandom().primaryKey(),
	categoryId: uuid("category_id")
		.references(() => category.id)
		.notNull(),
	currency: text("currency").notNull(),
	amount: numeric("amount", { precision: 50, scale: 18 }).notNull(),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export type BudgetInsert = typeof budget.$inferInsert;
export type BudgetSelect = typeof budget.$inferSelect;
