import { createHash, timingSafeEqual } from "node:crypto";

/**
 * The products that may use Purs Pay. To add a product: add it here, add its four env vars
 * (see .env.example) and its Paystack plan codes to the product's own app. Nothing else changes.
 * `prefix` is stamped on every Paystack reference so a transaction is attributable on sight.
 */
export const PRODUCTS = {
  tenaville: { name: "Tenaville", prefix: "TNV" },
  veritory: { name: "Veritory", prefix: "VRT" },
  pursberry: { name: "Pursberry", prefix: "PRB" },
  pursedu: { name: "PursEdu ERP", prefix: "PEDU" },
} as const;

export type ProductSlug = keyof typeof PRODUCTS;
export const PRODUCT_SLUGS = Object.keys(PRODUCTS) as ProductSlug[];

export function isProductSlug(v: string): v is ProductSlug {
  return Object.prototype.hasOwnProperty.call(PRODUCTS, v);
}

function envName(slug: ProductSlug, part: "KEY" | "WEBHOOK_URL" | "WEBHOOK_SECRET" | "ORIGINS") {
  return `PAY_APP_${slug.toUpperCase()}_${part}`;
}

export type ProductConfig = {
  slug: ProductSlug;
  /** Bearer key the product uses to call Purs Pay. */
  key: string | undefined;
  /** Where Purs Pay delivers signed events for this product. */
  webhookUrl: string | undefined;
  /** HMAC secret for outbound events. Never the same as `key`. */
  webhookSecret: string | undefined;
  /** Origins a product may use as a Paystack callback_url (comma separated in env). */
  origins: string[];
};

export function getProductConfig(slug: ProductSlug): ProductConfig {
  return {
    slug,
    key: process.env[envName(slug, "KEY")]?.trim() || undefined,
    webhookUrl: process.env[envName(slug, "WEBHOOK_URL")]?.trim() || undefined,
    webhookSecret: process.env[envName(slug, "WEBHOOK_SECRET")]?.trim() || undefined,
    origins: (process.env[envName(slug, "ORIGINS")] ?? "")
      .split(",")
      .map((s) => s.trim().replace(/\/+$/, ""))
      .filter(Boolean),
  };
}

const sha256 = (s: string) => createHash("sha256").update(s).digest();

/** Identifies the calling product from its bearer key. Compares every key in constant time and never short-circuits. */
export function authenticateProduct(request: Request): ProductSlug | null {
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(\S+)$/i.exec(header);
  if (!match) return null;
  const presented = sha256(match[1]);
  let found: ProductSlug | null = null;
  for (const slug of PRODUCT_SLUGS) {
    const key = getProductConfig(slug).key;
    if (!key) continue;
    if (timingSafeEqual(presented, sha256(key)) && found === null) found = slug;
  }
  return found;
}

/** A callback_url must be https (http only for localhost) and on one of the product's registered origins. */
export function isAllowedCallback(slug: ProductSlug, callbackUrl: string): boolean {
  let u: URL;
  try {
    u = new URL(callbackUrl);
  } catch {
    return false;
  }
  const isLocal = u.hostname === "localhost" || u.hostname === "127.0.0.1";
  if (u.protocol !== "https:" && !(isLocal && u.protocol === "http:")) return false;
  return getProductConfig(slug).origins.includes(u.origin);
}

/** Reference like `TNV-9F3A1C0B7D2E4A5C6B8D`. Paystack allows only letters, digits, `-`, `.` and `=`. */
export function newReference(slug: ProductSlug, randomHex: string): string {
  return `${PRODUCTS[slug].prefix}-${randomHex.toUpperCase()}`;
}

export function productFromReference(reference: string): ProductSlug | null {
  const prefix = reference.split("-")[0];
  return PRODUCT_SLUGS.find((s) => PRODUCTS[s].prefix === prefix) ?? null;
}
