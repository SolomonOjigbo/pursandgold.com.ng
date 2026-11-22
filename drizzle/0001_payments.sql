-- Purs Pay: central payments service tables. Safe to re-run.
-- One deployment serves both Paystack test and live traffic; every row records which mode it belongs to.

CREATE TABLE IF NOT EXISTS "pay_transactions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "reference" varchar(100) NOT NULL,
  "product" varchar(40) NOT NULL,
  "mode" varchar(8) NOT NULL DEFAULT 'test',
  "tenant_id" varchar(120) NOT NULL,
  "email" varchar(254) NOT NULL,
  "currency" varchar(3) NOT NULL DEFAULT 'NGN',
  "expected_amount_kobo" bigint,
  "paid_amount_kobo" bigint,
  "plan_code" varchar(60),
  "status" varchar(20) NOT NULL DEFAULT 'pending',
  "idempotency_key" varchar(120),
  "authorization_url" text,
  "access_code" varchar(60),
  "callback_url" text,
  "paystack_id" varchar(40),
  "customer_code" varchar(60),
  "gateway_response" text,
  "channel" varchar(30),
  "metadata" jsonb,
  "paid_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "pay_transactions_reference_key" ON "pay_transactions" ("reference");
CREATE INDEX IF NOT EXISTS "pay_transactions_tenant_idx" ON "pay_transactions" ("product", "tenant_id");

CREATE TABLE IF NOT EXISTS "pay_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_key" varchar(64) NOT NULL,
  "type" varchar(60) NOT NULL,
  "mode" varchar(8) NOT NULL DEFAULT 'test',
  "product" varchar(40),
  "reference" varchar(100),
  "payload" jsonb NOT NULL,
  "outcome" varchar(20) NOT NULL DEFAULT 'received',
  "note" text,
  "received_at" timestamptz NOT NULL DEFAULT now(),
  "processed_at" timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS "pay_events_event_key_key" ON "pay_events" ("event_key");

CREATE TABLE IF NOT EXISTS "pay_deliveries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_id" uuid NOT NULL,
  "product" varchar(40) NOT NULL,
  "mode" varchar(8) NOT NULL DEFAULT 'test',
  "type" varchar(60) NOT NULL,
  "body" jsonb NOT NULL,
  "status" varchar(12) NOT NULL DEFAULT 'pending',
  "attempts" integer NOT NULL DEFAULT 0,
  "next_attempt_at" timestamptz NOT NULL DEFAULT now(),
  "last_error" text,
  "delivered_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "pay_deliveries_event_key" ON "pay_deliveries" ("event_id");
CREATE INDEX IF NOT EXISTS "pay_deliveries_due_idx" ON "pay_deliveries" ("status", "next_attempt_at");

CREATE TABLE IF NOT EXISTS "pay_subscriptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "subscription_code" varchar(60),
  "customer_code" varchar(60) NOT NULL,
  "plan_code" varchar(60) NOT NULL,
  "mode" varchar(8) NOT NULL DEFAULT 'test',
  "product" varchar(40) NOT NULL,
  "tenant_id" varchar(120) NOT NULL,
  "status" varchar(20) NOT NULL DEFAULT 'active',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "pay_subscriptions_code_idx" ON "pay_subscriptions" ("subscription_code");

-- Older copies of this file did not have `mode`. Adding it is a no-op on a fresh database.
ALTER TABLE "pay_transactions" ADD COLUMN IF NOT EXISTS "mode" varchar(8) NOT NULL DEFAULT 'test';
ALTER TABLE "pay_events" ADD COLUMN IF NOT EXISTS "mode" varchar(8) NOT NULL DEFAULT 'test';
ALTER TABLE "pay_deliveries" ADD COLUMN IF NOT EXISTS "mode" varchar(8) NOT NULL DEFAULT 'test';
ALTER TABLE "pay_subscriptions" ADD COLUMN IF NOT EXISTS "mode" varchar(8) NOT NULL DEFAULT 'test';

-- Idempotency and subscription lookups are scoped by mode, so test and live rows can share these tables.
DROP INDEX IF EXISTS "pay_transactions_idem_key";
CREATE UNIQUE INDEX IF NOT EXISTS "pay_transactions_idem_key" ON "pay_transactions" ("product", "mode", "idempotency_key");
DROP INDEX IF EXISTS "pay_subscriptions_customer_plan_key";
CREATE UNIQUE INDEX IF NOT EXISTS "pay_subscriptions_customer_plan_key" ON "pay_subscriptions" ("mode", "customer_code", "plan_code");
