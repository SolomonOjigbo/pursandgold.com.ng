import { and, eq, lte, sql } from "drizzle-orm";
import { payDeliveries } from "@/db/schema";
import { getProductConfig, isProductSlug } from "./config";
import { signOutbound } from "./signature";
import { alertOps } from "./alert";
import type { Db } from "./transactions";

type DeliveryRow = typeof payDeliveries.$inferSelect;

/** Minutes between attempts after each failure. After the last one the delivery is marked dead and ops is emailed. */
const BACKOFF_MINUTES = [1, 5, 15, 60, 180, 360, 720, 1440];
const MAX_ATTEMPTS = BACKOFF_MINUTES.length + 4;
const LEASE_MINUTES = 2;
const SEND_TIMEOUT_MS = 8_000;

/**
 * Claims a due delivery (a short lease stops the webhook's `after()` and the retry cron sending it twice),
 * POSTs the signed event to the product, and records the result. Returns true when the product answered 2xx.
 */
export async function attemptDelivery(db: Db, deliveryId: string): Promise<boolean> {
  const [claimed] = await db
    .update(payDeliveries)
    .set({
      attempts: sql`${payDeliveries.attempts} + 1`,
      nextAttemptAt: sql`now() + make_interval(mins => ${LEASE_MINUTES})`,
    })
    .where(and(eq(payDeliveries.id, deliveryId), eq(payDeliveries.status, "pending"), lte(payDeliveries.nextAttemptAt, sql`now()`)))
    .returning();
  if (!claimed) return false; // already delivered, dead, or leased by another worker

  const error = await send(claimed);
  if (!error) {
    await db.update(payDeliveries).set({ status: "delivered", deliveredAt: new Date(), lastError: null }).where(eq(payDeliveries.id, claimed.id));
    return true;
  }

  if (claimed.attempts >= MAX_ATTEMPTS) {
    await db.update(payDeliveries).set({ status: "dead", lastError: error }).where(eq(payDeliveries.id, claimed.id));
    await alertOps("Event delivery gave up", { product: claimed.product, type: claimed.type, deliveryId: claimed.id, attempts: claimed.attempts, lastError: error });
    return false;
  }
  const wait = BACKOFF_MINUTES[Math.min(claimed.attempts - 1, BACKOFF_MINUTES.length - 1)];
  await db
    .update(payDeliveries)
    .set({ lastError: error, nextAttemptAt: sql`now() + make_interval(mins => ${wait})` })
    .where(eq(payDeliveries.id, claimed.id));
  return false;
}

/** Returns an error string, or null on success. */
async function send(row: DeliveryRow): Promise<string | null> {
  if (!isProductSlug(row.product)) return `unknown product "${row.product}"`;
  const cfg = getProductConfig(row.product);
  if (!cfg.webhookUrl || !cfg.webhookSecret) return `PAY_APP_${row.product.toUpperCase()}_WEBHOOK_URL / _WEBHOOK_SECRET not configured`;

  const body = JSON.stringify(row.body);
  try {
    const res = await fetch(cfg.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-purs-event-id": row.id,
        "x-purs-event-type": row.type,
        "x-purs-mode": row.mode,
        "x-purs-signature": signOutbound(cfg.webhookSecret, body),
      },
      body,
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
      redirect: "manual", // a redirected POST would silently drop the signature's meaning; treat 3xx as failure
      cache: "no-store",
    });
    if (res.status >= 200 && res.status < 300) return null;
    return `HTTP ${res.status}`;
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
}

/** Due deliveries, oldest first. Used by the retry job. */
export async function dueDeliveryIds(db: Db, limit = 25): Promise<string[]> {
  const rows = await db
    .select({ id: payDeliveries.id })
    .from(payDeliveries)
    .where(and(eq(payDeliveries.status, "pending"), lte(payDeliveries.nextAttemptAt, sql`now()`)))
    .orderBy(payDeliveries.nextAttemptAt)
    .limit(limit);
  return rows.map((r) => r.id);
}
