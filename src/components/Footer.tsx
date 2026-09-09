import Link from "next/link";
import { site } from "@/content/site";
import { services } from "@/content/services";
import { products } from "@/content/products";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line-dark bg-ink text-paper/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="display text-lg font-bold text-paper">Purs &amp; Gold Limited</p>
          <p className="mt-2 max-w-sm text-sm text-paper/70">{site.principle}</p>
          <ul className="mt-6 space-y-1 text-sm">
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-gold-2">
                {site.email}
              </a>
            </li>
            <li>
              <a href={`tel:${site.phones.primary.tel}`} className="hover:text-gold-2">
                {site.phones.primary.display}
              </a>
              <span className="text-paper/50"> · </span>
              {site.phones.secondary.map((p, i) => (
                <span key={p.tel}>
                  <a href={`tel:${p.tel}`} className="hover:text-gold-2">
                    {p.display}
                  </a>
                  {i < site.phones.secondary.length - 1 ? <span className="text-paper/50"> · </span> : null}
                </span>
              ))}
            </li>
            <li>
              <span className="text-paper/60">Lusophone markets: </span>
              <a href={site.whatsappPt} className="hover:text-gold-2">
                {site.phones.lusophone.display} (WhatsApp)
              </a>
            </li>
            {site.offices.map((o) => (
              <li key={o.city} className="text-paper/60">
                <span className="text-paper/80">{o.city}:</span> {o.address}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow text-gold-2">Services</p>
          <ul className="mt-3 space-y-2 text-sm">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services#${s.slug}`} className="hover:text-gold-2">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow text-gold-2">Products</p>
          <ul className="mt-3 space-y-2 text-sm">
            {products.map((p) => (
              <li key={p.slug}>
                <Link href={`/products/${p.slug}`} className="hover:text-gold-2">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow text-gold-2">Company</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-gold-2">About</Link></li>
            <li><Link href="/pricing" className="hover:text-gold-2">Pricing</Link></li>
            <li><Link href="/industries" className="hover:text-gold-2">Industries</Link></li>
            <li><Link href="/start" className="hover:text-gold-2">Book a discovery call</Link></li>
            <li><Link href="/contact" className="hover:text-gold-2">Contact</Link></li>
            <li><Link href="/pt" className="hover:text-gold-2" lang="pt">Português</Link></li>
            <li><Link href="/privacy" className="hover:text-gold-2">Privacy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line-dark">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-paper/50 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {year} Purs &amp; Gold Limited. All rights reserved.</p>
          <p>{site.productTagline}</p>
        </div>
      </div>
    </footer>
  );
}
