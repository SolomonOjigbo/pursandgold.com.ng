import type { Metadata } from "next";
import { site } from "@/content/site";
import { Container, Section } from "@/components/ui";

export const metadata: Metadata = { title: "Privacy notice" };

export default function PrivacyPage() {
  return (
    <Section>
      <Container className="prose-tight max-w-3xl space-y-5">
        <p className="eyebrow text-gold-ink">Privacy notice</p>
        <h1 className="text-4xl font-extrabold">How we handle your data</h1>
        <p className="text-text-2">
          Purs &amp; Gold Limited processes personal data in line with the Nigeria Data Protection Act 2023. This notice covers
          the website at {site.url.replace(/^https?:\/\//, "")}.
        </p>
        <h2 className="text-2xl font-bold">What we collect</h2>
        <p>
          When you send a contact message or request a discovery call we store the details you give us: name, email, phone,
          company, the services you are interested in and your message or questionnaire answers. We do not run advertising
          trackers on this site.
        </p>
        <h2 className="text-2xl font-bold">Why we use it</h2>
        <p>To reply to you, prepare and follow up on your discovery call, and prepare a proposal if you ask for one. We do not sell or share your data with third parties except the providers that deliver these services for us: our database host and our email delivery provider.</p>
        <h2 className="text-2xl font-bold">How long we keep it</h2>
        <p>Enquiries are kept for as long as needed to respond and for up to 24 months afterwards unless you become a client, in which case your data is governed by your service agreement.</p>
        <h2 className="text-2xl font-bold">Your rights</h2>
        <p>
          You may ask to see, correct or delete the personal data we hold about you. Write to{" "}
          <a href={`mailto:${site.email}`} className="font-semibold text-gold-ink">
            {site.email}
          </a>
          .
        </p>
        <h2 className="text-2xl font-bold">Security</h2>
        <p>Data is stored in encrypted databases with access limited to staff who need it. Our own systems use multi-factor authentication, SPF, DKIM and DMARC email authentication, TLS everywhere and tested backups.</p>
      </Container>
    </Section>
  );
}
