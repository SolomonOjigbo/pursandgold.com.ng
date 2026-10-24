import Link from "next/link";
import type { ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-7xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

export function Section({
  children,
  className = "",
  tone = "paper",
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "paper" | "paper-2" | "ink" | "navy";
  id?: string;
}) {
  const tones = {
    paper: "bg-paper text-text",
    "paper-2": "bg-paper-2 text-text",
    ink: "bg-ink text-paper",
    navy: "bg-navy text-paper",
  } as const;
  return (
    <section id={id} className={`py-16 sm:py-24 ${tones[tone]} ${className}`}>
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  text,
  dark = false,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  dark?: boolean;
  align?: "left" | "center";
}) {
  return (
    <div className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow ? <p className={`eyebrow mb-3 ${dark ? "text-gold-2" : "text-gold-ink"}`}>{eyebrow}</p> : null}
      <h2 className={`rule text-3xl font-bold sm:text-4xl ${align === "center" ? "[&::before]:mx-auto" : ""}`}>{title}</h2>
      {text ? <p className={`mt-4 text-lg ${dark ? "text-paper/75" : "text-text-2"}`}>{text}</p> : null}
    </div>
  );
}

export function Button({
  href,
  children,
  variant = "gold",
  className = "",
  external = false,
}: {
  href: string;
  children: ReactNode;
  variant?: "gold" | "outline" | "outline-dark" | "ghost";
  className?: string;
  /** Opens in a new tab. Use for destinations outside pursandgold.com.ng. */
  external?: boolean;
}) {
  const variants = {
    gold: "bg-gold text-ink hover:bg-gold-2",
    outline: "border border-paper/30 text-paper hover:border-gold-2 hover:text-gold-2",
    "outline-dark": "border border-line-dark/30 text-text hover:border-gold-ink hover:text-gold-ink",
    ghost: "text-gold-ink hover:underline underline-offset-4",
  } as const;
  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold transition ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

export function Badge({ children, tone = "gold" }: { children: ReactNode; tone?: "gold" | "ok" | "muted" | "navy" }) {
  const tones = {
    gold: "bg-gold-soft text-gold-ink",
    ok: "bg-[#e4f1e8] text-ok",
    muted: "bg-paper-2 text-muted",
    navy: "bg-navy text-paper",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-gold-ink">
      <path d="M4 10.5l3.5 3.5L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
