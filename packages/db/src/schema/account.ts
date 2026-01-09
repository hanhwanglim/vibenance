import {
	numeric,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod";

export const accountTypeEnum = pgEnum("account_type", [
	"savings",
	"current",
	"checking",
	"credit_card",
	"investment",
	"loan",
	"other",
]);

export const accountTypeEnumSchema = z.enum(accountTypeEnum.enumValues);
export type AccountType = z.infer<typeof accountTypeEnumSchema>;

export const bankAccount = pgTable("bank_account", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull().unique(),
	type: accountTypeEnum("type").notNull().default("other"),
	accountNumber: text("account_number"),
	bankName: text("bank_name"),
	color: text("color"),
	currency: text("currency"),
	balance: numeric("balance", { precision: 50, scale: 18 }),
	latestTransactionTimestamp: timestamp("latest_transaction_timestamp"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export type BankAccountInsert = typeof bankAccount.$inferInsert;
export type BankAccountSelect = typeof bankAccount.$inferSelect;
