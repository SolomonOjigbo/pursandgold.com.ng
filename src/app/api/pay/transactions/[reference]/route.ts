import { getDb } from "@/lib/db";
import { authenticateProduct } from "@/lib/payments/config";
import { PaystackError, asPaystackMode, verifyTransaction } from "@/lib/payments/paystack";
import { findOwnedTransaction, settleTransaction } from "@/lib/payments/transactions";

export const dynamic = "force-dynamic";

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

/**
 * Status of one transaction, for the page the customer lands on after Paystack's redirect.
 * A product can only read its own transactions. If we have not heard from Paystack yet, we ask it directly.
 * Either this endpoint (verified server-side with Paystack) or the signed `payment.succeeded` event may be the first to
 * tell a product the payment succeeded, so products must fulfil idempotently, keyed on `reference`.
 */
export async function GET(request: Request, { params }: { params: Promise<{ reference: string }> }) {
  const product = authenticateProduct(request);
  if (!product) return json({ error: "unauthorized" }, 401);
  const db = getDb();
  if (!db) return json({ error: "payments_not_configured" }, 503);

  const { reference } = await params;
  let txn = await findOwnedTransaction(db, product, reference);
  if (!txn) return json({ error: "not_found" }, 404);

  if (txn.status === "pending") {
    try {
      const settled = await settleTransaction(db, txn, await verifyTransaction(reference, asPaystackMode(txn.mode)));
      txn = settled.txn;
    } catch (err) {
      // Paystack says "Transaction reference not found" until the customer has opened checkout. Report pending, not an error.
      if (!(err instanceof PaystackError)) console.error("pay.status verify failed", reference, err);
    }
  }

  return json({
    reference: txn.reference,
    tenantId: txn.tenantId,
    status: txn.status, // pending | success | failed | abandoned | mismatch
    mode: txn.mode,
    amountKobo: txn.paidAmountKobo ?? txn.expectedAmountKobo,
    currency: txn.currency,
    planCode: txn.planCode,
    paidAt: txn.paidAt?.toISOString() ?? null,
  });
}
