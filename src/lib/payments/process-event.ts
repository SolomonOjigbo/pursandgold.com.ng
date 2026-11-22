import { randomUUID } from "node:crypto";
import { and, desc, eq, or } from "drizzle-orm";
import { payDeliveries, payEvents, paySubscriptions, payTransactions } from "@/db/schema";
import { productFromReference, type ProductSlug } from "./config";
import { asPaystackMode, planCodeOf, verifyTransaction, type PaystackCustomer, type PaystackMode, type PaystackPlanRef } from "./paystack";
import { findTransaction, settleTransaction, type Db } from "./transactions";
import { alertOps } from "./alert";
import type { PursPayEvent, PursPayEventType } from "./types";

type EventRow = typeof payEvents.$inferSelect;

export type ProcessResult = {
  /** false = answer Paystack with a non-2xx so it retries later (an ordering race or a transient failure). */
  done: boolean;
  outcome: "routed" | "ignored" | "unrouted" | "rejected";
  note?: string;
  product?: ProductSlug;
  reference?: string | null;
  deliveryId?: string;
};

type PaystackEvent = { event: string; data: Record<string, any> }; // eslint-disable-line @typescript-eslint/no-explicit-any

/** Webhooks that can't be routed yet (e.g. subscription.create arriving before charge.success) are retried this long. */
const ROUTING_GRACE_MS = 6 * 60 * 60 * 1000;

export async function processPaystackEvent(db: Db, row: EventRow, evt: PaystackEvent): Promise<ProcessResult> {
  switch (evt.event) {
    case "charge.success":
      return chargeSuccess(db, row, evt);
    case "subscription.create":
      return subscriptionEvent(db, row, evt, "subscription.created", "active");
    case "subscription.disable":
      return subscriptionEvent(db, row, evt, "subscription.disabled", "cancelled");
    case "subscription.not_renew":
      return subscriptionEvent(db, row, evt, "subscription.not_renewing", "non-renewing");
    case "invoice.payment_failed":
      return subscriptionEvent(db, row, evt, "invoice.payment_failed", null);
    default:
      return { done: true, outcome: "ignored", note: `unhandled event ${evt.event}` };
  }
}

// ── charge.success ─────────────────────────────────────────────────────────────

async function chargeSuccess(db: Db, row: EventRow, evt: PaystackEvent): Promise<ProcessResult> {
  const reference = String(evt.data.reference ?? "");
  if (!reference) return { done: true, outcome: "ignored", note: "charge.success without a reference" };
  const mode = asPaystackMode(row.mode);

  let txn = await findTransaction(db, reference);

  // A subscription renewal: Paystack created the charge itself, so we have no row. Route it through the stored owner.
  if (!txn) {
    const planCode = planCodeOf(evt.data.plan as PaystackPlanRef);
    const owner = planCode ? await resolveOwner(db, { mode, customer: evt.data.customer, planCode }) : null;
    if (!owner) return unrouted(row, evt, `no owner for reference ${reference}`, reference);
    await db
      .insert(payTransactions)
      .values({
        reference,
        product: owner.product,
        mode,
        tenantId: owner.tenantId,
        email: String(evt.data.customer?.email ?? "unknown@invalid"),
        currency: String(evt.data.currency ?? "NGN"),
        expectedAmountKobo: null,
        planCode,
        status: "pending",
      })
      .onConflictDoNothing({ target: payTransactions.reference });
    txn = await findTransaction(db, reference);
    if (!txn) return { done: false, outcome: "ignored", note: "could not create renewal row" };
  }

  // Never trust the webhook body for money: confirm with Paystack, using the key of the mode that signed it.
  const verified = await verifyTransaction(reference, mode);
  const settled = await settleTransaction(db, txn, verified);

  if (settled.outcome === "mismatch") {
    await alertOps("Payment amount mismatch", { product: txn.product, tenant: txn.tenantId, reference, reason: settled.reason });
    return { done: true, outcome: "rejected", note: settled.reason, product: asProduct(txn.product), reference };
  }
  if (settled.outcome === "not_successful") {
    return { done: true, outcome: "ignored", note: `verify says ${settled.paystackStatus}`, product: asProduct(txn.product), reference };
  }

  const t = settled.txn;
  const deliveryId = await queueDelivery(db, row.id, {
    type: "payment.succeeded",
    product: asProduct(t.product),
    mode: asPaystackMode(t.mode),
    tenantId: t.tenantId,
    reference: t.reference,
    amountKobo: t.paidAmountKobo,
    currency: t.currency,
    email: t.email,
    planCode: t.planCode,
    subscriptionCode: null,
    customerCode: t.customerCode,
    paidAt: t.paidAt?.toISOString() ?? null,
    metadata: (t.metadata as Record<string, unknown> | null) ?? null,
  });
  return { done: true, outcome: "routed", product: asProduct(t.product), reference, deliveryId };
}

// ── subscription lifecycle and invoices ───────────────────────────────────────

async function subscriptionEvent(
  db: Db,
  row: EventRow,
  evt: PaystackEvent,
  type: PursPayEventType,
  newStatus: string | null,
): Promise<ProcessResult> {
  const d = evt.data;
  const mode = asPaystackMode(row.mode);
  const isInvoice = type === "invoice.payment_failed";
  const subscriptionCode: string | null = (isInvoice ? d.subscription?.subscription_code : d.subscription_code) ?? null;
  const customer: PaystackCustomer | undefined = d.customer;
  const planCode = planCodeOf(d.plan as PaystackPlanRef) ?? planCodeOf(d.subscription?.plan as PaystackPlanRef);

  const owner = await resolveOwner(db, { mode, subscriptionCode, customer, planCode });
  if (!owner) {
    const tooOld = Date.now() - row.receivedAt.getTime() > ROUTING_GRACE_MS;
    if (!tooOld) return { done: false, outcome: "unrouted", note: "owner not known yet; Paystack will retry" };
    return unrouted(row, evt, "no owner after grace period", null);
  }

  // Keep the subscription ledger current. Created events may arrive before charge.success has stored the mapping.
  if (customer?.customer_code && planCode) {
    await db
      .insert(paySubscriptions)
      .values({ subscriptionCode, customerCode: customer.customer_code, planCode, mode, product: owner.product, tenantId: owner.tenantId, status: newStatus ?? "active" })
      .onConflictDoNothing({ target: [paySubscriptions.mode, paySubscriptions.customerCode, paySubscriptions.planCode] });
  }
  if (customer?.customer_code && planCode) {
    await db
      .update(paySubscriptions)
      .set({ ...(subscriptionCode ? { subscriptionCode } : {}), ...(newStatus ? { status: newStatus } : {}), updatedAt: new Date() })
      .where(and(eq(paySubscriptions.mode, mode), eq(paySubscriptions.customerCode, customer.customer_code), eq(paySubscriptions.planCode, planCode)));
  } else if (subscriptionCode && newStatus) {
    await db
      .update(paySubscriptions)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(and(eq(paySubscriptions.mode, mode), eq(paySubscriptions.subscriptionCode, subscriptionCode)));
  }

  const deliveryId = await queueDelivery(db, row.id, {
    type,
    product: owner.product,
    mode,
    tenantId: owner.tenantId,
    reference: (isInvoice ? d.transaction?.reference : null) ?? null,
    amountKobo: typeof d.amount === "number" ? d.amount : null,
    currency: null,
    email: customer?.email ?? null,
    planCode,
    subscriptionCode,
    customerCode: customer?.customer_code ?? null,
    paidAt: null,
    metadata: null,
  });
  return { done: true, outcome: "routed", product: owner.product, reference: null, deliveryId };
}

// ── routing helpers ───────────────────────────────────────────────────────────

type Owner = { product: ProductSlug; tenantId: string };

/** Finds which product/tenant owns a subscription event: by subscription code, then customer+plan, then the latest matching transaction. */
async function resolveOwner(
  db: Db,
  q: { mode: PaystackMode; subscriptionCode?: string | null; customer?: PaystackCustomer; planCode?: string | null },
): Promise<Owner | null> {
  if (q.subscriptionCode) {
    const [s] = await db
      .select()
      .from(paySubscriptions)
      .where(and(eq(paySubscriptions.mode, q.mode), eq(paySubscriptions.subscriptionCode, q.subscriptionCode)))
      .limit(1);
    if (s) return { product: asProduct(s.product), tenantId: s.tenantId };
  }
  if (q.customer?.customer_code && q.planCode) {
    const [s] = await db
      .select()
      .from(paySubscriptions)
      .where(
        and(
          eq(paySubscriptions.mode, q.mode),
          eq(paySubscriptions.customerCode, q.customer.customer_code),
          eq(paySubscriptions.planCode, q.planCode),
        ),
      )
      .limit(1);
    if (s) return { product: asProduct(s.product), tenantId: s.tenantId };
  }
  if (q.planCode && (q.customer?.customer_code || q.customer?.email)) {
    const who = [
      q.customer.customer_code ? eq(payTransactions.customerCode, q.customer.customer_code) : undefined,
      q.customer.email ? eq(payTransactions.email, q.customer.email) : undefined,
    ].filter((c) => c !== undefined);
    const [t] = await db
      .select()
      .from(payTransactions)
      .where(and(eq(payTransactions.mode, q.mode), eq(payTransactions.planCode, q.planCode), or(...who)))
      .orderBy(desc(payTransactions.createdAt))
      .limit(1);
    if (t) return { product: asProduct(t.product), tenantId: t.tenantId };
  }
  return null;
}

/** `product` columns only ever hold slugs this service wrote itself. */
function asProduct(p: string): ProductSlug {
  return p as ProductSlug;
}

async function unrouted(row: EventRow, evt: PaystackEvent, note: string, reference: string | null): Promise<ProcessResult> {
  const guess = reference ? productFromReference(reference) : null;
  await alertOps("Unrouted Paystack event", { event: evt.event, note, reference: reference ?? "-", eventRowId: row.id, guessedProduct: guess ?? "-" });
  return { done: true, outcome: "unrouted", note, reference };
}

async function queueDelivery(
  db: Db,
  eventId: string,
  e: Omit<PursPayEvent, "id" | "occurredAt">,
): Promise<string> {
  const id = randomUUID();
  const body: PursPayEvent = { ...e, id, occurredAt: new Date().toISOString() };
  const [inserted] = await db
    .insert(payDeliveries)
    .values({ id, eventId, product: e.product, mode: e.mode, type: e.type, body })
    .onConflictDoNothing({ target: payDeliveries.eventId })
    .returning({ id: payDeliveries.id });
  if (inserted) return inserted.id;
  // Reprocessing an event whose delivery already exists: keep the original id so the product still sees one event.
  const [existing] = await db.select({ id: payDeliveries.id }).from(payDeliveries).where(eq(payDeliveries.eventId, eventId)).limit(1);
  return existing.id;
}
