export type Industry = {
  slug: string;
  name: string;
  pains: string[];
  answer: string;
  products: string[];
  services: string[];
};

export const industries: Industry[] = [
  {
    slug: "pharmaceutical",
    name: "Pharmaceutical & FMCG",
    pains: [
      "Low digital visibility despite established brands",
      "Weak engagement with healthcare professionals and distributors",
      "Field reports nobody can verify",
      "Regulatory sensitivity around promotion and data",
    ],
    answer:
      "A regulatory-aware website with distributor portal, ethical marketing, Veritory for the field force, and managed IT with audit-ready security.",
    products: ["veritory"],
    services: ["web-and-mobile", "digital-growth-engine", "enterprise-software", "cloud-and-managed-it"],
  },
  {
    slug: "retail",
    name: "Retail & Wholesale",
    pains: ["Stock leakage and unknown margins", "No real-time view across branches", "Sales stop when the internet does"],
    answer: "Pursberry POS, inventory and accounting, with hardware, payments and a managed IT retainer behind it.",
    products: ["pursberry"],
    services: ["enterprise-software", "cloud-and-managed-it"],
  },
  {
    slug: "healthcare",
    name: "Healthcare Providers",
    pains: ["Paper records and lost histories", "Billing leakage and claim delays", "Compliance without audit trails"],
    answer: "Hospital and clinic management with EHR, billing, pharmacy and lab, plus secure cloud productivity.",
    products: [],
    services: ["vertical-systems", "cloud-and-managed-it"],
  },
  {
    slug: "education",
    name: "Schools",
    pains: ["Manual results and report cards", "Fees chased by hand", "Parents in the dark"],
    answer: "School ERP with approved results, Paystack fees and a parent portal, on Nigerian term and grading rules.",
    products: ["school-erp"],
    services: ["vertical-systems", "web-and-mobile"],
  },
  {
    slug: "churches",
    name: "Parishes & Faith Organisations",
    pains: ["Member records in notebooks", "Giving and dues untracked", "Bulletins and SMS done by hand"],
    answer: "ParishHub, deployed per parish, with SMS, giving statements and a member portal.",
    products: ["parishhub"],
    services: ["vertical-systems", "digital-growth-engine"],
  },
  {
    slug: "institutions",
    name: "NGOs, Government & Corporate",
    pains: ["Beneficiary and programme records scattered", "Contracts and assets untracked", "Audits that take weeks"],
    answer: "Records and accounting systems built to your workflows, with role-based access and audit trails.",
    products: [],
    services: ["vertical-systems", "web-and-mobile", "cloud-and-managed-it"],
  },
  {
    slug: "hospitality",
    name: "Hotels & Hospitality",
    pains: ["Front desk, bookings and housekeeping on separate sheets", "No occupancy or revenue view"],
    answer: "Hotel management implementation with online booking, housekeeping and guest CRM.",
    products: [],
    services: ["vertical-systems", "digital-growth-engine"],
  },
];
