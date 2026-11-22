import { createHash } from "node:crypto";
import { after } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { payEvents } from "@/db/schema";
import { verifyPaystackSignature } from "@/lib/payments/signature";
import { configuredPaystackModes } from "@/lib/payments/paystack";
import { processPaystackEvent } from "@/lib/payments/process-event";
import { attemptDelivery } from "@/lib/payments/deliver";
import { alertOps } from "@/lib/payments/alert";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * The single URL registered in Paystack (Settings > API Keys & Webhooks) for this account.
 * Order matters: verify signature on the RAW body, record the event (deduplicated), process, answer 200, deliver after.
 */
export async function POST(request: Request) {
  const raw = await request.text(); // must be the untouched body; never re-serialise before verifying
  // Test and live have separate webhook URLs in Paystack, but both may point at this one deployment.
  if (configuredPaystackModes().length === 0) return new Response("payments not configured", { status: 503 });
  const mode = verifyPaystackSignature(raw, request.headers.get("x-paystack-signature"));
  if (!mode) return new Response("invalid signature", { status: 401 });

  const db = getDb();
  if (!db) return new Response("payments not configured", { status: 503 }); // non-2xx so Paystack retries

  let evt: { event: string; data: Record<string, unknown> };
  try {
    evt = JSON.parse(raw);
    if (typeof evt?.event !== "string" || typeof evt.data !== "object" || evt.data === null) throw new Error("shape");
  } catch {
    return new Response("invalid payload", { status: 400 });
  }

  const eventKey = createHash("sha256").update(`${mode}.${raw}`).digest("hex");
  const reference = typeof evt.data.reference === "string" ? evt.data.reference : null;

  await db
    .insert(payEvents)
    .values({ eventKey, mode, type: evt.event, reference, payload: evt })
    .onConflictDoNothing({ target: payEvents.eventKey });
  const [row] = await db.select().from(payEvents).where(eq(payEvents.eventKey, eventKey)).limit(1);
  if (!row) return new Response("could not record event", { status: 500 });
  if (row.processedAt) return Response.json({ received: true, duplicate: true }); // Paystack retry of an event we already handled

  try {
    const result = await processPaystackEvent(db, row, evt);
    if (!result.done) {
      await db.update(payEvents).set({ note: result.note, product: result.product }).where(eq(payEvents.id, row.id));
      return new Response(result.note ?? "retry later", { status: 503 });
    }
    await db
      .update(payEvents)
      .set({ outcome: result.outcome, note: result.note, product: result.product, reference: result.reference ?? reference, processedAt: new Date() })
      .where(eq(payEvents.id, row.id));
    if (result.deliveryId) {
      const id = result.deliveryId;
      after(() => attemptDelivery(db, id).catch((err) => console.error("pay.deliver failed", id, err)));
    }
    return Response.json({ received: true });
  } catch (err) {
    console.error("pay.webhook failed", evt.event, reference, err);
    await alertOps("Webhook processing error", { event: evt.event, reference: reference ?? "-", error: err instanceof Error ? err.message : String(err) });
    return new Response("processing error", { status: 500 }); // Paystack will retry; processing is idempotent
  }
}
