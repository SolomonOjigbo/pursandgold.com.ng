import type { Metadata } from "next";
import Link from "next/link";
import { Container, Section } from "@/components/ui";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <Section>
      <Container className="prose-tight max-w-3xl space-y-5">
        <p className="eyebrow text-gold-ink">Terms</p>
        <h1 className="text-4xl font-extrabold">Website terms and commercial basics</h1>
        <p className="text-text-2">Prices shown on this website are in Nigerian Naira unless stated otherwise, exclude applicable taxes, and are indicative until confirmed in a written proposal.</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Subscriptions and retainers are billed monthly in advance. Paying twelve months upfront is optional and earns 10% off subscription fees.</li>
          <li>One-time projects are payable 70% on signing and 30% on acceptance sign-off.</li>
          <li>Onboarding fees are payable in full before work begins and are non-refundable once services commence.</li>
          <li>Hardware, third-party licences, hosting beyond a plan, ad spend beyond an included budget and API fees are billed separately.</li>
          <li>Every engagement is governed by a signed service agreement and, for subscriptions, a service level agreement. Those documents prevail over this page.</li>
        </ul>
        <p>
          Questions? <Link href="/contact" className="font-semibold text-gold-ink">Contact us</Link>.
        </p>
      </Container>
    </Section>
  );
}
