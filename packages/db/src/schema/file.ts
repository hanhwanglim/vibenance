import { relations } from "drizzle-orm";
import {
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
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
	id: uuid("id").defaultRandom().primaryKey(),
	fileName: text("file_name").notNull(),
	filePath: text("file_path").notNull(),
	fileHash: text("file_hash").notNull(),
	fileSize: integer("file_size").notNull(),
	source: fileSourceEnum("source").notNull().default("other"),
	fileImportId: uuid("file_import_id").references(() => fileImport.id),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const fileImport = pgTable("file_import", {
	id: uuid("id").defaultRandom().primaryKey(),
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

export type FileInsert = typeof file.$inferInsert;
export type FileUpdate = Partial<Omit<FileInsert, "id" | "createdAt">>;

export type FileImportUpdate = Partial<typeof fileImport.$inferInsert>;
