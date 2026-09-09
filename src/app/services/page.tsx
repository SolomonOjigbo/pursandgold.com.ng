import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@/content/services";
import { lifecycle } from "@/content/process";
import { slaRows } from "@/lib/catalog";
import { Container, Section, SectionHeading, Button, Check } from "@/components/ui";
import { SlaTable } from "@/components/pricing";
import { serviceIcons, IconBadge } from "@/components/icons";

export const metadata: Metadata = {
  title: "Services",
  description: "Digital Growth Engine, web and mobile, enterprise software, sector systems, cloud and managed IT, branding and marketing, delivered through one lifecycle.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="bg-ink text-paper">
        <Container className="py-16 sm:py-20">
          <p className="eyebrow text-gold-2">Services</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">Everything digital, delivered by one accountable partner.</h1>
          <p className="mt-5 max-w-2xl text-lg text-paper/75">
            Seven service lines that are designed to work together. Buy one, or let us bundle them into a system that pays for itself.
          </p>
        </Container>
      </section>

      <Section>
        <Container className="space-y-16">
          {services.map((s, i) => (
            <article key={s.slug} id={s.slug} className="grid scroll-mt-24 gap-8 border-t border-line pt-12 first:border-t-0 first:pt-0 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <div className="flex items-center gap-3">
                  <IconBadge icon={serviceIcons[s.slug]} size="lg" />
                  <p className="font-mono text-xs text-muted">
                    {String(i + 1).padStart(2, "0")} · {s.code}
                  </p>
                </div>
                <h2 className="mt-4 text-3xl font-bold">{s.name}</h2>
                <p className="mt-4 text-text-2">{s.description}</p>
                <p className="mt-4 text-sm font-semibold">{s.soldAs}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button href={`/pricing#section-${s.catalogSections[0]}`} variant="outline-dark">
                    Prices
                  </Button>
                  <Button href={`/contact?interest=${encodeURIComponent(s.name)}`} variant="ghost">
                    Ask about {s.name} →
                  </Button>
                </div>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {s.bullets.map((b) => (
                  <li key={b} className="flex gap-2 rounded-lg border border-line bg-paper p-4 text-sm">
                    <Check />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </Container>
      </Section>

      <Section tone="ink">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading dark eyebrow="How we deliver" title="One lifecycle for every engagement" text="Nothing starts without a signed agreement and system access. Nothing goes live without your acceptance sign-off and a tested rollback plan." />
              <ol className="mt-8 grid gap-2 sm:grid-cols-2">
                {lifecycle.map((l, i) => (
                  <li key={l} className="flex items-center gap-3 rounded-md border border-line-dark bg-ink-2 px-4 py-3 text-sm">
                    <span className="font-mono text-xs text-gold-2">{String(i + 1).padStart(2, "0")}</span>
                    {l}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <SectionHeading dark eyebrow="Service levels" title="Response times you can hold us to" text="On every subscription and retainer. Monitoring runs 24/7; critical incidents are handled around the clock." />
              <div className="mt-8">
                <SlaTable rows={slaRows()} />
              </div>
              <p className="mt-4 text-sm text-paper/60">
                Website uptime target 99.5% per month.{" "}
                <Link href="/pricing#section-E" className="text-gold-2 underline-offset-4 hover:underline">
                  Managed IT retainers
                </Link>
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
