import {
  pgTable,
  text,
  timestamp,
  numeric,
  AnyPgColumn,
  pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

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
  id: text("id").primaryKey(),
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
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const transaction = pgTable("transaction", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  transactionHash: text("transaction_hash").notNull().unique(),
  accountId: text("account_id")
    .notNull()
    .references(() => bankAccount.id),
  timestamp: timestamp("timestamp").notNull(),
  name: text("name").notNull(),
  currency: text("currency").notNull(),
  amount: numeric("amount", { precision: 50, scale: 18 }).notNull(),
  categoryId: text("category_id")
    .notNull()
    .references(() => category.id),
  reference: text("reference"),
  notes: text("notes"),
  parentTransactionId: text("parent_transaction_id").references(
    (): AnyPgColumn => transaction.id,
    { onDelete: "set null" },
  ),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export type TransactionInsert = typeof transaction.$inferInsert;
export type BankAccountInsert = typeof bankAccount.$inferInsert;
export type CategoryInsert = typeof category.$inferInsert;
