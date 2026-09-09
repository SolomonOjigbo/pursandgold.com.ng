import Link from "next/link";
import { site } from "@/content/site";
import { services } from "@/content/services";
import { products } from "@/content/products";
import { steps, integrations } from "@/content/process";
import { growthPlans } from "@/lib/catalog";
import { Container, Section, SectionHeading, Button, Check } from "@/components/ui";
import { ProductCard } from "@/components/products";
import { PlanGrid } from "@/components/pricing";
import { promiseIcons, serviceIcons, stepIcons, IconBadge } from "@/components/icons";
import { SystemMap } from "@/components/illustrations";

export default function HomePage() {
  const plans = growthPlans().filter((p) => ["DGE-STR", "DGE-GRW", "DGE-SCL"].includes(p.code));
  const featured = products.filter((p) => ["parishhub", "pursberry", "veritory"].includes(p.slug));
  return (
    <>
      {/* Hero */}
      <section className="grid-bg relative overflow-hidden bg-ink text-paper">
        <div className="glow pointer-events-none absolute inset-0" aria-hidden="true" />
        <Container className="relative py-20 sm:py-28">
          <div className="grid items-end gap-12 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="eyebrow text-gold-2">Purs &amp; Gold Limited · Lagos, Nigeria</p>
              <h1 className="mt-4 text-5xl font-extrabold leading-[1.02] sm:text-6xl lg:text-7xl">
                Digital Solutions.
                <br />
                <span className="text-gold-2">Real Growth.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-paper/80">
                One partner for your website, email, marketing, ERP and IT. Predictable monthly cost, enterprise-grade
                security, and results you can measure every month.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/start">Book a free discovery call</Button>
                <Button href="/pricing" variant="outline">
                  See plans and prices
                </Button>
              </div>
              <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-paper/70">
                <li>Nigeria Pharmaceutical Directory</li>
                <li>Pharmanews Limited</li>
                <li>ParishHub, Pursberry &amp; Veritory</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-line-dark bg-ink-2/80 p-6 shadow-2xl">
              <p className="eyebrow text-gold-2">The transformation</p>
              <ul className="mt-4 divide-y divide-line-dark text-sm">
                {[
                  ["Reactive, fix it when it breaks", "Proactive, prevented before it stops you"],
                  ["Spreadsheets and manual notes", "Real-time dashboards and AI analytics"],
                  ["Marketing as an expense", "Marketing as trackable investment"],
                  ["Antivirus and manual backups", "MFA, encryption and tested cloud backups"],
                  ["Five vendors, no accountability", "One partner, full accountability"],
                ].map(([before, after]) => (
                  <li key={after} className="grid grid-cols-2 gap-4 py-3">
                    <span className="text-paper/45 line-through decoration-paper/30">{before}</span>
                    <span className="font-medium text-paper">{after}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Promises */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="What we do"
            title="A fully integrated digital business system"
            text={site.principle}
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {site.promises.map((p, i) => (
              <div key={p.title} className="rounded-xl border border-line bg-paper p-6">
                <IconBadge icon={promiseIcons[i]} />
                <h3 className="mt-4 text-lg font-bold">{p.title}</h3>
                <p className="mt-2 text-sm text-text-2">{p.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Services */}
      <Section tone="paper-2" id="services">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="Services" title="Seven service lines, one lifecycle" text="Every engagement runs through the same discovery, design, build, test, train and hypercare process." />
            <Button href="/services" variant="outline-dark">
              All services
            </Button>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <Link
                key={s.slug}
                href={`/services#${s.slug}`}
                className="group rounded-xl border border-line bg-paper p-6 transition hover:border-gold"
              >
                <div className="flex items-center justify-between">
                  <IconBadge icon={serviceIcons[s.slug]} />
                  <p className="font-mono text-xs text-muted">{s.code}</p>
                </div>
                <h3 className="mt-4 text-lg font-bold group-hover:text-gold-ink">{s.name}</h3>
                <p className="mt-2 text-sm text-text-2">{s.short}</p>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* Pricing teaser */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Digital Growth Engine"
            title="Predictable. Secure. Profitable. Always On."
            text="A complete, fully managed digital presence on one monthly plan. Billed monthly, no yearly commitment required."
          />
          <div className="mt-12">
            <PlanGrid plans={plans} />
          </div>
          <p className="mt-6 text-sm text-text-2">
            Also available: a Social Starter plan for micro businesses and an Enterprise plan with ad budget included.{" "}
            <Link href="/pricing" className="font-semibold text-gold-ink underline-offset-4 hover:underline">
              See all plans and the full price list
            </Link>
            .
          </p>
        </Container>
      </Section>

      {/* Products */}
      <Section tone="ink">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading dark eyebrow="Our software" title="Built for how Nigerian organisations actually run" text="Six products, one per sector, each deployed as your own environment with your own data." />
            <Button href="/products" variant="outline">
              All products
            </Button>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {featured.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Integration */}
      <Section tone="paper-2">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading
                eyebrow="Why one partner"
                title="Integration is the advantage"
                text="Systems that talk to each other remove the manual work between them. We assess every client for these links."
              />
              <SystemMap className="mt-8 w-full max-w-md text-text" />
            </div>
            <ul className="space-y-3">
              {integrations.map((i) => (
                <li key={i.pair} className="flex gap-3 rounded-lg border border-line bg-paper p-4">
                  <Check />
                  <div>
                    <p className="font-semibold">{i.pair}</p>
                    <p className="text-sm text-text-2">{i.enables}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {/* Process */}
      <Section>
        <Container>
          <SectionHeading eyebrow="How it works" title="From first call to launch in as little as two weeks" />
          <ol className="mt-12 grid gap-6 md:grid-cols-4">
            {steps.map((s) => (
              <li key={s.n} className="relative rounded-xl border border-line bg-paper p-6">
                <div className="flex items-center justify-between">
                  <IconBadge icon={stepIcons[s.n - 1]} />
                  <p className="font-mono text-xs text-muted">Step {s.n}</p>
                </div>
                <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-text-2">{s.text}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">{s.duration}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* CTA */}
      <section className="bg-navy text-paper">
        <Container className="flex flex-col items-start gap-6 py-16 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Stop managing vendors. Start growing.</h2>
            <p className="mt-2 text-paper/75">A free discovery call, no obligation. We come back with a diagnostic and a recommendation.</p>
          </div>
          <div className="flex gap-3">
            <Button href="/start">Book a discovery call</Button>
            <Button href={site.whatsapp} variant="outline">
              WhatsApp us
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
