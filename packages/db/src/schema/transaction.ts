import {
	json,
	numeric,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import z from "zod";
import { bankAccount } from "./account";
import { fileImport } from "./file";

export const transactionTypeEnum = pgEnum("transaction_type", [
	"income",
	"expense",
	"transfer",
	"interest",
]);

export const transactionTypeEnumSchema = z.enum(transactionTypeEnum.enumValues);
export type TransactionType = z.infer<typeof transactionTypeEnumSchema>;

export const category = pgTable("category", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const transaction = pgTable("transaction", {
	id: uuid("id").defaultRandom().primaryKey(),
	transactionId: text("transaction_id").notNull().unique(),
	timestamp: timestamp("timestamp").notNull(),
	accountId: uuid("account_id")
		.notNull()
		.references(() => bankAccount.id),
	name: text("name").notNull(),
	type: transactionTypeEnum("type").notNull(),
	currency: text("currency").notNull(),
	amount: numeric("amount", { precision: 50, scale: 18 }).notNull(),
	categoryId: uuid("category_id").references(() => category.id),
	reference: text("reference"),
	fileImportId: uuid("file_import_id").references(() => fileImport.id),
	metadata: json(),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export type TransactionInsert = typeof transaction.$inferInsert;
export type TransactionSelect = typeof transaction.$inferSelect;

export type CategorySelect = typeof category.$inferSelect;
