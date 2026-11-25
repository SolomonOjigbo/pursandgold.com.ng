import { and, eq } from "drizzle-orm";
import { payPlans } from "@/db/schema";
import { PRODUCTS, type ProductSlug } from "./config";
import { createPlan, type PaystackMode } from "./paystack";
import type { Db } from "./transactions";

export type RecurringPlanInput = {
  product: ProductSlug;
  mode: PaystackMode;
  /** The product's own plan id, e.g. `starter`. */
  planKey: string;
  seats: number;
  currency: string;
  /** What the customer is billed every month, in minor units. */
  amountKobo: number;
};

/**
 * Returns the Paystack plan code for a monthly recurring charge, creating the plan on first use.
 * Paystack plans are fixed-amount and carry no quantity, so seats and amount are part of the plan's identity:
 * a price or seat change yields its own plan instead of silently billing a stale amount.
 */
export async function ensureMonthlyPlan(db: Db, input: RecurringPlanInput): Promise<string> {
  const existing = await findPlan(db, input);
  if (existing) return existing;

  const plan = await createPlan(
    {
      name: `${PRODUCTS[input.product].name} ${input.planKey} - ${input.seats} seat${input.seats === 1 ? "" : "s"}`,
      amount: input.amountKobo,
      interval: "monthly",
      currency: input.currency,
    },
    input.mode,
  );

  const [inserted] = await db
    .insert(payPlans)
    .values({
      product: input.product,
      mode: input.mode,
      planKey: input.planKey,
      seats: input.seats,
      currency: input.currency,
      amountKobo: input.amountKobo,
      planCode: plan.plan_code,
    })
    .onConflictDoNothing()
    .returning({ planCode: payPlans.planCode });
  if (inserted) return inserted.planCode;

  // Lost a race to another request for the same plan: use its code; ours stays unused on Paystack.
  const winner = await findPlan(db, input);
  if (!winner) throw new Error("pay_plans row disappeared after a conflict");
  return winner;
}

async function findPlan(db: Db, input: RecurringPlanInput): Promise<string | null> {
  const [row] = await db
    .select({ planCode: payPlans.planCode })
    .from(payPlans)
    .where(
      and(
        eq(payPlans.mode, input.mode),
        eq(payPlans.product, input.product),
        eq(payPlans.planKey, input.planKey),
        eq(payPlans.seats, input.seats),
        eq(payPlans.currency, input.currency),
        eq(payPlans.amountKobo, input.amountKobo),
      ),
    )
    .limit(1);
  return row?.planCode ?? null;
}
