/**
 * Purs Pay client + webhook verifier. Copy this file into each product as `lib/purs-pay.ts` (server-only).
 * Zero dependencies: Node 18+ `fetch` and `node:crypto`. Do not import it from client components.
 *
 * Env (server only, never NEXT_PUBLIC_*):
 *   PURS_PAY_URL             base URL of Purs Pay, e.g. https://www.pursandgold.com.ng
 *   PURS_PAY_KEY             this product's bearer key (matches PAY_APP_<SLUG>_KEY on Purs Pay)
 *   PURS_PAY_WEBHOOK_SECRET  verifies events from Purs Pay (matches PAY_APP_<SLUG>_WEBHOOK_SECRET)
 *
 * Keep the types below in step with src/lib/payments/types.ts in the pursandgold.com.ng repo.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

export type PursPayEventType =
  | "payment.succeeded"
  | "subscription.created"
  | "subscription.disabled"
  | "subscription.not_renewing"
  | "invoice.payment_failed";

export type PursPayEvent = {
  /** Unique per event, stable across retries. Deduplicate on this. */
  id: string;
  type: PursPayEventType;
  product: "tenaville" | "veritory" | "pursberry" | "pursedu";
  /** Paystack mode of the payment. Badge test events in the UI; never grant production access from one. */
  mode: "test" | "live";
  tenantId: string;
  reference: string | null;
  amountKobo: number | null;
  currency: string | null;
  email: string | null;
  planCode: string | null;
  subscriptionCode: string | null;
  customerCode: string | null;
  paidAt: string | null;
  /** Whatever you passed as `metadata` to initializePayment (payment.succeeded only). */
  metadata: Record<string, unknown> | null;
  occurredAt: string;
};

export class PursPayError extends Error {
  constructor(message: string, readonly status: number, readonly code: string) {
    super(message);
    this.name = "PursPayError";
  }
}

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new PursPayError(`${name} is not set`, 500, "not_configured");
  return v;
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${env("PURS_PAY_URL").replace(/\/+$/, "")}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${env("PURS_PAY_KEY")}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
    signal: AbortSignal.timeout(20_000),
    cache: "no-store",
  });
  const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string } & T;
  if (!res.ok) throw new PursPayError(body.message ?? body.error ?? `Purs Pay returned HTTP ${res.status}`, res.status, body.error ?? "error");
  return body;
}

export type InitializeInput = {
  /** Your id for the paying customer: tenant, school, store, workspace. Comes back on every event. */
  tenantId: string;
  email: string;
  /** Minor units. 1 NGN = 100 kobo. For a subscription, pass the plan's price; Paystack bills the plan's amount. */
  amountKobo: number;
  currency?: "NGN" | "USD" | "GHS" | "ZAR" | "KES";
  /** Paystack plan code (PLN_xxx) to start a recurring subscription. Differs between Paystack test and live mode. */
  planCode?: string;
  /** Where Paystack returns the customer. Its origin must be listed in PAY_APP_<SLUG>_ORIGINS on Purs Pay. */
  callbackUrl?: string;
  /** Same key for the same checkout attempt (e.g. `invoice:${invoice.id}`): a retry reuses the pending checkout. */
  idempotencyKey?: string;
  channels?: ("card" | "bank" | "ussd" | "qr" | "mobile_money" | "bank_transfer" | "eft" | "apple_pay")[];
  /** Small JSON echoed back on payment.succeeded. Put your invoice/order id here. No secrets, no personal data. */
  metadata?: Record<string, unknown>;
};

export type InitializeResult = { reference: string; authorizationUrl: string; accessCode: string; mode: "test" | "live"; reused?: boolean };

/** Starts a checkout. Redirect the customer to `authorizationUrl`. Store `reference` against your invoice/order first. */
export function initializePayment(input: InitializeInput) {
  return call<InitializeResult>("/api/pay/transactions/initialize", { method: "POST", body: JSON.stringify(input) });
}

export type PaymentStatus = {
  reference: string;
  tenantId: string;
  status: "pending" | "success" | "failed" | "abandoned" | "mismatch" | "reversed";
  mode: "test" | "live";
  amountKobo: number | null;
  currency: string;
  planCode: string | null;
  paidAt: string | null;
};

/** For the page the customer returns to. Fulfilment must be idempotent on `reference`, because the event may also arrive. */
export function getPayment(reference: string) {
  return call<PaymentStatus>(`/api/pay/transactions/${encodeURIComponent(reference)}`);
}

/**
 * Verifies an event delivered by Purs Pay and returns it parsed. Throws PursPayError("invalid_signature") if it is not
 * authentic or is older than `toleranceSeconds`. Pass the RAW request body (`await request.text()`), never re-serialised JSON.
 */
export function verifyPursPayEvent(rawBody: string, signatureHeader: string | null, toleranceSeconds = 300): PursPayEvent {
  const bad = () => new PursPayError("invalid signature", 401, "invalid_signature");
  if (!signatureHeader) throw bad();
  const parts = Object.fromEntries(signatureHeader.split(",").map((p) => p.trim().split("=", 2) as [string, string]));
  const t = Number(parts.t);
  const v1 = parts.v1;
  if (!Number.isFinite(t) || !v1) throw bad();
  if (Math.abs(Date.now() / 1000 - t) > toleranceSeconds) throw bad();

  const expected = createHmac("sha256", env("PURS_PAY_WEBHOOK_SECRET")).update(`${t}.${rawBody}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(v1);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw bad();
  return JSON.parse(rawBody) as PursPayEvent;
}
