import type { Metadata } from "next";
import { site } from "@/content/site";
import { Container, Section, SectionHeading, Button, Check } from "@/components/ui";
import { proofIcons, IconBadge } from "@/components/icons";

export const metadata: Metadata = {
  title: "About",
  description: "Purs & Gold Limited is a Lagos-based digital transformation partner led by a pharmaceutical chemist turned systems architect.",
};

const roles = [
  ["Solution Architect", "Business audit, solution design, pricing and cross-service integration. Signs off every proposal."],
  ["Backend / ERP Engineer", "ERP and CRM configuration, APIs and data migration."],
  ["Frontend / Web Developer", "Websites, portals, UI and performance."],
  ["IT Support Engineer", "Cloud migrations, hardware, security hardening, monitoring and helpdesk."],
  ["Digital Marketer", "Social, content, paid ads, SEO and analytics reporting."],
];

const kpis = [
  ["98%+", "project success rate"],
  ["< 2 hours", "downtime during a cutover"],
  ["4.5 / 5", "client satisfaction target"],
  ["< 4 hours", "hypercare resolution"],
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-ink text-paper">
        <Container className="py-16 sm:py-20">
          <p className="eyebrow text-gold-2">About Purs &amp; Gold</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">One accountable partner for everything digital.</h1>
          <p className="mt-5 max-w-2xl text-lg text-paper/75">
            Purs &amp; Gold Limited is a Lagos-based digital transformation partner for small, mid-size and enterprise
            organisations in Nigeria, with a growing presence in Portuguese-speaking Africa and a caregiver platform live in Canada.
          </p>
        </Container>
      </section>

      <Section>
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow={`Since ${site.founded}`} title="Give African organisations one partner for presence, productivity, operations and protection." text={site.story} />
            <blockquote className="mt-8 border-l-4 border-gold bg-paper-2 p-5 text-lg font-medium">
              {site.principle}
            </blockquote>
            <ul className="mt-8 space-y-3 text-sm">
              {site.compliance.map((c) => (
                <li key={c} className="flex gap-2">
                  <Check />
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-6">
            {site.leadership.map((l) => (
              <article key={l.name} className="flex gap-5 rounded-xl border border-line bg-paper p-6">
                <span
                  className="display flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-ink text-xl font-extrabold text-gold-2 ring-2 ring-gold"
                  aria-hidden="true"
                >
                  {l.name
                    .split(" ")
                    .filter((w) => /^[A-Z]/.test(w))
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")}
                </span>
                <div>
                <p className="eyebrow text-gold-ink">{l.role}</p>
                <h2 className="mt-1 text-2xl font-bold">{l.name}</h2>
                <p className="mt-3 text-sm text-text-2">{l.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="paper-2">
        <Container>
          <SectionHeading eyebrow="Track record" title="Industry platforms we have built or transformed" />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {site.proof.map((p, i) => (
              <div key={p.title} className="rounded-xl border border-line bg-paper p-6">
                <IconBadge icon={proofIcons[i]} />
                <h3 className="mt-4 text-lg font-bold">{p.title}</h3>
                <p className="mt-2 text-sm text-text-2">{p.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="ink">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading dark eyebrow="Team" title="A lean, specialised team" text="Every role has clear ownership across the service lifecycle." />
            <ul className="mt-8 divide-y divide-line-dark">
              {roles.map(([role, text]) => (
                <li key={role} className="py-3">
                  <p className="font-semibold">{role}</p>
                  <p className="text-sm text-paper/70">{text}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading dark eyebrow="Accountability" title="The numbers we hold ourselves to" />
            <dl className="mt-8 grid grid-cols-2 gap-4">
              {kpis.map(([v, l]) => (
                <div key={l} className="rounded-xl border border-line-dark bg-ink-2 p-5">
                  <dt className="text-sm text-paper/60">{l}</dt>
                  <dd className="mt-1 text-3xl font-bold text-gold-2">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8">
              <Button href="/start">Work with us</Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
