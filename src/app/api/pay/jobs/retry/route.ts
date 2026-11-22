import { timingSafeEqual } from "node:crypto";
import { getDb } from "@/lib/db";
import { attemptDelivery, dueDeliveryIds } from "@/lib/payments/deliver";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Re-sends event deliveries that failed or never started. Run it every few minutes:
 *  - Vercel Cron (Pro) sends `Authorization: Bearer $CRON_SECRET` automatically, or
 *  - any scheduler (cron-job.org, GitHub Actions, Render cron) can call it with the same header.
 */
async function run(request: Request) {
  const secret = process.env.CRON_SECRET;
  const presented = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const ok = !!secret && presented.length === secret.length && timingSafeEqual(Buffer.from(presented), Buffer.from(secret));
  if (!ok) return new Response("unauthorized", { status: 401 });

  const db = getDb();
  if (!db) return Response.json({ error: "payments_not_configured" }, { status: 503 });

  const ids = await dueDeliveryIds(db, 25);
  let delivered = 0;
  for (let i = 0; i < ids.length; i += 5) {
    const results = await Promise.all(ids.slice(i, i + 5).map((id) => attemptDelivery(db, id).catch(() => false)));
    delivered += results.filter(Boolean).length;
  }
  return Response.json({ due: ids.length, delivered });
}

export const GET = run;
export const POST = run;
