import {
	integer,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const fileSourceEnum = pgEnum("file_source", [
	"upload",
	"telegram",
	"other",
]);

export const file = pgTable("file", {
	id: serial("id").primaryKey(),
	fileName: text("file_name").notNull(),
	filePath: text("file_path").notNull(),
	fileHash: text("file_hash").notNull(),
	fileSize: integer("file_size").notNull(),
	source: fileSourceEnum("source").notNull().default("other"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});
