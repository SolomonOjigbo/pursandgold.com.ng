-- Purs Pay: on-demand Paystack plans for monthly recurring charges. Safe to re-run.
-- A product sends `recurring: { planKey, seats }` to /api/pay/transactions/initialize and Purs Pay
-- creates the fixed-amount Paystack plan on first use. Seats and amount are part of the identity.

CREATE TABLE IF NOT EXISTS "pay_plans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "product" varchar(40) NOT NULL,
  "mode" varchar(8) NOT NULL DEFAULT 'test',
  "plan_key" varchar(80) NOT NULL,
  "seats" integer NOT NULL,
  "currency" varchar(3) NOT NULL DEFAULT 'NGN',
  "amount_kobo" bigint NOT NULL,
  "plan_code" varchar(60) NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "pay_plans_key"
  ON "pay_plans" ("mode", "product", "plan_key", "seats", "currency", "amount_kobo");
