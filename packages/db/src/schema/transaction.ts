import { relations } from "drizzle-orm";
import {
	json,
	numeric,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { fileImport } from "./file";

export const accountTypeEnum = pgEnum("account_type", [
	"savings",
	"current",
	"checking",
	"credit_card",
	"investment",
	"loan",
	"other",
]);

export const bankAccount = pgTable("bank_account", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull().unique(),
	type: accountTypeEnum("type").notNull().default("other"),
	accountNumber: text("account_number"),
	bankName: text("bank_name"),
	color: text("color"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

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

export const transactionRelations = relations(transaction, ({ one }) => ({
	account: one(bankAccount, {
		fields: [transaction.accountId],
		references: [bankAccount.id],
	}),
	category: one(category, {
		fields: [transaction.categoryId],
		references: [category.id],
	}),
}));

export const categoryRelations = relations(category, ({ many }) => ({
	transactions: many(transaction),
}));

export type BankAccountInsert = typeof bankAccount.$inferInsert;
export type BankAccountSelect = typeof bankAccount.$inferSelect;

export type TransactionInsert = typeof transaction.$inferInsert;
export type TransactionSelect = typeof transaction.$inferSelect;
