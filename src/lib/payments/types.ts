import type { ProductSlug } from "./config";

/** The normalised event Purs Pay POSTs to a product. This is the contract; Paystack's own shapes never leak through. */
export type PursPayEventType =
  | "payment.succeeded"
  | "subscription.created"
  | "subscription.disabled"
  | "subscription.not_renewing"
  | "invoice.payment_failed";

export type PursPayEvent = {
  /** Unique per delivery and stable across retries. Deduplicate on this. */
  id: string;
  type: PursPayEventType;
  product: ProductSlug;
  /** Paystack mode of the payment. Badge test events; never grant production access from one. */
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
  /** The `metadata` the product passed to /initialize (only for payment.succeeded on a transaction Purs Pay initialised). */
  metadata: Record<string, unknown> | null;
  occurredAt: string;
};
