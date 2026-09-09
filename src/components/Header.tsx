"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./Logo";

const nav = [
  { href: "/services", label: "Services" },
  { href: "/products", label: "Products" },
  { href: "/pricing", label: "Pricing" },
  { href: "/industries", label: "Industries" },
  { href: "/about", label: "About" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-line-dark bg-ink/95 text-paper backdrop-blur supports-[backdrop-filter]:bg-ink/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-3 sm:px-8">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition hover:text-gold-2 ${active ? "text-gold-2" : "text-paper/80"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/pt" className="text-xs font-semibold tracking-wide text-paper/60 hover:text-gold-2" lang="pt">
            PT
          </Link>
          <Link
            href="/start"
            className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gold-2"
          >
            Book a discovery call
          </Link>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md border border-line-dark p-2 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label="Toggle navigation"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            {open ? (
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            ) : (
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" className="border-t border-line-dark px-5 py-4 md:hidden" aria-label="Mobile">
          <ul className="flex flex-col gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-2 py-2 text-base text-paper/90 hover:bg-ink-2"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/pt" onClick={() => setOpen(false)} className="block rounded-md px-2 py-2 text-base text-paper/70" lang="pt">
                Português
              </Link>
            </li>
            <li className="pt-2">
              <Link
                href="/start"
                onClick={() => setOpen(false)}
                className="block rounded-md bg-gold px-4 py-2 text-center text-sm font-semibold text-ink"
              >
                Book a discovery call
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
