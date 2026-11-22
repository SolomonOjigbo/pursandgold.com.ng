import { createHmac, timingSafeEqual } from "node:crypto";
import { configuredPaystackModes, paystackSecret, type PaystackMode } from "./paystack";

/**
 * Paystack signs the RAW request body with secret key of the mode that sent it (`x-paystack-signature`).
 * Test and live webhooks may both arrive at this one endpoint, so every configured key is checked in
 * constant time and the matching mode is returned. Null means invalid signature or no keys configured.
 */
export function verifyPaystackSignature(rawBody: string, header: string | null): PaystackMode | null {
  if (!header) return null;
  const presented = Buffer.from(header.trim().toLowerCase(), "utf8");
  let matched: PaystackMode | null = null;
  for (const mode of configuredPaystackModes()) {
    const expected = Buffer.from(createHmac("sha512", paystackSecret(mode)).update(rawBody).digest("hex"), "utf8");
    if (expected.length === presented.length && timingSafeEqual(expected, presented)) matched = mode;
  }
  return matched;
}

/**
 * Signature Purs Pay puts on every event it delivers to a product:
 *   x-purs-signature: t=<unix seconds>,v1=<hex HMAC-SHA256 of `${t}.${rawBody}` with the product's webhook secret>
 * The timestamp is inside the signed string so a captured request cannot be replayed later.
 */
export function signOutbound(secret: string, rawBody: string, t = Math.floor(Date.now() / 1000)): string {
  const v1 = createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  return `t=${t},v1=${v1}`;
}
