import {
	numeric,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

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
	transactionHash: text("transaction_hash").notNull().unique(),
	timestamp: timestamp("timestamp").notNull(),
	accountId: text("account_id")
		.notNull()
		.references(() => bankAccount.id),
	name: text("name").notNull(),
	currency: text("currency").notNull(),
	amount: numeric("amount", { precision: 50, scale: 18 }).notNull(),
	categoryId: text("category_id")
		.notNull()
		.references(() => category.id),
	reference: text("reference"),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});
