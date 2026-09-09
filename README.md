# pursandgold.com.ng

Company website for Purs & Gold Limited. Next.js App Router, Tailwind CSS, Neon Postgres (leads), Resend (notifications), deployed on Vercel.

## One content source for prices

`content/price-book.md` is a copy of the master Services & Product Catalog. `pnpm sync:catalog` parses it into `src/generated/catalog.json`, which every pricing page reads. Only rows marked **Confirmed** are rendered; Proposed, Decision and Retire rows and their notes stay internal. Never type a price into a page: edit the price book, re-run the sync (it also runs before every build).

## Develop

```bash
pnpm install
cp .env.example .env.local   # fill in DATABASE_URL and RESEND_API_KEY for lead capture
pnpm dev
```

Without `DATABASE_URL` and `RESEND_API_KEY` the forms still validate and respond, but nothing is stored or emailed.

## Database

Create a Neon project, set `DATABASE_URL`, then apply `drizzle/0000_init.sql` (or `pnpm drizzle-kit push`). Tables: `leads` (contact form) and `discovery_requests` (discovery call questionnaire).

## Deploy

Import the repository into Vercel. Set `DATABASE_URL`, `RESEND_API_KEY`, `LEADS_TO_EMAIL`, `LEADS_FROM_EMAIL` and `NEXT_PUBLIC_SITE_URL`. Verify `pursandgold.com.ng` in Resend so notifications send from the company domain. Redirects from the old WordPress URLs live in `next.config.ts`.

## Structure

- `src/content/` company facts, services, products, industries, process copy
- `src/lib/catalog.ts` typed access to the generated price book
- `src/components/` header, footer, pricing tables, product cards, forms
- `src/app/actions/leads.ts` server actions for both forms
- `src/app/pt/` Portuguese landing page with the US-dollar list for Lusophone markets
