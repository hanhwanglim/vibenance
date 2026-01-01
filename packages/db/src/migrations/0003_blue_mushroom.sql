CREATE TYPE "public"."import_type" AS ENUM('transactions', 'assets');--> statement-breakpoint
ALTER TABLE "file_import" ADD COLUMN "type" "import_type";
