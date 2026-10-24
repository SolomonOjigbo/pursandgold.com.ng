import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { site } from "@/content/site";

const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"], weight: ["500", "700", "800"] });
const sans = IBM_Plex_Sans({ variable: "--font-sans", subsets: ["latin"], weight: ["400", "500", "600"] });
const mono = IBM_Plex_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["500"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Purs & Gold Limited · Digital Solutions. Real Growth.",
    template: "%s · Purs & Gold",
  },
  description:
    "One partner for everything digital in Nigeria: websites, marketing, ERP, CRM, POS, cloud productivity and managed IT, plus our own software for parishes, retailers, pharma field teams, schools, property managers and care providers.",
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_NG",
    title: "Purs & Gold Limited",
    description: "Digital Solutions. Real Growth. One partner for everything digital.",
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/", languages: { en: "/", pt: "/pt" } },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
