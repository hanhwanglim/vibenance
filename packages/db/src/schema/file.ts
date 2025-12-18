import { relations } from "drizzle-orm";
import {
	integer,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { investmentTransaction } from "./asset";
import { transaction } from "./transaction";

export const fileSourceEnum = pgEnum("file_source", [
	"upload",
	"telegram",
	"other",
]);

export const importStatusEnum = pgEnum("import_status", [
	"success",
	"pending",
	"failed",
]);

export const file = pgTable("file", {
	id: serial("id").primaryKey(),
	fileName: text("file_name").notNull(),
	filePath: text("file_path").notNull(),
	fileHash: text("file_hash").notNull(),
	fileSize: integer("file_size").notNull(),
	source: fileSourceEnum("source").notNull().default("other"),
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

export const fileRelations = relations(file, ({ one }) => ({
	fileImport: one(fileImport, {
		fields: [file.fileImportId],
		references: [fileImport.id],
	}),
}));

export const fileImportRelations = relations(fileImport, ({ many }) => ({
	transactions: many(transaction),
	investmentTransactions: many(investmentTransaction),
	files: many(file),
}));
