import { relations } from "drizzle-orm";
import {
	integer,
	numeric,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { file } from "./file";

export const accountTypeEnum = pgEnum("account_type", [
	"savings",
	"current",
	"checking",
	"credit_card",
	"investment",
	"loan",
	"other",
]);

export const importStatusEnum = pgEnum("import_status", [
	"success",
	"pending",
	"failed",
]);

export const bankAccount = pgTable("bank_account", {
	id: serial("id").primaryKey(),
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
	id: serial("id").primaryKey(),
	name: text("name").notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const transaction = pgTable("transaction", {
	id: serial("id").primaryKey(),
	transactionHash: text("transaction_hash").notNull().unique(),
	timestamp: timestamp("timestamp").notNull(),
	accountId: integer("account_id")
		.notNull()
		.references(() => bankAccount.id),
	name: text("name").notNull(),
	currency: text("currency").notNull(),
	amount: numeric("amount", { precision: 50, scale: 18 }).notNull(),
	categoryId: integer("category_id").references(() => category.id),
	reference: text("reference"),
	fileImportId: integer("file_import_id").references(() => fileImport.id),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const fileImport = pgTable("file_import", {
	id: serial("id").primaryKey(),
	status: importStatusEnum("status").notNull().default("pending"),

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

export const fileImportRelations = relations(fileImport, ({ many }) => ({
	transactions: many(transaction),
	files: many(file),
}));

export type TransactionInsert = typeof transaction.$inferInsert;
export type TransactionSelect = typeof transaction.$inferSelect;
