import type { Metadata } from "next";
import Link from "next/link";
import { industries } from "@/content/industries";
import { getProduct } from "@/content/products";
import { getService } from "@/content/services";
import { Container, Section, SectionHeading, Button } from "@/components/ui";
import { industryIcons, IconBadge } from "@/components/icons";

export const metadata: Metadata = {
  title: "Industries",
  description: "Pharmaceutical, retail, healthcare, education, parishes, NGOs and hospitality: how Purs & Gold serves each sector.",
};

export default function IndustriesPage() {
  return (
    <>
      <section className="bg-ink text-paper">
        <Container className="py-16 sm:py-20">
          <p className="eyebrow text-gold-2">Industries</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">We know how your sector actually works.</h1>
          <p className="mt-5 max-w-2xl text-lg text-paper/75">
            Our founder is a pharmaceutical chemist turned systems architect. Every product we build starts from the
            workflow of a real organisation in that sector.
          </p>
        </Container>
      </section>
      <Section>
        <Container className="grid gap-6 md:grid-cols-2">
          {industries.map((ind) => (
            <article key={ind.slug} id={ind.slug} className="flex flex-col rounded-xl border border-line bg-paper p-6">
              <IconBadge icon={industryIcons[ind.slug]} size="lg" />
              <h2 className="mt-4 text-2xl font-bold">{ind.name}</h2>
              <ul className="mt-4 space-y-1 text-sm text-text-2">
                {ind.pains.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="text-gold-ink">·</span>
                    {p}
                  </li>
                ))}
              </ul>
              <p className="mt-4 flex-1 text-sm">{ind.answer}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {ind.products.map((slug) => {
                  const p = getProduct(slug);
                  return p ? (
                    <Link key={slug} href={`/products/${slug}`} className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-paper hover:bg-navy">
                      {p.name}
                    </Link>
                  ) : null;
                })}
                {ind.services.map((slug) => {
                  const s = getService(slug);
                  return s ? (
                    <Link key={slug} href={`/services#${slug}`} className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-text-2 hover:border-gold-ink hover:text-gold-ink">
                      {s.name}
                    </Link>
                  ) : null;
                })}
              </div>
            </article>
          ))}
        </Container>
      </Section>
      <Section tone="paper-2">
        <Container>
          <SectionHeading eyebrow="Your sector" title="Not listed?" text="The lifecycle, security baseline and pricing rules are the same for every client. Tell us what you run." />
          <div className="mt-6">
            <Button href="/start">Book a discovery call</Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
