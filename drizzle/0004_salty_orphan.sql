CREATE TABLE IF NOT EXISTS "connected_banks" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"access_token" text NOT NULL
);
--> statement-breakpoint

ALTER TABLE "transactions" ALTER COLUMN "category_id" DROP NOT NULL;