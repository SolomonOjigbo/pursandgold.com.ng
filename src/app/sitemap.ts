import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { products } from "@/content/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const base = site.url;
  const routes = ["", "/services", "/products", "/pricing", "/industries", "/about", "/contact", "/start", "/pt", "/privacy", "/terms"];
  return [
    ...routes.map((r) => ({ url: `${base}${r}`, lastModified: now, changeFrequency: "monthly" as const, priority: r === "" ? 1 : 0.7 })),
    ...products.map((p) => ({ url: `${base}/products/${p.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
