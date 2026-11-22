import { pgTable, text, timestamp, jsonb, uuid, varchar, bigint, integer, uniqueIndex, index } from "drizzle-orm/pg-core";

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 254 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  company: varchar("company", { length: 200 }),
  interest: varchar("interest", { length: 120 }),
  message: text("message"),
  source: varchar("source", { length: 80 }).notNull().default("contact"),
  locale: varchar("locale", { length: 8 }).notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const discoveryRequests = pgTable("discovery_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  company: varchar("company", { length: 200 }).notNull(),
  contactName: varchar("contact_name", { length: 160 }).notNull(),
  email: varchar("email", { length: 254 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  answers: jsonb("answers").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Purs Pay (central payments service) ─────────────────────────────────────

/** One row per Paystack transaction, initialised on behalf of a Purs & Gold product. */
export const payTransactions = pgTable(
  "pay_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reference: varchar("reference", { length: 100 }).notNull(),
    product: varchar("product", { length: 40 }).notNull(),
    /** Paystack mode this checkout belongs to: test | live. One deployment serves both. */
    mode: varchar("mode", { length: 8 }).notNull().default("test"),
    tenantId: varchar("tenant_id", { length: 120 }).notNull(),
    email: varchar("email", { length: 254 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("NGN"),
    /** Amount the product asked for, in kobo. Null for plan-priced transactions (Paystack uses the plan's amount). */
    expectedAmountKobo: bigint("expected_amount_kobo", { mode: "number" }),
    paidAmountKobo: bigint("paid_amount_kobo", { mode: "number" }),
    planCode: varchar("plan_code", { length: 60 }),
    /** pending | success | failed | abandoned | mismatch */
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    idempotencyKey: varchar("idempotency_key", { length: 120 }),
    authorizationUrl: text("authorization_url"),
    accessCode: varchar("access_code", { length: 60 }),
    callbackUrl: text("callback_url"),
    paystackId: varchar("paystack_id", { length: 40 }),
    customerCode: varchar("customer_code", { length: 60 }),
    gatewayResponse: text("gateway_response"),
    channel: varchar("channel", { length: 30 }),
    metadata: jsonb("metadata"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("pay_transactions_reference_key").on(t.reference),
    uniqueIndex("pay_transactions_idem_key").on(t.product, t.mode, t.idempotencyKey),
    index("pay_transactions_tenant_idx").on(t.product, t.tenantId),
  ],
);

/** Every verified Paystack webhook, deduplicated on a hash of the raw body (Paystack retries send identical bodies). */
export const payEvents = pgTable(
  "pay_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventKey: varchar("event_key", { length: 64 }).notNull(),
    type: varchar("type", { length: 60 }).notNull(),
    /** Which secret verified it: test | live. */
    mode: varchar("mode", { length: 8 }).notNull().default("test"),
    product: varchar("product", { length: 40 }),
    reference: varchar("reference", { length: 100 }),
    payload: jsonb("payload").notNull(),
    /** received | routed | ignored | unrouted | rejected */
    outcome: varchar("outcome", { length: 20 }).notNull().default("received"),
    note: text("note"),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("pay_events_event_key_key").on(t.eventKey)],
);

/** Outbound, signed deliveries of normalised events to each product. Retried by /api/pay/jobs/retry. */
export const payDeliveries = pgTable(
  "pay_deliveries",
  {
    /** Same id the product sees in the `x-purs-event-id` header. Use it to deduplicate. */
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id").notNull(),
    product: varchar("product", { length: 40 }).notNull(),
    mode: varchar("mode", { length: 8 }).notNull().default("test"),
    type: varchar("type", { length: 60 }).notNull(),
    body: jsonb("body").notNull(),
    /** pending | delivered | dead */
    status: varchar("status", { length: 12 }).notNull().default("pending"),
    attempts: integer("attempts").notNull().default(0),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true }).notNull().defaultNow(),
    lastError: text("last_error"),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("pay_deliveries_event_key").on(t.eventId),
    index("pay_deliveries_due_idx").on(t.status, t.nextAttemptAt),
  ],
);

/** Maps a Paystack subscription/customer to the product and tenant that own it, so renewals can be routed. */
export const paySubscriptions = pgTable(
  "pay_subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    subscriptionCode: varchar("subscription_code", { length: 60 }),
    customerCode: varchar("customer_code", { length: 60 }).notNull(),
    planCode: varchar("plan_code", { length: 60 }).notNull(),
    mode: varchar("mode", { length: 8 }).notNull().default("test"),
    product: varchar("product", { length: 40 }).notNull(),
    tenantId: varchar("tenant_id", { length: 120 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("pay_subscriptions_customer_plan_key").on(t.mode, t.customerCode, t.planCode),
    index("pay_subscriptions_code_idx").on(t.subscriptionCode),
  ],
);
