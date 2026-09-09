CREATE TABLE IF NOT EXISTS "leads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(160) NOT NULL,
  "email" varchar(254) NOT NULL,
  "phone" varchar(40),
  "company" varchar(200),
  "interest" varchar(120),
  "message" text,
  "source" varchar(80) NOT NULL DEFAULT 'contact',
  "locale" varchar(8) NOT NULL DEFAULT 'en',
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "discovery_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company" varchar(200) NOT NULL,
  "contact_name" varchar(160) NOT NULL,
  "email" varchar(254) NOT NULL,
  "phone" varchar(40),
  "answers" jsonb NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
