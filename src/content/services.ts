export type ServiceLine = {
  slug: string;
  code: string;
  name: string;
  short: string;
  description: string;
  bullets: string[];
  soldAs: string;
  catalogSections: string[];
};

export const services: ServiceLine[] = [
  {
    slug: "digital-growth-engine",
    code: "DGE",
    name: "Digital Growth Engine",
    short: "A fully managed digital presence and growth system on one monthly plan.",
    description:
      "Website, SEO, business email, analytics, social media, an AI assistant and security hardening, delivered and improved every month. One partner, one invoice, no vendor juggling.",
    bullets: [
      "Website redesign and continuous optimisation",
      "AI-optimised SEO setup and monitoring",
      "Business email on Google Workspace or Microsoft 365",
      "Social media management and content",
      "Executive analytics dashboard and monthly report",
      "AI website assistant capturing leads around the clock",
    ],
    soldAs: "Monthly subscription, billed in advance. No yearly commitment required.",
    catalogSections: ["A"],
  },
  {
    slug: "web-and-mobile",
    code: "WEB",
    name: "Web & Mobile Solutions",
    short: "Corporate and e-commerce websites, portals and mobile apps built to scale.",
    description:
      "From a landing page to an enterprise suite with partner portals and API integrations. Built for Core Web Vitals, SEO, analytics and lead capture, with sector content packs for regulated industries.",
    bullets: [
      "Corporate and e-commerce websites with payment integration",
      "Web applications, dashboards and client portals",
      "Native and cross-platform iOS and Android apps",
      "AI chatbots, smart forms and workflow automation",
    ],
    soldAs: "One-time build. 70% on signing, 30% on acceptance.",
    catalogSections: ["B"],
  },
  {
    slug: "enterprise-software",
    code: "ENT",
    name: "Enterprise Software",
    short: "ERP, CRM, POS and inventory that give sales, warehouse and finance one source of truth.",
    description:
      "Business process mapping, configuration, data migration, testing and go-live for ERP, CRM and POS systems, with optional AI forecasting. Delivered on our own products where they fit: Pursberry for retail and wholesale, Veritory for field teams.",
    bullets: [
      "ERP, inventory and supply chain implementation",
      "CRM with pipelines, automation and integrations",
      "POS and inventory for single and multi-branch retail",
      "AI analytics: demand forecasting, expiry risk, lead scoring",
    ],
    soldAs: "Implementation fee plus subscription for the client's own environment.",
    catalogSections: ["C"],
  },
  {
    slug: "vertical-systems",
    code: "VMS",
    name: "Sector Management Systems",
    short: "Purpose-built systems for parishes, schools, hospitals, hotels and institutions.",
    description:
      "Records, operations and accounting platforms tailored to how each sector actually runs: sacraments and societies for parishes, terms and results for schools, EHR and billing for clinics, bookings and housekeeping for hotels.",
    bullets: [
      "ParishHub for Catholic parishes",
      "PursEdu ERP: school management, LMS and computer-based testing",
      "Hospital and clinic management",
      "Records and accounting for NGOs, government and corporate offices",
    ],
    soldAs: "Single deployment per organisation plus subscription.",
    catalogSections: ["D"],
  },
  {
    slug: "cloud-and-managed-it",
    code: "CLD",
    name: "Cloud Productivity & Managed IT",
    short: "Google Workspace, Microsoft 365 and Zoho migrations, then SLA-backed support.",
    description:
      "Tenant setup, domain authentication, user provisioning, full email and file migration with a tested cutover, MFA for everyone, then a monthly retainer that keeps it secure and running.",
    bullets: [
      "Cloud migration priced by user count",
      "Corporate email hosting, VPS mail servers and bulk email",
      "Productivity licences at transparent cost-plus pricing",
      "Managed IT retainer with a four-level SLA",
    ],
    soldAs: "Setup fee plus monthly retainer.",
    catalogSections: ["E"],
  },
  {
    slug: "branding-and-creative",
    code: "BRD",
    name: "Branding, Creative & Graphics",
    short: "Logos, brand kits, company profiles, packaging, motion graphics and pitch decks.",
    description:
      "Agency-quality creative that makes a business look established and trustworthy across every touchpoint, priced per item so you buy exactly what you need.",
    bullets: [
      "Logo design and brand identity kits",
      "Company profiles and stationery",
      "Packaging and label design",
      "Motion graphics and 12-slide pitch decks",
    ],
    soldAs: "Per item. 70% on briefing, 30% on final files.",
    catalogSections: ["F"],
  },
  {
    slug: "marketing",
    code: "MKT",
    name: "Digital Marketing",
    short: "Social media, paid ads, content, email campaigns and reporting, with or without a plan.",
    description:
      "Everything in the Digital Growth Engine is also available as a one-off campaign item for clients who are not on a monthly plan.",
    bullets: [
      "Social media management across Instagram, Facebook, LinkedIn, TikTok and X",
      "Google and Meta ads with conversion tracking",
      "Content calendars and email marketing setup",
      "Influencer and promo campaigns",
    ],
    soldAs: "Per item, one month at a time.",
    catalogSections: ["G"],
  },
];

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}
