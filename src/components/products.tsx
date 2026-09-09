import Link from "next/link";
import type { Product } from "@/content/products";
import { Badge } from "./ui";
import { ProductIllustration } from "./illustrations";
import { productIcons, IconBadge } from "./icons";

const statusTone: Record<Product["status"], "ok" | "gold" | "navy" | "muted"> = {
  "Available now": "ok",
  "Live in Canada": "ok",
  "Early access": "gold",
  "Pilot programme": "gold",
  "In design": "navy",
  "Coming soon": "muted",
};

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-paper transition hover:-translate-y-0.5 hover:border-gold hover:shadow-[0_24px_50px_-30px_rgba(14,17,22,.5)]"
    >
      <div className="relative">
        <ProductIllustration product={product} className="aspect-[3/2] w-full" />
        <div className="absolute bottom-3 left-3">
          <IconBadge icon={productIcons[product.slug] ?? productIcons.parishhub} />
        </div>
        <div className="absolute right-3 top-3">
          <Badge tone={statusTone[product.status]}>{product.status}</Badge>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="eyebrow text-muted">{product.category}</p>
        <h3 className="mt-2 text-xl font-bold group-hover:text-gold-ink">{product.name}</h3>
        <p className="mt-2 flex-1 text-sm text-text-2">{product.headline}</p>
        <p className="mt-4 text-sm font-semibold text-gold-ink">Explore {product.name} →</p>
      </div>
    </Link>
  );
}

export { statusTone };
