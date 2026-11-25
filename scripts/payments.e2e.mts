// Purs Pay regression test: runs the real migration + service logic against an in-process Postgres (PGlite) with Paystack
// and the product endpoint mocked. No network, no Neon, no keys needed.  Run: pnpm test:payments
/* eslint-disable @typescript-eslint/no-explicit-any */
import { readFileSync } from "node:fs";
import { createHmac } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { eq } from "drizzle-orm";
import { payDeliveries, payEvents, payPlans, paySubscriptions, payTransactions } from "@/db/schema";
import { processPaystackEvent } from "@/lib/payments/process-event";
import { ensureMonthlyPlan } from "@/lib/payments/plans";
import { attemptDelivery } from "@/lib/payments/deliver";
import { signOutbound, verifyPaystackSignature } from "@/lib/payments/signature";
import { verifyPursPayEvent } from "../docs/payments/reference/purs-pay";

process.env.PAYSTACK_MODE = "test";
process.env.PAYSTACK_TEST_SECRET_KEY = "sk_test_e2e";
process.env.PAY_APP_TENAVILLE_WEBHOOK_URL = "https://tena.test/hook";
process.env.PAY_APP_TENAVILLE_WEBHOOK_SECRET = "whsec_tena";
process.env.PURS_PAY_WEBHOOK_SECRET = "whsec_tena"; // what a product app would have

const pg = new PGlite();
await pg.exec(readFileSync("drizzle/0001_payments.sql", "utf8"));
await pg.exec(readFileSync("drizzle/0001_payments.sql", "utf8")); // re-runnable
await pg.exec(readFileSync("drizzle/0002_pay_plans.sql", "utf8"));
await pg.exec(readFileSync("drizzle/0002_pay_plans.sql", "utf8")); // re-runnable
const db = drizzle(pg, { schema: { payDeliveries, payEvents, payPlans, paySubscriptions, payTransactions } }) as any;

let failures = 0;
const check = (name: string, ok: boolean, extra?: unknown) => { console.log(`${ok ? "PASS" : "FAIL"}  ${name}`, ok ? "" : extra ?? ""); if (!ok) failures++; };

// ── fetch mock: Paystack verify + the product's webhook ──
let verifyResponse: any = null;
let productStatus = 200;
const received: { headers: Headers; body: string }[] = [];
let planCalls = 0;
globalThis.fetch = (async (url: any, init: any) => {
  const u = String(url);
  if (u.startsWith("https://api.paystack.co/transaction/verify/")) return new Response(JSON.stringify({ status: true, message: "ok", data: verifyResponse }), { status: 200 });
  if (u === "https://api.paystack.co/plan") {
    planCalls++;
    const input = JSON.parse(String(init.body));
    return new Response(JSON.stringify({ status: true, message: "ok", data: { plan_code: `PLN_on_demand_${planCalls}`, ...input } }), { status: 200 });
  }
  if (u === "https://tena.test/hook") { received.push({ headers: new Headers(init.headers), body: init.body }); return new Response("", { status: productStatus }); }
  throw new Error("unexpected fetch " + u);
}) as any;

const newEvent = async (type: string, payload: any, ageMs = 0) => {
  const [row] = await db.insert(payEvents).values({ eventKey: Math.random().toString(16).slice(2).padEnd(64, "0"), type, payload, receivedAt: new Date(Date.now() - ageMs) }).returning();
  return row;
};
const seedTxn = (o: any) => db.insert(payTransactions).values({ product: "tenaville", tenantId: "tenant-1", email: "a@b.com", currency: "NGN", ...o }).returning().then((r: any) => r[0]);
const ps = (o: any = {}) => ({ id: 9001, status: "success", reference: "TNV-AAA", amount: 500000, currency: "NGN", paid_at: "2026-11-22T10:00:00Z", channel: "card", gateway_response: "Successful", customer: { customer_code: "CUS_1", email: "a@b.com" }, plan_object: { plan_code: "PLN_gold" }, ...o });

// 1. one-off payment succeeds, is routed and delivered with a valid signature
await seedTxn({ reference: "TNV-AAA", expectedAmountKobo: 500000, planCode: "PLN_gold", metadata: { invoiceId: "inv_7" } });
verifyResponse = ps();
let ev = await newEvent("charge.success", { event: "charge.success", data: { reference: "TNV-AAA" } });
let r = await processPaystackEvent(db, ev, { event: "charge.success", data: { reference: "TNV-AAA", plan: {}, customer: { customer_code: "CUS_1" } } });
check("charge.success routed", r.done && r.outcome === "routed" && r.product === "tenaville" && !!r.deliveryId, r);
const txn = (await db.select().from(payTransactions).where(eq(payTransactions.reference, "TNV-AAA")))[0];
check("txn marked success with paid amount", txn.status === "success" && txn.paidAmountKobo === 500000 && txn.customerCode === "CUS_1", txn);
check("subscription owner stored", (await db.select().from(paySubscriptions)).length === 1);
let ok = await attemptDelivery(db, r.deliveryId!);
const hit = received[0];
const [, tPart, vPart] = /t=(\d+),v1=([0-9a-f]+)/.exec(hit.headers.get("x-purs-signature")!)!;
check("delivered to product (2xx)", ok === true);
check("outbound signature verifies", vPart === createHmac("sha256", "whsec_tena").update(`${tPart}.${hit.body}`).digest("hex") && signOutbound("whsec_tena", hit.body, Number(tPart)) === hit.headers.get("x-purs-signature"));
const body = JSON.parse(hit.body);
check("event body has tenant, reference, id, metadata, test mode", body.type === "payment.succeeded" && body.tenantId === "tenant-1" && body.reference === "TNV-AAA" && body.id === r.deliveryId && body.metadata?.invoiceId === "inv_7" && body.mode === "test", body);
check("x-purs-mode header matches", hit.headers.get("x-purs-mode") === "test", hit.headers.get("x-purs-mode"));
check("redelivery of delivered event is a no-op", (await attemptDelivery(db, r.deliveryId!)) === false && received.length === 1);

// one endpoint, two Paystack modes: each webhook is matched to the key that signed it
const signPs = (key: string, raw: string) => createHmac("sha512", key).update(raw).digest("hex");
const psRaw = JSON.stringify({ event: "charge.success", data: {} });
check("test signature accepted as test", verifyPaystackSignature(psRaw, signPs("sk_test_e2e", psRaw)) === "test");
process.env.PAYSTACK_LIVE_SECRET_KEY = "sk_live_e2e";
check("live signature accepted as live on the same endpoint", verifyPaystackSignature(psRaw, signPs("sk_live_e2e", psRaw)) === "live");
check("unknown signature rejected", verifyPaystackSignature(psRaw, "0".repeat(128)) === null);
delete process.env.PAYSTACK_LIVE_SECRET_KEY;

// the reference verifier that product apps copy must accept what the service signs, and nothing else
const verifies = (raw: string, header: string | null) => { try { verifyPursPayEvent(raw, header); return true; } catch { return false; } };
check("reference verifier accepts the delivered event", verifies(hit.body, hit.headers.get("x-purs-signature")));
check("reference verifier rejects a tampered body", !verifies(hit.body.replace("tenant-1", "tenant-2"), hit.headers.get("x-purs-signature")));
check("reference verifier rejects a stale (replayed) signature", !verifies(hit.body, signOutbound("whsec_tena", hit.body, Math.floor(Date.now() / 1000) - 3600)));
check("reference verifier rejects a missing header", !verifies(hit.body, null));

// 2. reprocessing the same event keeps ONE delivery id
r = await processPaystackEvent(db, ev, { event: "charge.success", data: { reference: "TNV-AAA" } });
check("reprocess keeps single delivery", (await db.select().from(payDeliveries)).length === 1 && r.deliveryId === body.id);

// 3. delivery failure: backoff + lease
productStatus = 500;
await seedTxn({ reference: "TNV-BBB", expectedAmountKobo: 1000 });
verifyResponse = ps({ reference: "TNV-BBB", amount: 1000, plan_object: undefined });
ev = await newEvent("charge.success", {});
r = await processPaystackEvent(db, ev, { event: "charge.success", data: { reference: "TNV-BBB" } });
ok = await attemptDelivery(db, r.deliveryId!);
let d = (await db.select().from(payDeliveries).where(eq(payDeliveries.id, r.deliveryId!)))[0];
check("failed delivery stays pending with attempts=1 and future retry", !ok && d.status === "pending" && d.attempts === 1 && d.nextAttemptAt > new Date() && /HTTP 500/.test(d.lastError), d);
check("not re-sent while backing off", (await attemptDelivery(db, r.deliveryId!)) === false && received.length === 2);
await db.update(payDeliveries).set({ nextAttemptAt: new Date(Date.now() - 1000) }).where(eq(payDeliveries.id, r.deliveryId!));
productStatus = 200;
check("succeeds on retry once due", (await attemptDelivery(db, r.deliveryId!)) === true);

// 4. amount mismatch is never forwarded as paid
await seedTxn({ reference: "TNV-CCC", expectedAmountKobo: 500000 });
verifyResponse = ps({ reference: "TNV-CCC", amount: 100 });
ev = await newEvent("charge.success", {});
r = await processPaystackEvent(db, ev, { event: "charge.success", data: { reference: "TNV-CCC" } });
const cTxn = (await db.select().from(payTransactions).where(eq(payTransactions.reference, "TNV-CCC")))[0];
check("mismatch rejected, flagged, not delivered", r.outcome === "rejected" && !r.deliveryId && cTxn.status === "mismatch", { r, cTxn });

// 5. subscription renewal: Paystack-created charge with no row of ours, routed via stored owner
verifyResponse = ps({ reference: "RENEW-1", amount: 500000, id: 9100 });
ev = await newEvent("charge.success", {});
r = await processPaystackEvent(db, ev, { event: "charge.success", data: { reference: "RENEW-1", currency: "NGN", plan: { plan_code: "PLN_gold" }, customer: { customer_code: "CUS_1", email: "a@b.com" } } });
check("renewal routed to owning tenant", r.outcome === "routed" && r.product === "tenaville", r);
check("renewal row stored as success", (await db.select().from(payTransactions).where(eq(payTransactions.reference, "RENEW-1")))[0]?.status === "success");

// 6. unknown renewal is unrouted (200 + ops alert), not an error
ev = await newEvent("charge.success", {});
r = await processPaystackEvent(db, ev, { event: "charge.success", data: { reference: "STRANGER-1", plan: { plan_code: "PLN_x" }, customer: { customer_code: "CUS_404", email: "z@z.com" } } });
check("unknown owner -> unrouted but done", r.outcome === "unrouted" && r.done, r);

// 7. subscription.create before we know the owner: retry (non-done), then give up after grace
const subCreate = { event: "subscription.create", data: { subscription_code: "SUB_9", status: "active", customer: { customer_code: "CUS_NEW", email: "new@x.com" }, plan: { plan_code: "PLN_gold" } } };
ev = await newEvent("subscription.create", subCreate);
r = await processPaystackEvent(db, ev, subCreate);
check("subscription.create with unknown owner asks Paystack to retry", r.done === false, r);
ev = await newEvent("subscription.create", subCreate, 7 * 3600_000);
r = await processPaystackEvent(db, ev, subCreate);
check("...and gives up after the grace period", r.done === true && r.outcome === "unrouted", r);

// 8. subscription.create for a known customer, then disable and invoice failure
const sub2 = { event: "subscription.create", data: { subscription_code: "SUB_1", status: "active", customer: { customer_code: "CUS_1", email: "a@b.com" }, plan: { plan_code: "PLN_gold" } } };
ev = await newEvent("subscription.create", sub2);
r = await processPaystackEvent(db, ev, sub2);
check("subscription.create routed", r.outcome === "routed" && r.product === "tenaville", r);
let sub = (await db.select().from(paySubscriptions).where(eq(paySubscriptions.customerCode, "CUS_1")))[0];
check("subscription code attached to mapping", sub.subscriptionCode === "SUB_1" && sub.status === "active", sub);
const dis = { event: "subscription.disable", data: { subscription_code: "SUB_1", status: "complete", customer: { customer_code: "CUS_1", email: "a@b.com" }, plan: { plan_code: "PLN_gold" } } };
ev = await newEvent("subscription.disable", dis);
r = await processPaystackEvent(db, ev, dis);
sub = (await db.select().from(paySubscriptions).where(eq(paySubscriptions.customerCode, "CUS_1")))[0];
check("subscription.disable routed, status cancelled", r.outcome === "routed" && sub.status === "cancelled", { r, sub });
const inv = { event: "invoice.payment_failed", data: { amount: 500000, subscription: { subscription_code: "SUB_1" }, customer: { customer_code: "CUS_1", email: "a@b.com" }, transaction: { reference: "INVREF" } } };
ev = await newEvent("invoice.payment_failed", inv);
r = await processPaystackEvent(db, ev, inv);
const invBody = (await db.select().from(payDeliveries).where(eq(payDeliveries.id, r.deliveryId!)))[0].body as any;
check("invoice.payment_failed routed via subscription code", r.outcome === "routed" && invBody.type === "invoice.payment_failed" && invBody.amountKobo === 500000 && invBody.tenantId === "tenant-1", invBody);

// 9. unhandled events are ignored
ev = await newEvent("transfer.success", {});
r = await processPaystackEvent(db, ev, { event: "transfer.success", data: {} });
check("unhandled event ignored", r.done && r.outcome === "ignored");

// 10. dead-letter after max attempts
productStatus = 500;
await seedTxn({ reference: "TNV-DDD", expectedAmountKobo: 1000 });
verifyResponse = ps({ reference: "TNV-DDD", amount: 1000, plan_object: undefined });
ev = await newEvent("charge.success", {});
r = await processPaystackEvent(db, ev, { event: "charge.success", data: { reference: "TNV-DDD" } });
await db.update(payDeliveries).set({ attempts: 11 }).where(eq(payDeliveries.id, r.deliveryId!));
await attemptDelivery(db, r.deliveryId!);
d = (await db.select().from(payDeliveries).where(eq(payDeliveries.id, r.deliveryId!)))[0];
check("12th failed attempt marks delivery dead", d.status === "dead" && d.attempts === 12, d);

// 11. unique indexes enforce idempotency
let dup = false;
try { await seedTxn({ reference: "TNV-AAA", expectedAmountKobo: 1 }); } catch { dup = true; }
check("duplicate reference rejected by unique index", dup);

// 12. on-demand recurring plans: created once per product + plan + seats + currency + amount, reused after
const planInput = { product: "tenaville" as const, mode: "test" as const, planKey: "starter", seats: 5, currency: "NGN", amountKobo: 4_000_000 };
const code1 = await ensureMonthlyPlan(db, planInput);
const code2 = await ensureMonthlyPlan(db, planInput);
check("plan created on first use and reused after", code1 === "PLN_on_demand_1" && code2 === code1 && planCalls === 1, { code1, code2, planCalls });
const code3 = await ensureMonthlyPlan(db, { ...planInput, amountKobo: 4_800_000 });
check("a price change gets its own plan", code3 === "PLN_on_demand_2" && planCalls === 2, { code3, planCalls });
const code4 = await ensureMonthlyPlan(db, { ...planInput, seats: 6 });
check("a seat change gets its own plan", code4 === "PLN_on_demand_3" && planCalls === 3, { code4, planCalls });
check("plans stored per product, seats and amount", (await db.select().from(payPlans)).length === 3);

console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
process.exit(failures ? 1 : 0);
