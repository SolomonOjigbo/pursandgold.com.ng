import { randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { payTransactions } from "@/db/schema";
import { authenticateProduct, isAllowedCallback, newReference, PRODUCTS } from "@/lib/payments/config";
import { activePaystackMode, initializeTransaction, paystackKey, PaystackError } from "@/lib/payments/paystack";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  /** The product's own identifier for the paying customer: a tenant, school, store or workspace id. Echoed back in events. */
  tenantId: z.string().trim().min(1).max(120),
  email: z.email().max(254),
  /** Minor units (kobo). Always required; for a plan-priced charge Paystack uses the plan's amount and this is not enforced. */
  amountKobo: z.number().int().positive().max(100_000_000_000),
  currency: z.enum(["NGN", "USD", "GHS", "ZAR", "KES"]).default("NGN"),
  planCode: z.string().trim().regex(/^PLN_[A-Za-z0-9]+$/, "planCode must look like PLN_xxxx").optional(),
  callbackUrl: z.string().trim().max(2000).optional(),
  channels: z.array(z.enum(["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer", "eft", "apple_pay"])).max(8).optional(),
  /** Retry-safe: the same key for the same product returns the same pending checkout instead of creating a second one. */
  idempotencyKey: z.string().trim().min(8).max(120).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  const product = authenticateProduct(request);
  if (!product) return json({ error: "unauthorized" }, 401);

  const db = getDb();
  if (!db) return json({ error: "payments_not_configured" }, 503);
  const mode = activePaystackMode();
  if (!paystackKey(mode)) return json({ error: "payments_not_configured", message: `Paystack ${mode} key is not set` }, 503);

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) return json({ error: "invalid_request", issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })) }, 400);
  const b = parsed.data;

  if (b.callbackUrl && !isAllowedCallback(product, b.callbackUrl)) {
    return json({ error: "callback_origin_not_allowed", hint: `Add the origin to PAY_APP_${product.toUpperCase()}_ORIGINS` }, 400);
  }

  // Idempotent retry: same product + key in the same mode returns the existing checkout.
  if (b.idempotencyKey) {
    const existing = await findByIdempotencyKey(db, product, mode, b.idempotencyKey);
    if (existing) return replay(existing);
  }

  const reference = newReference(product, randomBytes(10).toString("hex"));
  const [created] = await db
    .insert(payTransactions)
    .values({
      reference,
      product,
      mode,
      tenantId: b.tenantId,
      email: b.email,
      currency: b.currency,
      expectedAmountKobo: b.planCode ? null : b.amountKobo,
      planCode: b.planCode ?? null,
      idempotencyKey: b.idempotencyKey ?? null,
      callbackUrl: b.callbackUrl ?? null,
      metadata: b.metadata ?? null,
    })
    .onConflictDoNothing()
    .returning();

  if (!created) {
    // Lost a race on the idempotency key.
    const existing = b.idempotencyKey ? await findByIdempotencyKey(db, product, mode, b.idempotencyKey) : null;
    return existing ? replay(existing) : json({ error: "conflict" }, 409);
  }

  try {
    const ps = await initializeTransaction({
      reference,
      email: b.email,
      amount: b.amountKobo,
      currency: b.currency,
      callback_url: b.callbackUrl,
      plan: b.planCode,
      channels: b.channels,
      metadata: {
        // What the Paystack dashboard shows next to each transaction.
        custom_fields: [
          { display_name: "Product", variable_name: "product", value: PRODUCTS[product].name },
          { display_name: "Tenant", variable_name: "tenant_id", value: b.tenantId },
        ],
        purs_product: product,
        purs_tenant_id: b.tenantId,
        purs_mode: mode,
        app: b.metadata ?? null,
      },
    }, mode);
    await db
      .update(payTransactions)
      .set({ authorizationUrl: ps.authorization_url, accessCode: ps.access_code, updatedAt: new Date() })
      .where(eq(payTransactions.id, created.id));
    return json({ reference, authorizationUrl: ps.authorization_url, accessCode: ps.access_code, mode }, 201);
  } catch (err) {
    const message = err instanceof PaystackError ? err.message : "Paystack request failed";
    console.error("pay.initialize failed", reference, err);
    await db.update(payTransactions).set({ status: "failed", gatewayResponse: message, updatedAt: new Date() }).where(eq(payTransactions.id, created.id));
    return json({ error: "gateway_error", message }, 502);
  }
}

async function findByIdempotencyKey(db: NonNullable<ReturnType<typeof getDb>>, product: string, mode: string, key: string) {
  const [row] = await db
    .select()
    .from(payTransactions)
    .where(and(eq(payTransactions.product, product), eq(payTransactions.mode, mode), eq(payTransactions.idempotencyKey, key)))
    .limit(1);
  return row ?? null;
}

function replay(row: typeof payTransactions.$inferSelect) {
  if (row.status === "success") return json({ error: "already_paid", reference: row.reference, mode: row.mode }, 409);
  if (row.status === "pending" && row.authorizationUrl) {
    return json({ reference: row.reference, authorizationUrl: row.authorizationUrl, accessCode: row.accessCode, mode: row.mode, reused: true }, 200);
  }
  return json({ error: "idempotency_key_used", reference: row.reference, status: row.status, mode: row.mode }, 409);
}
