import type { Metadata } from "next";
import { site } from "@/content/site";
import { Container, Section, SectionHeading } from "@/components/ui";
import { LeadForm } from "@/components/forms";
import { Mail, Phone, MessageCircle, MapPin } from "@/components/icons";

export const metadata: Metadata = { title: "Contact", description: "Talk to Purs & Gold about websites, marketing, ERP, cloud and managed IT." };

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const sp = await searchParams;
  const interest = typeof sp.interest === "string" ? sp.interest : undefined;
  return (
    <Section>
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <SectionHeading eyebrow="Contact" title="Let's talk about your business." text="Email, call or WhatsApp, or send the form and we reply within one business day." />
          <dl className="mt-8 space-y-5 text-sm">
            <div>
              <dt className="eyebrow flex items-center gap-2 text-muted"><Mail className="h-3.5 w-3.5 text-gold-ink" aria-hidden="true" /> Email</dt>
              <dd className="mt-1">
                <a href={`mailto:${site.email}`} className="font-semibold text-gold-ink hover:underline">
                  {site.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="eyebrow flex items-center gap-2 text-muted"><Phone className="h-3.5 w-3.5 text-gold-ink" aria-hidden="true" /> Phone</dt>
              <dd className="mt-1 space-y-1">
                <a href={`tel:${site.phones.primary.tel}`} className="block font-semibold hover:text-gold-ink">
                  {site.phones.primary.display}
                </a>
                {site.phones.secondary.map((p) => (
                  <a key={p.tel} href={`tel:${p.tel}`} className="block hover:text-gold-ink">
                    {p.display}
                  </a>
                ))}
              </dd>
            </div>
            <div>
              <dt className="eyebrow flex items-center gap-2 text-muted"><MessageCircle className="h-3.5 w-3.5 text-gold-ink" aria-hidden="true" /> WhatsApp</dt>
              <dd className="mt-1">
                <a href={site.whatsapp} className="font-semibold text-gold-ink hover:underline">
                  Message us on WhatsApp
                </a>
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-muted">Cabo Verde e mercados lusófonos</dt>
              <dd className="mt-1">
                <a href={site.whatsappPt} className="hover:text-gold-ink" lang="pt">
                  {site.phones.lusophone.display} (WhatsApp)
                </a>
              </dd>
            </div>
            {site.offices.map((o) => (
              <div key={o.city}>
                <dt className="eyebrow flex items-center gap-2 text-muted"><MapPin className="h-3.5 w-3.5 text-gold-ink" aria-hidden="true" /> {o.city} office</dt>
                <dd className="mt-1">
                  {o.address}
                  <br />
                  <a href={`tel:${o.phone.tel}`} className="hover:text-gold-ink">
                    {o.phone.display}
                  </a>
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="rounded-2xl border border-line bg-paper-2 p-6 sm:p-8">
          <LeadForm interest={interest} />
        </div>
      </Container>
    </Section>
  );
}
