import Image from "next/image";
import type { Product } from "@/content/products";

/**
 * A product's own wordmark, on a dark or light surface. The brand kits ship one file per
 * theme because the lettering changes colour; the artwork itself is identical.
 * Where only a light-surface version exists, `plateOnDark` sets it on a white card rather
 * than recolouring someone else's artwork.
 * Products with no kit render nothing, and the caller keeps its own name treatment.
 * `className` positions the logo; sizing belongs here so every kit lands at a similar weight.
 */
export function ProductLogo({
  product,
  on,
  className = "",
}: {
  product: Product;
  on: "dark" | "light";
  className?: string;
}) {
  const logo = product.logo;
  if (!logo) return null;
  const plated = Boolean(logo.plateOnDark) && on === "dark";
  const img = (
    <Image
      src={on === "dark" ? logo.dark : logo.light}
      alt={product.name}
      width={logo.width}
      height={logo.height}
      unoptimized
      priority
      className={plated ? "h-full w-auto" : "h-24 w-auto max-w-[300px] object-contain"}
    />
  );
  if (!plated) return <div className={className}>{img}</div>;
  return (
    <div className={className}>
      <span className="inline-flex h-24 items-center rounded-xl bg-white px-5 py-3.5 shadow-lg">{img}</span>
    </div>
  );
}
