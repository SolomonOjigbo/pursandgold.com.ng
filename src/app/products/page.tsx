import type { Metadata } from "next";
import { products } from "@/content/products";
import { Container, Section, SectionHeading, Button } from "@/components/ui";
import { ProductCard } from "@/components/products";

export const metadata: Metadata = {
  title: "Software products",
  description: "ParishHub, Pursberry, Veritory, School ERP, Tenaville and the GoodHeart caregiver portal: software built by Purs & Gold for real sectors.",
};

export default function ProductsPage() {
  return (
    <>
      <section className="bg-ink text-paper">
        <Container className="py-16 sm:py-20">
          <p className="eyebrow text-gold-2">Products</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">Six products. Six sectors. Your own deployment every time.</h1>
          <p className="mt-5 max-w-2xl text-lg text-paper/75">
            We build the systems we implement. Each client runs on a dedicated environment with its own data, paid for as a
            setup fee plus a monthly subscription.
          </p>
        </Container>
      </section>
      <Section>
        <Container>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </Container>
      </Section>
      <Section tone="paper-2">
        <Container>
          <SectionHeading eyebrow="Not on the list?" title="We also implement partner platforms" text="Hospital and clinic management, hotel management, records systems for NGOs and government, and custom portals are delivered on the same lifecycle with quote-based pricing." />
          <div className="mt-8">
            <Button href="/start">Tell us what you run</Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
