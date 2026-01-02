CREATE TYPE "transaction_type" AS ENUM('buy', 'sell', 'deposit', 'reward', 'dividend', 'interest', 'fee', 'other');--> statement-breakpoint
CREATE TYPE "file_source" AS ENUM('upload', 'telegram', 'other');--> statement-breakpoint
CREATE TYPE "import_status" AS ENUM('success', 'pending', 'failed');--> statement-breakpoint
CREATE TYPE "import_type" AS ENUM('transactions', 'assets');--> statement-breakpoint
CREATE TYPE "account_type" AS ENUM('savings', 'current', 'checking', 'credit_card', 'investment', 'loan', 'other');--> statement-breakpoint
CREATE TABLE "investment_transaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"transaction_id" text NOT NULL UNIQUE,
	"timestamp" timestamp NOT NULL,
	"account_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" "transaction_type" DEFAULT 'other'::"transaction_type",
	"asset" text NOT NULL,
	"currency" text NOT NULL,
	"quantity" numeric(50,18) NOT NULL,
	"price" numeric(50,18) NOT NULL,
	"fees" numeric(50,18) NOT NULL,
	"total" numeric(50,18) NOT NULL,
	"reference" text,
	"file_import_id" uuid,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "file" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"file_hash" text NOT NULL,
	"file_size" integer NOT NULL,
	"source" "file_source" DEFAULT 'other'::"file_source" NOT NULL,
	"file_import_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "file_import" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"type" "import_type",
	"status" "import_status" DEFAULT 'pending'::"import_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "telegram_credential" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"telegram_user_id" text NOT NULL,
	"telegram_chat_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bank_account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL UNIQUE,
	"type" "account_type" DEFAULT 'other'::"account_type" NOT NULL,
	"account_number" text,
	"bank_name" text,
	"color" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"transaction_id" text NOT NULL UNIQUE,
	"timestamp" timestamp NOT NULL,
	"account_id" uuid NOT NULL,
	"name" text NOT NULL,
	"currency" text NOT NULL,
	"amount" numeric(50,18) NOT NULL,
	"category_id" uuid,
	"reference" text,
	"file_import_id" uuid,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
ALTER TABLE "investment_transaction" ADD CONSTRAINT "investment_transaction_account_id_bank_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "bank_account"("id");--> statement-breakpoint
ALTER TABLE "investment_transaction" ADD CONSTRAINT "investment_transaction_file_import_id_file_import_id_fkey" FOREIGN KEY ("file_import_id") REFERENCES "file_import"("id");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_file_import_id_file_import_id_fkey" FOREIGN KEY ("file_import_id") REFERENCES "file_import"("id");--> statement-breakpoint
ALTER TABLE "telegram_credential" ADD CONSTRAINT "telegram_credential_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_account_id_bank_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "bank_account"("id");--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_category_id_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id");--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_file_import_id_file_import_id_fkey" FOREIGN KEY ("file_import_id") REFERENCES "file_import"("id");