CREATE TABLE IF NOT EXISTS "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"subscription_id" text NOT NULL,
	"status" text NOT NULL,
	CONSTRAINT "subscriptions_userId_unique" UNIQUE("userId"),
	CONSTRAINT "subscriptions_subscription_id_unique" UNIQUE("subscription_id")
);
