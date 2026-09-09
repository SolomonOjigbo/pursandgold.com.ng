import type { Metadata } from "next";
import { steps } from "@/content/process";
import { Container, Section, SectionHeading } from "@/components/ui";
import { DiscoveryForm } from "@/components/forms";

export const metadata: Metadata = {
  title: "Book a discovery call",
  description: "Start with a free discovery call. Answer a few questions so we arrive with a diagnostic and a recommendation.",
};

export default async function StartPage({ searchParams }: PageProps<"/start">) {
  const sp = await searchParams;
  const plan = typeof sp.plan === "string" ? sp.plan : undefined;
  return (
    <>
      <section className="bg-ink text-paper">
        <Container className="py-14 sm:py-16">
          <p className="eyebrow text-gold-2">Discovery call</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">Tell us about your business. We come back with a plan.</h1>
          <p className="mt-4 max-w-2xl text-paper/75">
            Free, no obligation. The answers below drive our diagnostic so the call is about your decisions, not our questions.
            {plan ? ` You are starting from the ${plan} plan.` : ""}
          </p>
        </Container>
      </section>
      <Section>
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <SectionHeading eyebrow="What happens next" title="Four steps to launch" />
            <ol className="mt-8 space-y-4">
              {steps.map((s) => (
                <li key={s.n} className="flex gap-4">
                  <span className="font-mono text-sm text-gold-ink">0{s.n}</span>
                  <div>
                    <p className="font-semibold">{s.title}</p>
                    <p className="text-sm text-text-2">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-2xl border border-line bg-paper-2 p-6 sm:p-8">
            <DiscoveryForm plan={plan} />
          </div>
        </Container>
      </Section>
    </>
  );
}
