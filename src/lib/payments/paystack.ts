const BASE = "https://api.paystack.co";

export type PaystackMode = "test" | "live";

const SECRET_ENV: Record<PaystackMode, string> = {
  test: "PAYSTACK_TEST_SECRET_KEY",
  live: "PAYSTACK_LIVE_SECRET_KEY",
};

export class PaystackError extends Error {
  constructor(message: string, readonly httpStatus: number) {
    super(message);
    this.name = "PaystackError";
  }
}

/** Secret key for a mode, or undefined when that mode is not configured. */
export function paystackKey(mode: PaystackMode): string | undefined {
  return process.env[SECRET_ENV[mode]]?.trim() || undefined;
}

/** Modes with a secret key. The webhook verifies against each of them so test and live can share one deployment. */
export function configuredPaystackModes(): PaystackMode[] {
  return (["test", "live"] as const).filter((mode) => paystackKey(mode));
}

/**
 * Mode used for NEW checkouts. PAYSTACK_MODE wins; otherwise live when a live key is configured,
 * else test. Every transaction is stored with its mode, so one deployment and one database can
 * serve both Paystack test and live traffic.
 */
export function activePaystackMode(): PaystackMode {
  const explicit = (process.env.PAYSTACK_MODE ?? "").trim().toLowerCase();
  if (explicit === "test" || explicit === "live") return explicit;
  return paystackKey("live") ? "live" : "test";
}

export function paystackSecret(mode: PaystackMode = activePaystackMode()): string {
  const key = paystackKey(mode);
  if (!key) throw new PaystackError(`${SECRET_ENV[mode]} is not set`, 500);
  return key;
}

/** Narrows a stored `mode` column to the union. Anything unexpected is treated as test, never live. */
export function asPaystackMode(value: string | null | undefined): PaystackMode {
  return value === "live" ? "live" : "test";
}

type Envelope<T> = { status: boolean; message: string; data: T };

async function call<T>(path: string, init: RequestInit = {}, mode: PaystackMode = activePaystackMode()): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${paystackSecret(mode)}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  });
  let json: Envelope<T> | null = null;
  try {
    json = (await res.json()) as Envelope<T>;
  } catch {
    /* non-JSON error body */
  }
  if (!res.ok || !json?.status) throw new PaystackError(json?.message ?? `Paystack returned HTTP ${res.status}`, res.status);
  return json.data;
}

export type PaystackPlanRef = string | { plan_code?: string } | null | undefined;

/** Paystack returns the plan as "", {}, a code string or a plan object depending on the endpoint. */
export function planCodeOf(plan: PaystackPlanRef): string | null {
  if (!plan) return null;
  if (typeof plan === "string") return plan || null;
  return plan.plan_code || null;
}

export type PaystackCustomer = { id?: number; customer_code?: string; email?: string };

export type PaystackTransaction = {
  id: number;
  status: string; // success | failed | abandoned | ongoing | pending | reversed
  reference: string;
  amount: number;
  currency: string;
  paid_at: string | null;
  channel: string | null;
  gateway_response: string | null;
  customer: PaystackCustomer;
  plan?: PaystackPlanRef;
  plan_object?: PaystackPlanRef;
  metadata?: Record<string, unknown> | string | null;
};

export type InitializeInput = {
  reference: string;
  email: string;
  amount: number;
  currency: string;
  callback_url?: string;
  plan?: string;
  channels?: string[];
  metadata?: Record<string, unknown>;
};

export function initializeTransaction(input: InitializeInput, mode: PaystackMode = activePaystackMode()) {
  return call<{ authorization_url: string; access_code: string; reference: string }>(
    "/transaction/initialize",
    { method: "POST", body: JSON.stringify(input) },
    mode,
  );
}

export function verifyTransaction(reference: string, mode: PaystackMode = activePaystackMode()) {
  return call<PaystackTransaction>(`/transaction/verify/${encodeURIComponent(reference)}`, {}, mode);
}
