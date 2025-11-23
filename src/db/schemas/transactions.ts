import {
  pgTable,
  text,
  timestamp,
  numeric,
  foreignKey,
  AnyPgColumn,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const transaction = pgTable("transaction", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  transactionHash: text("transaction_hash").notNull().unique(),
  account: text("account").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  name: text("name").notNull(),
  currency: text("currency").notNull(),
  amount: numeric("amount", { precision: 50, scale: 18 }).notNull(),
  category: text("category").notNull(),
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
