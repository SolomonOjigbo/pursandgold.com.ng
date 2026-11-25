# Purs Pay integration guide for coding agents

Audience: an AI coding agent adding payments to one Purs & Gold product (**Tenaville, Veritory, Pursberry, PursEdu ERP**).
Copy this file into the product repo as `docs/payments/AGENTS.md`, copy `reference/purs-pay.ts` to `lib/purs-pay.ts`,
and add one line to the product's root `AGENTS.md`: `Payments: follow docs/payments/AGENTS.md`.
(Do not edit a root `AGENTS.md` block that says it is written by `next dev`; add your line outside it.)

Source of truth for the service is the `pursandgold.com.ng` repo: `src/lib/payments/` and `src/app/api/pay/`.
If this guide and that code disagree, the code wins. Tell the human and fix the guide.

---

## 1. The one idea

Products **never talk to Paystack and never hold Paystack keys.** One central service, **Purs Pay**
(`/api/pay/*` on `pursandgold.com.ng`), owns the single Paystack account. A product:

1. asks Purs Pay to start a checkout and gets a Paystack URL,
2. sends the customer there,
3. receives a **signed event** from Purs Pay when money moves,
4. grants or revokes access from that event.

```
 Product app                 Purs Pay (pursandgold.com.ng)                 Paystack
 ───────────                 ─────────────────────────────                 ────────
 POST /api/pay/transactions/initialize ───────────▶ creates reference TNV-… ──▶ initialize
      ◀─────────── { reference, authorizationUrl }
 redirect customer ─────────────────────────────────────────────────────────▶ checkout
                                                    ◀── webhook (HMAC-SHA512) ── charge.success
                                                    verifies signature, verifies txn with Paystack,
                                                    checks amount, dedupes, stores
 POST {your webhook} ◀── signed event (HMAC-SHA256) ─ routes by reference prefix / stored subscription owner
 verify, dedupe, fulfil, answer 2xx ───────────────▶
 GET /api/pay/transactions/:reference  (for the return page)
```

Paystack allows **one webhook URL per mode per account**, which is why this service exists. Do not try to register a webhook
for your product with Paystack. Your product's webhook is registered with Purs Pay (an env var on the Purs Pay side).

## 2. Rules that are not negotiable

1. **No Paystack code in products.** No `paystack` npm package, no `api.paystack.co` calls, no `sk_`/`pk_` keys, no Paystack inline JS. Use `lib/purs-pay.ts` only.
2. **Server-side only.** `PURS_PAY_*` variables must never be `NEXT_PUBLIC_*`, never reach a client component, never be logged.
3. **Verify every event.** Read the raw body with `await request.text()`, verify `x-purs-signature` with `verifyPursPayEvent`, and only then `JSON.parse`. Invalid signature gives `401`. Never trust a request body, query string or redirect parameter as proof of payment.
4. **Fulfil idempotently.** The same event is delivered more than once, and the status endpoint can race the webhook. Dedupe on `event.id` and make the effect idempotent on `reference`. Do the dedupe insert and the entitlement change in **one transaction**, or a crash between them loses a payment.
5. **Check the money yourself.** Before granting access, compare `event.amountKobo`, `event.currency` and `event.tenantId` with what *your* invoice/order expected. Mismatch means do not fulfil; log and surface it.
6. **Answer fast, honestly.** Persist, then return `2xx` within a few seconds. Return `5xx` for transient failures so it is retried. Return `2xx` for events you deliberately ignore. Never return `2xx` before the change is saved.
7. **Amounts are integers in kobo** (₦1 = 100 kobo). Never use floats for money. Never hard-code a price in UI code; read it from the product's plan/price source (for this company, the Services & Product Catalog price book).
8. **Customers cannot grant themselves access.** The return page may *display* status and poll; entitlement changes only run in the single idempotent `applyPayment` function (section 6).
9. **No secrets or personal data in `metadata`.** It is stored and echoed. Put your invoice id or order id there, nothing else.
10. **Test mode first.** Purs Pay runs test and live on one deployment. Build against it with Paystack test keys (`mode: "test"`), and never grant production access from a test event. The live keys are enabled later by the human.

## 3. Configuration (server env in the product)

| Variable | Meaning |
|---|---|
| `PURS_PAY_URL` | Base URL of Purs Pay: `https://www.pursandgold.com.ng`. Test and live run on the same deployment, selected per checkout by `PAYSTACK_MODE` on the Purs Pay side. |
| `PURS_PAY_KEY` | This product's bearer key. Issued by the human; matches `PAY_APP_<SLUG>_KEY` on Purs Pay. |
| `PURS_PAY_WEBHOOK_SECRET` | Verifies events. Matches `PAY_APP_<SLUG>_WEBHOOK_SECRET` on Purs Pay. A different secret from the key. |
| `BILLING_PLAN_*` (names are yours) | Only if you pass pre-made plan codes. **Test and live have different `PLN_…` codes**, so they are env, not code. Products that send `recurring` need none. |

Add all of them to the product's `.env.example` with placeholder values and a comment. Never commit real values.
Ask the human for any value you do not have; do not invent keys or plan codes.

The product must expose a webhook endpoint at the URL the human registered on Purs Pay
(`PAY_APP_<SLUG>_WEBHOOK_URL`); the route path is the product's choice. Each product's
`AGENTS.md` records the path it uses.
The product's public origin (used for `callbackUrl`) must be in `PAY_APP_<SLUG>_ORIGINS`, or `/initialize` returns `callback_origin_not_allowed`.

## 4. API contract

All calls: `Authorization: Bearer $PURS_PAY_KEY`, JSON bodies, `Cache-Control: no-store` responses.
Use the wrapper functions in `lib/purs-pay.ts`; this section is so you know what they do.

### `POST /api/pay/transactions/initialize`

| Field | Required | Notes |
|---|---|---|
| `tenantId` | yes | Your id for the paying customer (tenant, school, store, workspace). Echoed on every event. |
| `email` | yes | Payer's email. |
| `amountKobo` | yes | Positive integer. With `recurring` this is the monthly charge and must equal your computed price: Purs Pay creates the plan at exactly this amount and checks it. With a pre-made `planCode`, Paystack bills the plan's amount and Purs Pay does not enforce equality. |
| `currency` | no | `NGN` (default), `USD`, `GHS`, `ZAR`, `KES`. Only currencies enabled on the Paystack account work. |
| `planCode` | no | `PLN_…` for a pre-made plan. Starts a recurring subscription. Cannot be combined with `recurring`. |
| `recurring` | no | `{ planKey, seats }`. For amounts computed per tenant: Purs Pay creates or reuses a fixed-amount monthly Paystack plan for this product, plan key, seat count, currency and `amountKobo`, then starts a subscription. Prices live in your app, not in Paystack plan codes. |
| `callbackUrl` | no | https (http only for localhost), origin must be registered. Paystack appends `?reference=…&trxref=…`. |
| `idempotencyKey` | no, **recommended** | e.g. `invoice:<id>`. Same key returns the same pending checkout (`reused: true`) or `409 already_paid`. |
| `channels` | no | Restrict payment methods. |
| `metadata` | no | Small JSON echoed back on `payment.succeeded`. |

Success `201`: `{ reference, authorizationUrl, accessCode, mode }`. Errors: `400 invalid_request | callback_origin_not_allowed`,
`401 unauthorized`, `409 already_paid | idempotency_key_used`, `502 gateway_error`, `503 payments_not_configured`.

### `GET /api/pay/transactions/:reference`

Returns `{ reference, tenantId, status, mode, amountKobo, currency, planCode, paidAt }` for a transaction **your product** created
(other products' references return `404`). `status` is `pending | success | failed | abandoned | mismatch | reversed`.
If still `pending` it asks Paystack, so it is safe to poll every 2 to 3 seconds for up to about 30 seconds on the return page.
`pending` right after the redirect is normal; Paystack may not have settled yet.

### Events Purs Pay sends to your webhook

Headers: `x-purs-signature: t=<unix>,v1=<hmac>`, `x-purs-event-id`, `x-purs-event-type`, `x-purs-mode: test|live`. Body is a `PursPayEvent`
(type in `lib/purs-pay.ts`) and also carries `mode`. Signatures carry a timestamp and are rejected after 5 minutes, so retries are re-signed.
Never treat a `mode: "test"` event as proof of a production payment.

| `type` | When | What to do |
|---|---|---|
| `payment.succeeded` | One-off payment, first subscription payment, or a **renewal** | Match `reference` (or `metadata`) to your invoice; if `planCode`, extend the tenant's paid period by that plan's interval. |
| `subscription.created` | Paystack created the subscription | Store `subscriptionCode`, `customerCode` against the tenant. Usually no access change (the payment event grants it). |
| `invoice.payment_failed` | A renewal charge failed | Mark the tenant past-due, notify them, keep a grace period. Do not revoke immediately. |
| `subscription.not_renewing` | Customer cancelled; runs to period end | Record `cancel_at_period_end`. Do not revoke yet. |
| `subscription.disabled` | Subscription ended | Revoke at the end of the paid period (or now if already past it). |

Unknown future `type` values: ignore and return `2xx`.

Delivery semantics: at-least-once, no ordering guarantee, retried with backoff for about two days, then dead-lettered
(Purs & Gold is emailed). Any non-`2xx` (or a redirect) counts as failure.

## 5. Data you need in the product

Adapt names to the product's existing conventions and ORM; keep the shape.

- **Payments/invoices table** with: your invoice/order id, `tenant_id`, `amount_kobo`, `currency`, `purs_pay_reference` (unique), `status`.
  Save `reference` the moment `initialize` returns, before redirecting.
- **Processed events table**: `event_id uuid primary key`, `type`, `reference`, `received_at`. Row-level security on and no policies (server only).
- **Billing state per tenant**: plan, `status` (`active | past_due | cancelled`), `current_period_end`, `cancel_at_period_end`, `subscription_code`, `customer_code`.

Plan intervals and prices come from the product's own plan configuration. With `recurring`, Purs Pay keeps the
Paystack plan (one per product, plan key, seat count, currency and amount) and gives you its code back in events;
with pre-made plans, map them to your plan ids via env.

## 6. Implementation steps (Next.js App Router, TypeScript)

Check the product's Next.js version and read its bundled docs (`node_modules/next/dist/docs/`) before writing route code;
conventions such as async `params` differ between versions.

### 6.1 Start a checkout (server action or route handler)

```ts
import { initializePayment } from "@/lib/purs-pay";

// Run only after authenticating the user and loading THEIR tenant + the invoice/plan server-side.
const { reference, authorizationUrl } = await initializePayment({
  tenantId: tenant.id,
  email: user.email,
  amountKobo: plan.priceKobo,              // from your plan source, never from the browser
  recurring: { planKey: plan.key, seats }, // monthly auto-renewal; omit for a one-off payment
  // planCode: process.env.BILLING_PLAN_GROWTH, // or start a pre-made plan instead of `recurring`
  callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/billing/return`,
  idempotencyKey: `invoice:${invoice.id}`,
  metadata: { invoiceId: invoice.id },
});
await saveReference(invoice.id, reference);  // BEFORE redirecting
redirect(authorizationUrl);
```

Never accept `amountKobo`, `planCode` or `tenantId` from the request body or form fields. Derive them server-side from the session.

### 6.2 Return page (`/billing/return`)

Read `reference` from the query string, **look it up in your own table and confirm it belongs to the signed-in tenant**,
call `getPayment(reference)`, and render: `success` shows thanks and runs `applyPayment` (idempotent), `pending` polls,
`failed | abandoned` offers retry, `mismatch` shows "we are checking this payment" and logs loudly.

### 6.3 Webhook route (for example `app/api/webhooks/purs-pay/route.ts`)

```ts
import { verifyPursPayEvent } from "@/lib/purs-pay";
import { applyEvent } from "@/lib/billing/apply-event";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const raw = await request.text();
  let event;
  try {
    event = verifyPursPayEvent(raw, request.headers.get("x-purs-signature"));
  } catch {
    return new Response("invalid signature", { status: 401 });
  }
  try {
    await applyEvent(event); // idempotent; see 6.4
  } catch (err) {
    console.error("purs-pay webhook failed", event.id, event.type, err); // never log the raw body or secrets
    return new Response("error", { status: 500 });              // transient: Purs Pay will retry
  }
  return Response.json({ ok: true });
}
```

If the product has auth middleware or a CSRF layer, exclude this path from it (the signature is the authentication).
If it uses Next.js middleware/proxy matchers, make sure the route is reachable without a session.

### 6.4 `applyEvent`: one transaction, deduped, idempotent

Order inside **one** DB transaction:

1. `INSERT INTO payment_events (event_id, …) ON CONFLICT DO NOTHING`; if it inserted nothing, this event was already applied, so return.
2. Switch on `event.type`; validate tenant, amount and currency against your own records (rule 5).
3. Update invoice status and tenant billing state.

Supabase has no multi-statement transactions over the JS client. Put steps 1 to 3 in a Postgres function and call it with `rpc` from the
webhook using the **service-role** client (server only):

```sql
create or replace function public.billing_apply_payment(
  p_event_id uuid, p_reference text, p_tenant text, p_amount_kobo bigint, p_plan_code text, p_paid_at timestamptz
) returns void language plpgsql security definer set search_path = public as $$
begin
  insert into payment_events(event_id, reference) values (p_event_id, p_reference) on conflict do nothing;
  if not found then return; end if;            -- duplicate delivery
  -- 1. find the invoice by p_reference; raise if p_tenant or p_amount_kobo differ from what it expects
  -- 2. mark it paid; 3. extend the tenant's current_period_end by the plan interval
end $$;

-- A security-definer function is callable through the public API unless you revoke it:
revoke all on function public.billing_apply_payment(uuid, text, text, bigint, text, timestamptz) from public, anon, authenticated;
grant execute on function public.billing_apply_payment(uuid, text, text, bigint, text, timestamptz) to service_role;
```

Neon (Pursberry): use the ORM's `transaction()`.

### 6.5 Entitlements

Gate paid features on the billing state, checked **server-side** on every protected request (`active`, or `past_due` inside the
grace period, or `cancel_at_period_end` before `current_period_end`). In Supabase, enforce it in RLS or in server code, not only in the UI.

## 7. Product specifics

**Tenaville, Veritory, PursEdu ERP** (Next.js + Supabase): everything above applies as written. Use the Supabase service-role key
only in the webhook and server actions; it must never reach the browser. PursEdu may bill schools per term or per student count;
if the amount is computed, compute it server-side from the school's record and pass it as `amountKobo`.

**Pursberry** (Next.js on Render + Neon): same subscription flow, plus a separate concern below. Render's free instances sleep and
can miss the 8 second delivery timeout; use a paid instance for the webhook, or accept that delivery relies on Purs Pay's retries.

### Pursberry tenants collecting their own payments with Monnify (bring your own keys)

This is **not** Purs Pay and Purs & Gold never touches that money. Each tenant supplies *their own* Monnify credentials, and their
customers' payments settle into the tenant's own Monnify account. Build it as a separate module (`lib/payments/monnify/`).

- Store each tenant's `apiKey`, `secretKey`, `contractCode` **encrypted** (AES-256-GCM; keep ciphertext, IV, auth tag and key version; master key only in server env). Never return them to the client; show at most the last 4 characters. Support rotation.
- Validate on save by authenticating against Monnify with the supplied keys; store only if that succeeds.
- Per tenant environment flag: `sandbox` (`https://sandbox.monnify.com`) or `live` (`https://api.monnify.com`). Development and the pilot store use sandbox keys.
- Webhook per tenant: `/api/webhooks/monnify/{tenantId}`. Load that tenant's secret, verify the `monnify-signature` header (HMAC-SHA512 of the raw body with their secret key), then confirm the transaction status with Monnify before marking a sale paid. Dedupe on the transaction reference. Verify these details against Monnify's current documentation before shipping; they are not fixed by this repo.
- No pooling and no splitting through Purs & Gold credentials. Keep it that way.

## 8. Testing

Purs Pay has one deployment for both Paystack modes. While `PAYSTACK_MODE=test` on Purs Pay, use Paystack's test cards (from Paystack's docs).
Products must reject or badge `mode: "test"` events in production. Unit-test `applyEvent` without Purs Pay by generating a signed event locally:

```bash
node -e '
const c=require("crypto"),secret=process.env.PURS_PAY_WEBHOOK_SECRET;
const body=JSON.stringify({id:c.randomUUID(),type:"payment.succeeded",product:"tenaville",mode:"test",tenantId:"t1",reference:"TNV-TEST",
 amountKobo:500000,currency:"NGN",email:"a@b.com",planCode:null,subscriptionCode:null,customerCode:null,
 paidAt:new Date().toISOString(),metadata:{invoiceId:"inv_1"},occurredAt:new Date().toISOString()});
const t=Math.floor(Date.now()/1000);
const sig="t="+t+",v1="+c.createHmac("sha256",secret).update(t+"."+body).digest("hex");
console.log("curl -i -X POST $URL -H \"content-type: application/json\" -H \"x-purs-signature: "+sig+"\" -d \x27"+body+"\x27")'
```

Tests you must write: valid event fulfils; same event twice fulfils once; tampered body gives `401`; amount or tenant mismatch does not fulfil;
`invoice.payment_failed` sets `past_due` without revoking; `subscription.disabled` revokes only after the paid period;
a failure inside `applyEvent` returns `5xx` and leaves no half-applied state.

End to end on test mode: one-off payment, subscription first payment, a failed card, an abandoned checkout, and a webhook retry after you return `500` once.

## 9. Definition of done

- [ ] No Paystack SDK, keys or URLs anywhere in the product (`grep -ri paystack` shows nothing outside comments).
- [ ] `lib/purs-pay.ts` copied unmodified; `PURS_PAY_*` and (only when using pre-made plans) plan codes in `.env.example`, none in client bundles.
- [ ] `amountKobo`, `planCode`, `tenantId` derived server-side; `reference` saved before redirect; `idempotencyKey` used.
- [ ] Webhook verifies the raw body, dedupes on `event.id` inside the same transaction as the entitlement change, returns `401/5xx/2xx` per section 2.
- [ ] Amount, currency and tenant cross-checked against the product's own records.
- [ ] Return page polls and never grants access from query parameters.
- [ ] Entitlement gates enforced server-side (and in RLS for Supabase products); past-due grace and cancel-at-period-end handled.
- [ ] Tests from section 8 pass; test-mode end-to-end done with Paystack test mode.
- [ ] Webhook path excluded from auth/CSRF middleware; Supabase function revoked from `anon`/`authenticated`.
- [ ] Human told which env vars to set in which environments, and that `PAY_APP_<SLUG>_ORIGINS` / `_WEBHOOK_URL` must be set on Purs Pay.

## 10. Troubleshooting

| Symptom | Likely cause |
|---|---|
| `401 unauthorized` from Purs Pay | `PURS_PAY_KEY` wrong or not set for this environment. |
| `callback_origin_not_allowed` | Origin missing from `PAY_APP_<SLUG>_ORIGINS` on Purs Pay (preview URLs change per deploy). |
| `502 gateway_error` | Bad `planCode` (test vs live codes differ), currency not enabled, or Paystack down. |
| Paid but nothing happened | Webhook URL wrong on the Purs Pay side, product returned non-2xx (check the dead-letter query in `README.md`), or signature secret mismatch. |
| `401` on every event | `PURS_PAY_WEBHOOK_SECRET` differs from `PAY_APP_<SLUG>_WEBHOOK_SECRET`, or you parsed the body before verifying. |
| Status stays `pending` | Customer has not completed checkout; Paystack reports "not found" until checkout is opened. |
| `mismatch` | Paid amount or currency differs from what was initialised. Do not fulfil; the human investigates. |

When something is ambiguous (a price, a plan, who owns a tenant), ask the human. Do not guess money.
