import type { Metadata } from "next";
import Link from "next/link";
import { catalog, growthPlans, tables, texts, publicTexts, section, slaRows } from "@/lib/catalog";
import { Container, Section, SectionHeading, Button } from "@/components/ui";
import { PlanGrid, PriceTable, SlaTable } from "@/components/pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Transparent Naira pricing for the Digital Growth Engine, websites, cloud migration, ERP, CRM, POS, branding and marketing. Billed monthly, no yearly commitment required.",
};

const PUBLIC_SECTIONS = ["B", "C", "D", "E", "F", "G"];
const SECTION_INTRO: Record<string, string> = {
  B: "One-time builds. 70% on signing, 30% on acceptance.",
  C: "Implementation fees for ERP, CRM, POS and inventory, plus the product subscriptions behind them.",
  D: "Sector systems for hospitals, schools, hotels, parishes and institutions.",
  E: "Cloud productivity setup, email services, the managed IT retainer and its service levels.",
  F: "Creative work priced per item.",
  G: "Campaign items for clients not on a monthly plan.",
};

export default function PricingPage() {
  const plans = growthPlans();
  const a = section("A");
  const included = a?.subsections.find((s) => s.title.startsWith("Included at no extra cost"));
  return (
    <>
      <section className="bg-ink text-paper">
        <Container className="py-16 sm:py-20">
          <p className="eyebrow text-gold-2">Pricing</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">Transparent pricing. Predictable investment.</h1>
          <p className="mt-5 max-w-2xl text-lg text-paper/75">
            Every price on this page comes from one master price book, version {catalog.version?.match(/v[\d.]+/)?.[0] ?? "2.0"}.
            Prices are in Nigerian Naira and exclude taxes. Subscriptions are billed monthly with no yearly commitment
            required. Anything not listed is quoted on your business needs.
          </p>
          <nav className="mt-8 flex flex-wrap gap-2 text-sm" aria-label="Price list sections">
            <a href="#section-A" className="rounded-full border border-line-dark px-3 py-1 hover:border-gold-2 hover:text-gold-2">
              Digital Growth Engine
            </a>
            {PUBLIC_SECTIONS.map((id) => {
              const s = section(id);
              return s ? (
                <a key={id} href={`#section-${id}`} className="rounded-full border border-line-dark px-3 py-1 hover:border-gold-2 hover:text-gold-2">
                  {s.title.replace(/\s*\(.*\)$/, "")}
                </a>
              ) : null;
            })}
            <Link href="/pt#precos" className="rounded-full border border-line-dark px-3 py-1 hover:border-gold-2 hover:text-gold-2" lang="pt">
              Lista em dólares
            </Link>
          </nav>
        </Container>
      </section>

      <Section id="section-A" className="scroll-mt-20">
        <Container>
          <SectionHeading eyebrow="A · Subscription" title="Digital Growth Engine" text="A complete, fully managed digital presence and growth system. Growth is the recommended starting point for most SMEs." />
          <div className="mt-12">
            <PlanGrid plans={plans} />
          </div>
          {included ? (
            <div className="mt-10 rounded-xl border border-line bg-paper-2 p-6">
              <p className="eyebrow text-gold-ink">{included.title}</p>
              <p className="mt-2 text-sm text-text-2">{texts(included).join(" ")}</p>
            </div>
          ) : null}
          <p className="mt-6 text-sm text-text-2">
            Onboarding is paid once before work starts. Monthly fees are billed in advance. Paying 12 months upfront is
            optional and earns 10% off the fees, never a condition.
          </p>
        </Container>
      </Section>

      {PUBLIC_SECTIONS.map((id, idx) => {
        const s = section(id);
        if (!s) return null;
        const own = tables(s);
        return (
          <Section key={id} id={`section-${id}`} tone={idx % 2 === 0 ? "paper-2" : "paper"} className="scroll-mt-20">
            <Container>
              <SectionHeading eyebrow={`${id} · ${s.title.match(/\((.*)\)$/)?.[1] ?? ""}`} title={s.title.replace(/\s*\(.*\)$/, "")} text={SECTION_INTRO[id]} />
              {publicTexts(s).length ? <p className="mt-6 max-w-3xl text-sm text-text-2">{publicTexts(s)[0]}</p> : null}
              <div className="mt-8 space-y-6">
                {own.map((t, i) => (
                  <PriceTable key={i} block={t} caption={s.title} />
                ))}
              </div>
              {s.subsections.map((sub) => {
                const subTables = tables(sub);
                const hasPublic = subTables.some((t) => t.items.some((r) => r.status === "Confirmed"));
                if (!hasPublic && sub.id !== "E4") return null;
                return (
                  <div key={sub.title} className="mt-12">
                    <h3 className="text-xl font-bold">{sub.title.replace(/\s*\(.*\)$/, "")}</h3>
                    {publicTexts(sub).length ? <p className="mt-2 max-w-3xl text-sm text-text-2">{publicTexts(sub)[0]}</p> : null}
                    <div className="mt-5 space-y-6">
                      {sub.id === "E4" ? <SlaTable rows={slaRows()} /> : subTables.map((t, i) => <PriceTable key={i} block={t} caption={sub.title} />)}
                    </div>
                  </div>
                );
              })}
            </Container>
          </Section>
        );
      })}

      <section className="bg-navy text-paper">
        <Container className="flex flex-col items-start gap-6 py-14 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Not sure which plan fits?</h2>
            <p className="mt-1 text-paper/75">A discovery call ends with a diagnostic and a recommendation, at no cost.</p>
          </div>
          <Button href="/start">Book a discovery call</Button>
        </Container>
      </section>
    </>
  );
}
