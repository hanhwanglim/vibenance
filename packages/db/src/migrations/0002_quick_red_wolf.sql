ALTER TYPE "public"."transaction_type" ADD VALUE 'dividend' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."transaction_type" ADD VALUE 'interest' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."transaction_type" ADD VALUE 'fee' BEFORE 'other';