# Purs Pay: central payments service

Purs Pay is the one place in the Purs & Gold estate that owns the Paystack account. It lives inside the company website
(`pursandgold.com.ng`) as route handlers under `/api/pay/*`, backed by the existing Neon database. Products
(Tenaville, Veritory, Pursberry, PursEdu ERP) call it instead of calling Paystack.

Paystack allows **one webhook URL per mode** per account, so four products cannot each register their own. Purs Pay
receives the single webhook, works out which product owns the payment, and forwards a signed, normalised event.
The test and live webhook URLs both point at the same deployment: each event is verified against the key that signed it
and every stored row records its `mode` (`test` or `live`).

Implementers of a product integration: read [`AGENTS.md`](./AGENTS.md). Copy [`reference/purs-pay.ts`](./reference/purs-pay.ts) into the product.

## What it does

| Concern | How |
|---|---|
| Start a checkout | `POST /api/pay/transactions/initialize`. Creates reference `TNV-…` / `VRT-…` / `PRB-…` / `PEDU-…`, stores the expected amount and the mode, calls Paystack. `recurring: { planKey, seats }` makes it a monthly auto-renewing subscription and creates/reuses the fixed-amount Paystack plan on demand. Idempotent on `idempotencyKey` within a mode. |
| Receive Paystack events | `POST /api/pay/webhooks/paystack`. Verifies `x-paystack-signature` with the test or live secret (HMAC-SHA512 of the raw body), records the mode, dedupes, **re-verifies the transaction with Paystack**, checks amount and currency, then queues delivery. |
| Route to the right product | By reference prefix for our own checkouts. Subscription renewals and lifecycle events carry no reference of ours, so owners are remembered in `pay_subscriptions` (mode + customer + plan, then subscription code). Test never routes to live. |
| Deliver to the product | HMAC-SHA256 signed POST with timestamp (`x-purs-signature: t=…,v1=…`) and `x-purs-mode`, 8 s timeout, backoff 1 m, 5 m, 15 m, 1 h, 3 h, 6 h, 12 h, 24 h, then dead after 12 attempts (ops emailed). |
| Let a product read status | `GET /api/pay/transactions/:reference`, scoped to the calling product. |
| Re-send failed deliveries | `GET/POST /api/pay/jobs/retry` with `Authorization: Bearer $CRON_SECRET`. |

Events forwarded: `payment.succeeded`, `subscription.created`, `subscription.disabled`, `subscription.not_renewing`, `invoice.payment_failed`.
Every event carries `mode: "test" | "live"`. Everything else Paystack sends is recorded in `pay_events` and ignored.

Tables (`drizzle/0001_payments.sql` and `drizzle/0002_pay_plans.sql`, schema in `src/db/schema.ts`): `pay_transactions`, `pay_events`, `pay_deliveries`, `pay_subscriptions`, `pay_plans`.
All five have a `mode` column (`test` | `live`). `pay_plans` maps product + plan key + seats + currency + amount to the Paystack plan code created for it.

Safety properties: products authenticate with their own key (constant-time compare) and can only read their own transactions;
`callbackUrl` must be on the product's registered origins (no open redirect); an amount or currency mismatch is flagged `mismatch`, emailed, and
never forwarded as paid; amounts are integer kobo; a retried Paystack webhook cannot create a second delivery.

## Set up

1. **Migrate Neon**: apply `drizzle/0001_payments.sql` and `drizzle/0002_pay_plans.sql` (both idempotent) to the same database as the website, e.g. in the Neon SQL editor, or `pnpm drizzle-kit push`.
2. **Generate secrets** (one value each, never reuse): for every product `openssl rand -hex 32` for `_KEY` and again for `_WEBHOOK_SECRET`; and one for `CRON_SECRET`.
3. **Set env vars** from `.env.example` in Vercel: `PAYSTACK_MODE`, `PAYSTACK_TEST_SECRET_KEY`, `PAYSTACK_LIVE_SECRET_KEY`, `CRON_SECRET`, and the four `PAY_APP_<SLUG>_*` blocks. Give each product its `_KEY` and `_WEBHOOK_SECRET` (as `PURS_PAY_KEY` / `PURS_PAY_WEBHOOK_SECRET`). The public keys and `PAYSTACK_CALLBACK_URL` are not read by Purs Pay.
4. **Register the webhook in Paystack**: Settings → API Keys & Webhooks. Set **both** Test webhook URL and Live webhook URL to `https://www.pursandgold.com.ng/api/pay/webhooks/paystack`.
5. **Schedule the retry job** every 5 minutes (see below).
6. **Plans**: products that send `recurring` need no setup — Purs Pay creates a fixed-amount monthly Paystack plan per product, plan key, seat count and amount. Products that pass a pre-made `planCode` still have their plans created in the dashboard; those codes differ between test and live and live in the product's env.

### One deployment: test and live

The production deployment holds both secret keys and serves both modes:

- `PAYSTACK_TEST_SECRET_KEY` and `PAYSTACK_LIVE_SECRET_KEY` are both configured. Webhooks are verified against both, and the matching mode is stored on the event, transaction, subscription and delivery.
- `PAYSTACK_MODE` chooses the mode for **new** checkouts. Leave it empty: the service uses live when a live key is set, otherwise test. Set `PAYSTACK_MODE=test` to keep taking test payments after the live keys are in place.
- Status checks verify a pending transaction with the key of its own mode, so old test checkouts still work after switching to live.
- One Neon database holds both modes; every operational query can filter on `mode` (see below).

Things to keep in mind with one deployment:

- Test events are delivered to the **same** `PAY_APP_<SLUG>_WEBHOOK_URL` as live events. Products must inspect `mode` and must not grant production access from a `test` event. When a product has a staging environment, point its webhook URL there while test payments are in use.
- Do not run test-mode checkouts against products that only have production webhooks after live billing starts; switch `PAYSTACK_MODE=live` and test against product staging if needed.
- Test and live product credentials are shared (`PAY_APP_<SLUG>_*`), and so are plan codes in the product's env. Products that need both modes simultaneously must switch their own plan codes with their `PURS_PAY_URL`/mode setting.

### Retry job

Delivery is attempted immediately after each webhook (`after()`), so the job only handles failures. Options:

- **Vercel Cron** (`vercel.json`): `{ "crons": [{ "path": "/api/pay/jobs/retry", "schedule": "*/5 * * * *" }] }`. Sub-daily schedules need a Pro plan; a Hobby plan deployment will fail on this, so it is not included in the repo. Vercel sends `Authorization: Bearer $CRON_SECRET` automatically when `CRON_SECRET` is set.
- Any external scheduler (GitHub Actions, cron-job.org, a Render cron job) calling `GET /api/pay/jobs/retry` with `Authorization: Bearer $CRON_SECRET`.

### Adding a product

1. Add its slug, display name and reference prefix to `PRODUCTS` in `src/lib/payments/config.ts`.
2. Add `PAY_APP_<SLUG>_KEY`, `_WEBHOOK_URL`, `_WEBHOOK_SECRET`, `_ORIGINS` to `.env.example` and to Vercel.
3. Add the slug to the `PursPayEvent.product` union in `src/lib/payments/types.ts` and `reference/purs-pay.ts`.
4. Hand the product's agent [`AGENTS.md`](./AGENTS.md).

## Operating it

Dead or failing deliveries:

```sql
select mode, product, type, attempts, last_error, next_attempt_at, created_at
from pay_deliveries where status <> 'delivered' order by created_at desc;
```

Re-queue a dead delivery after fixing the product: `update pay_deliveries set status='pending', attempts=0, next_attempt_at=now() where id='…';` then call the retry job.

Events that could not be routed or were rejected:

```sql
select received_at, mode, type, reference, outcome, note from pay_events where outcome in ('unrouted','rejected') order by received_at desc;
```

Money that did not match: `select mode, reference, product, expected_amount_kobo, paid_amount_kobo, gateway_response from pay_transactions where status = 'mismatch';`

Add `where mode = 'live'` (or `'test'`) when you only care about real money.

Ops emails (via Resend, to `LEADS_TO_EMAIL`) are sent for: amount mismatch, unrouted event, webhook processing error, delivery given up.

Rotating a product key or webhook secret: change it on Purs Pay and in the product at the same time. There is no overlap window, so expect a brief window of `401`s; Paystack and Purs Pay retries cover missed events.

## Tests

`pnpm test:payments` runs the real migration and service logic against an in-process Postgres (PGlite) with Paystack and a product endpoint mocked.
It needs no network or keys. It covers settlement, routing (including renewals and out-of-order subscription events), signing and
verification (including tamper and replay rejection), retry/lease/dead-letter behaviour, mismatch handling and idempotency.

Not covered by the automated test: the HTTP routes against a live Neon database and a real Paystack sandbox. Run one full test-mode pass
(one-off payment, subscription, failed card, retry after a forced `500`) on the production deployment before enabling the live keys.

## Known limits

- **No cancel/manage-subscription endpoint yet.** Customers cancel through Paystack's emailed link or staff use the dashboard; products learn of it through `subscription.not_renewing` / `subscription.disabled`.
- **No refund or dispute events** are forwarded yet.
- **No rate limiting** on `/initialize` or `/transactions/:reference`. Products are trusted callers behind a bearer key; add Vercel Firewall rate limits if exposure grows.
- **Single Paystack account**: settlement goes to Purs & Gold Ltd's account. Purs Pay is for Purs & Gold's own billing (subscriptions, setup fees). It must not be used to collect money on behalf of tenants (that is the Monnify bring-your-own-keys path in Pursberry) without legal and Paystack-side review.
- **Test and live share one deployment and one database.** Every row records its `mode`, and events carry it, but test deliveries go to the same product webhook URLs as live ones. Products must ignore `mode: "test"` events in production. A separate staging deployment remains the cleaner setup if products need truly isolated test traffic.
- **Key rotation has no overlap window.**
- The retry job needs a scheduler; without one, a product that is down when an event arrives only gets it on the next manual retry.
