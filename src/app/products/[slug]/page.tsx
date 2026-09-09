import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { products, getProduct } from "@/content/products";
import { findByCode } from "@/lib/catalog";
import { Container, Section, SectionHeading, Button, Badge, Check } from "@/components/ui";
import { statusTone } from "@/components/products";
import { ProductIllustration } from "@/components/illustrations";
import { productIcons, IconBadge } from "@/components/icons";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  return { title: p.name, description: p.headline };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const priceRows = product.catalogCodes.map(findByCode).filter((r): r is NonNullable<typeof r> => Boolean(r));
  return (
    <>
      <section className="bg-ink text-paper">
        <Container className="grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <IconBadge icon={productIcons[product.slug] ?? productIcons.parishhub} dark />
              <p className="eyebrow text-gold-2">{product.category}</p>
              <Badge tone={statusTone[product.status]}>{product.status}</Badge>
            </div>
            <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">{product.name}</h1>
            <p className="mt-4 text-xl text-paper/85">{product.headline}</p>
            <p className="mt-4 max-w-xl text-paper/70">{product.audience}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={`/contact?interest=${encodeURIComponent(product.name)}`}>Request a demo</Button>
              <Button href="/products" variant="outline">
                All products
              </Button>
            </div>
          </div>
          <ProductIllustration product={product} className="w-full rounded-2xl shadow-2xl ring-1 ring-line-dark" />
        </Container>
      </section>

      <Section>
        <Container className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <SectionHeading eyebrow="What it does" title="Modules" />
            <p className="mt-4 max-w-2xl text-text-2">{product.summary}</p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {product.modules.map((m) => (
                <li key={m} className="flex gap-2 rounded-lg border border-line bg-paper p-4 text-sm">
                  <Check />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
          <aside className="space-y-6">
            <div className="rounded-xl border border-line bg-paper-2 p-6">
              <p className="eyebrow text-gold-ink">Why it is different</p>
              <ul className="mt-4 space-y-3 text-sm">
                {product.differentiators.map((d) => (
                  <li key={d} className="flex gap-2">
                    <Check />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-line bg-paper p-6">
              <p className="eyebrow text-gold-ink">Delivery</p>
              <p className="mt-2 text-sm">{product.delivery}</p>
              <p className="eyebrow mt-6 text-gold-ink">Pricing</p>
              <p className="mt-2 text-sm">{product.pricing}</p>
              {priceRows.length ? (
                <ul className="mt-4 divide-y divide-line text-sm">
                  {priceRows.map((r) => {
                    const label = r.Item ?? r.Plan ?? r.Package ?? r.Code ?? "";
                    const value = r.Price ?? r["Monthly fee"] ?? r.Starter ?? "Quote-based";
                    const short = value.length <= 40;
                    return (
                      <li key={r.Code} className={`py-2.5 ${short ? "flex items-start justify-between gap-4" : ""}`}>
                        <span className="text-text-2">{label}</span>
                        <span className={short ? "text-right font-semibold" : "mt-1 block text-text"}>{value}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          </aside>
        </Container>
      </Section>

      <section className="bg-navy text-paper">
        <Container className="flex flex-col items-start gap-6 py-14 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">See {product.name} on your own data</h2>
            <p className="mt-1 text-paper/75">Book a discovery call and we will scope a deployment for your organisation.</p>
          </div>
          <Button href={`/start`}>Book a discovery call</Button>
        </Container>
      </section>
    </>
  );
}
