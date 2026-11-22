import { and, eq } from "drizzle-orm";
import type { getDb } from "@/lib/db";
import { payTransactions, paySubscriptions } from "@/db/schema";
import { planCodeOf, type PaystackTransaction } from "./paystack";

export type Db = NonNullable<ReturnType<typeof getDb>>;
export type TxnRow = typeof payTransactions.$inferSelect;

export type SettleResult =
  | { outcome: "success"; txn: TxnRow }
  | { outcome: "not_successful"; txn: TxnRow; paystackStatus: string }
  | { outcome: "mismatch"; txn: TxnRow; reason: string };

/**
 * Applies a transaction fetched from Paystack's verify endpoint to our row.
 * The amount and currency are checked against what the product asked for. A mismatch is never treated as paid.
 * Idempotent: safe to call from the webhook, the status endpoint and retries.
 */
export async function settleTransaction(db: Db, txn: TxnRow, verified: PaystackTransaction): Promise<SettleResult> {
  const planCode = planCodeOf(verified.plan_object) ?? planCodeOf(verified.plan) ?? txn.planCode;
  const customerCode = verified.customer?.customer_code ?? txn.customerCode;
  const now = new Date();

  if (verified.status !== "success") {
    const status = verified.status === "failed" || verified.status === "abandoned" || verified.status === "reversed" ? verified.status : txn.status;
    const [row] = await db
      .update(payTransactions)
      .set({ status: txn.status === "success" ? "success" : status, gatewayResponse: verified.gateway_response, updatedAt: now })
      .where(eq(payTransactions.id, txn.id))
      .returning();
    return { outcome: "not_successful", txn: row ?? txn, paystackStatus: verified.status };
  }

  const amountOk = txn.expectedAmountKobo == null || verified.amount === txn.expectedAmountKobo;
  const currencyOk = verified.currency === txn.currency;
  if (!amountOk || !currencyOk) {
    const reason = !amountOk
      ? `expected ${txn.expectedAmountKobo} kobo, Paystack reports ${verified.amount}`
      : `expected ${txn.currency}, Paystack reports ${verified.currency}`;
    const [row] = await db
      .update(payTransactions)
      .set({ status: "mismatch", paidAmountKobo: verified.amount, gatewayResponse: reason, updatedAt: now })
      .where(eq(payTransactions.id, txn.id))
      .returning();
    return { outcome: "mismatch", txn: row ?? txn, reason };
  }

  const [row] = await db
    .update(payTransactions)
    .set({
      status: "success",
      paidAmountKobo: verified.amount,
      paidAt: verified.paid_at ? new Date(verified.paid_at) : now,
      paystackId: String(verified.id),
      customerCode,
      planCode,
      channel: verified.channel,
      gatewayResponse: verified.gateway_response,
      updatedAt: now,
    })
    .where(eq(payTransactions.id, txn.id))
    .returning();

  // Remember who owns this subscription so renewals (which carry no reference of ours) can be routed.
  if (planCode && customerCode) {
    await db
      .insert(paySubscriptions)
      .values({ customerCode, planCode, mode: txn.mode, product: txn.product, tenantId: txn.tenantId })
      .onConflictDoNothing({ target: [paySubscriptions.mode, paySubscriptions.customerCode, paySubscriptions.planCode] });
  }
  return { outcome: "success", txn: row ?? txn };
}

export async function findTransaction(db: Db, reference: string): Promise<TxnRow | null> {
  const [row] = await db.select().from(payTransactions).where(eq(payTransactions.reference, reference)).limit(1);
  return row ?? null;
}

export async function findOwnedTransaction(db: Db, product: string, reference: string): Promise<TxnRow | null> {
  const [row] = await db
    .select()
    .from(payTransactions)
    .where(and(eq(payTransactions.reference, reference), eq(payTransactions.product, product)))
    .limit(1);
  return row ?? null;
}
