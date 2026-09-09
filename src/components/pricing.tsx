import Link from "next/link";
import type { CatalogItem, TableBlock, Plan } from "@/lib/catalog";
import { publicItems } from "@/lib/catalog";
import { Check } from "./ui";
import { planIcons, IconBadge } from "./icons";

export function PlanGrid({ plans, currency = "₦" }: { plans: Plan[]; currency?: string }) {
  return (
    <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]">
      {plans.map((plan) => (
        <article
          key={plan.code}
          className={`relative flex flex-col rounded-xl border p-6 ${
            plan.recommended ? "border-gold bg-ink text-paper shadow-[0_20px_60px_-30px_rgba(212,160,23,.6)]" : "border-line bg-paper"
          }`}
        >
          {plan.recommended ? (
            <span className="absolute -top-3 left-6 rounded-full bg-gold px-3 py-1 text-[0.68rem] font-bold uppercase tracking-wider text-ink">
              Recommended
            </span>
          ) : null}
          <div className="flex items-center justify-between">
            {planIcons[plan.code] ? <IconBadge icon={planIcons[plan.code]} dark={plan.recommended} /> : null}
            <p className={`font-mono text-xs ${plan.recommended ? "text-paper/60" : "text-muted"}`}>{plan.code}</p>
          </div>
          <h3 className="mt-4 text-2xl font-bold">{plan.name}</h3>
          <p className="mt-4 text-3xl font-bold tracking-tight">
            {plan.monthly}
            <span className={`ml-1 text-sm font-medium ${plan.recommended ? "text-paper/60" : "text-muted"}`}>/month</span>
          </p>
          <p className={`mt-1 text-sm ${plan.recommended ? "text-paper/70" : "text-text-2"}`}>Onboarding {plan.onboarding}, once.</p>
          <ul className="mt-6 flex-1 space-y-2.5 text-sm">
            {plan.inclusions.map((inc) => (
              <li key={inc.label} className="flex gap-2">
                <Check />
                <span>
                  {inc.label}
                  {inc.value !== "Yes" ? <span className={plan.recommended ? "text-paper/60" : "text-muted"}> · {inc.value}</span> : null}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href={`/start?plan=${plan.code}`}
            className={`mt-6 inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold transition ${
              plan.recommended ? "bg-gold text-ink hover:bg-gold-2" : "border border-line-dark/30 text-text hover:border-gold-ink hover:text-gold-ink"
            }`}
          >
            Start with {plan.name}
          </Link>
          {plan.prepay ? (
            <p className={`mt-3 text-xs ${plan.recommended ? "text-paper/55" : "text-muted"}`}>
              Optional: {plan.prepay} for 12 months paid upfront (10% off fees).
            </p>
          ) : null}
          <span className="sr-only">{currency}</span>
        </article>
      ))}
    </div>
  );
}

/** Renders a catalog table with only Confirmed rows and no internal notes. */
export function PriceTable({ block, hideCode = false, caption }: { block: TableBlock; hideCode?: boolean; caption?: string }) {
  const rows = publicItems(block);
  if (rows.length === 0) return null;
  const columns = block.columns.filter((c) => !(hideCode && c === "Code"));
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-paper">
      <table className="w-full text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="bg-paper-2 text-left">
            {columns.map((c) => (
              <th key={c} scope="col" className="eyebrow whitespace-nowrap px-4 py-3 text-muted">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={(row.Code ?? "") + i} className="border-t border-line align-top">
              {columns.map((c, j) => (
                <td key={c} className={`px-4 py-3 ${j === 0 ? "font-semibold" : ""} ${c === "Code" ? "font-mono text-xs text-muted" : ""}`}>
                  {row[c] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SlaTable({ rows }: { rows: CatalogItem[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line-dark bg-ink-2">
      <table className="w-full text-sm text-paper">
        <thead>
          <tr className="text-left">
            {["Priority", "Response", "Resolution target"].map((c) => (
              <th key={c} scope="col" className="eyebrow px-4 py-3 text-gold-2">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.Priority} className="border-t border-line-dark">
              <td className="px-4 py-3 font-semibold">{r.Priority}</td>
              <td className="px-4 py-3 text-paper/85">{r.Response}</td>
              <td className="px-4 py-3 text-paper/85">{r["Resolution target"]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
