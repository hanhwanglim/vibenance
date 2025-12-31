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
import { bankAccount } from "./transaction";

export const investmentTransactionTypeEnum = pgEnum("transaction_type", [
	"buy",
	"sell",
	"deposit",
	"reward",
	"dividend",
	"interest",
	"fee",
	"other",
]);

export const investmentTransaction = pgTable("investment_transaction", {
	id: uuid("id").defaultRandom().primaryKey(),
	transactionId: text("transaction_id").notNull().unique(),
	timestamp: timestamp("timestamp").notNull(),
	accountId: uuid("account_id")
		.notNull()
		.references(() => bankAccount.id),
	name: text("name").notNull(),
	type: investmentTransactionTypeEnum("type").default("other"),
	asset: text("asset").notNull(),
	currency: text("currency").notNull(),
	quantity: numeric("quantity", { precision: 50, scale: 18 }).notNull(),
	price: numeric("price", { precision: 50, scale: 18 }).notNull(),
	fees: numeric("fees", { precision: 50, scale: 18 }).notNull(),
	total: numeric("total", { precision: 50, scale: 18 }).notNull(),
	reference: text("reference"),
	fileImportId: uuid("file_import_id").references(() => fileImport.id),
	metadata: json(),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const investmentTransactionRelations = relations(
	investmentTransaction,
	({ one }) => ({
		account: one(bankAccount, {
			fields: [investmentTransaction.accountId],
			references: [bankAccount.id],
		}),
	}),
);

export type InvestmentTransactionInsert =
	typeof investmentTransaction.$inferInsert;
