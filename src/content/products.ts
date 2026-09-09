export type ProductStatus =
  | "Available now"
  | "Early access"
  | "Pilot programme"
  | "In design"
  | "Coming soon"
  | "Live in Canada";

export type Product = {
  slug: string;
  name: string;
  category: string;
  status: ProductStatus;
  headline: string;
  summary: string;
  audience: string;
  modules: string[];
  differentiators: string[];
  delivery: string;
  pricing: string;
  catalogCodes: string[];
  accent: "gold" | "navy" | "teal" | "rose" | "violet" | "moss";
};

export const products: Product[] = [
  {
    slug: "parishhub",
    name: "ParishHub",
    category: "Catholic churches",
    status: "Available now",
    headline: "Parish management, from the sacristy to the finance office.",
    summary:
      "Members, families and zones, sacramental records with certificates, societies and dues, events and attendance, offerings, tithes, pledges and donations with receipts, SMS and email, a Sunday bulletin composer and a member portal, in one system built with a Lagos parish.",
    audience: "Parishes, chaplaincies and dioceses in Nigeria.",
    modules: [
      "Members, families and zones with import and export",
      "Sacramental records and certificate PDFs",
      "Societies (CWO, CMO, KSC, Legion of Mary), meetings and dues",
      "Events, registrations and attendance check-in",
      "Offerings, tithes, pledges, donations and giving statements",
      "SMS and email communications, Sunday bulletin composer",
      "Member portal and public self-registration",
      "Roles for priest, finance officer, secretary and society leaders",
    ],
    differentiators: [
      "Built for a real parish in the Catholic Archdiocese of Lagos and configurable for any parish",
      "Each parish gets its own deployment and its own data",
      "Audit logs and role-based permissions on every record",
    ],
    delivery: "Single deployment per parish, live within days of data handover.",
    pricing: "Setup and data migration plus a monthly subscription, quoted on the parish's size and needs.",
    catalogCodes: ["PH-SETUP", "PH-SUB"],
    accent: "gold",
  },
  {
    slug: "pursberry",
    name: "Pursberry",
    category: "Wholesale and retail shops",
    status: "Early access",
    headline: "Point of sale, inventory and accounting that keep selling when the internet doesn't.",
    summary:
      "An offline-first POS terminal with barcode checkout, split payments, shifts and cash drops, real-time stock across branches and warehouses, batch and expiry tracking, procurement, and full double-entry accounting with VAT-ready reports.",
    audience: "Supermarkets, pharmacies, distributors, wholesalers and multi-branch retailers in Nigeria.",
    modules: [
      "Offline-first POS terminal for Windows and Mac",
      "Multi-unit packaging: carton, pack and unit",
      "Shelf-location stock, transfers and stock counts",
      "Batch and expiry tracking with first-expiry-first-out",
      "Suppliers, purchase orders, goods received and landed costs",
      "Double-entry accounting: ledger, trial balance, P&L, balance sheet, cash flow",
      "7.5% VAT per line and VAT filing reports",
      "Moniepoint and Paystack payments, thermal printers, scanners and cash drawers",
    ],
    differentiators: [
      "Sales keep flowing offline and sync when the connection returns",
      "Accounting is built in, not bolted on",
      "Designed for Nigerian VAT, packaging and payment habits",
    ],
    delivery: "Early access programme for pilot retailers; general availability to follow.",
    pricing: "Onboarding from the POS and inventory ladder plus a monthly subscription, quoted on outlets, registers and volume.",
    catalogCodes: ["POS-FULL", "PB-SUB"],
    accent: "rose",
  },
  {
    slug: "veritory",
    name: "Veritory",
    category: "Pharmaceutical and FMCG companies",
    status: "Pilot programme",
    headline: "Intelligent field operations and verified execution.",
    summary:
      "A sales-force automation and CRM platform whose moat is verified field activity: GPS-geofenced visits, live rep tracking, route compliance, auditable call reports, order capture, distributor stock and delivery proof, and AI insights, delivered as an offline-first mobile app and a command dashboard.",
    audience: "Pharmaceutical manufacturers, FMCG distributors and any organisation running field sales teams.",
    modules: [
      "Veritory Field: offline-first mobile app for reps",
      "Veritory Command: territory design, route planning and live oversight",
      "Veritory IQ: natural-language insight over territory sales and stock",
      "Veritory Supply: distributor stock allocation and delivery proof",
      "Veritory Audit: retail surveys, samples and merchandising",
      "Expenses with GPS mileage cross-check",
      "NAFDAC and PCN licence tracking with expiry alerts",
      "Integrations with Dynamics 365 Business Central, Microsoft 365 and Power BI",
    ],
    differentiators: [
      "Every visit is proven by location, time and photo, not self-reported",
      "Each client runs on a dedicated, isolated deployment",
      "AI recommends, people decide",
    ],
    delivery: "30-day territory audit pilot with a defined team, then company-wide rollout.",
    pricing: "Dedicated deployment fee plus a monthly fee per active rep, quoted on team size and territories.",
    catalogCodes: ["VER-DEP", "VER-REP"],
    accent: "navy",
  },
  {
    slug: "school-erp",
    name: "School ERP, LMS & CBT",
    category: "Schools",
    status: "In design",
    headline: "A Nigerian school on one system, from admissions to report cards.",
    summary:
      "Students, guardians, academics, attendance, timetable, examinations and approved results, fees with Paystack, lesson plans, homework and online exams, HR and payroll, library, transport, hostel and a parent portal, with the three-term session, continuous assessment and grading rules Nigerian schools actually use.",
    audience: "Private and public schools from early years to senior secondary, single campus or multi-campus groups.",
    modules: [
      "Admissions, students and guardians",
      "Academics, attendance and timetable",
      "Examinations, approved results and report cards",
      "Fees and collections with Paystack",
      "Lesson plans, homework, study materials and online exams",
      "HR, payroll, leave, library, inventory, transport and hostel",
      "Parent portal with SMS and WhatsApp notifications",
      "Nineteen roles from proprietor to auditor",
    ],
    differentiators: [
      "Three-term sessions, CA and exam weighting, promotion rules built in",
      "Approve-then-publish results with audited corrections",
      "Affordable, cloud-hosted and multi-campus from day one",
    ],
    delivery: "MVP in build on the same platform as Veritory; early schools shape the roadmap.",
    pricing: "Onboarding by school size plus a subscription quoted per student per term.",
    catalogCodes: ["SCH-ONB", "SCH-SUB"],
    accent: "teal",
  },
  {
    slug: "hospital-erp",
    name: "Hospital & Clinic Management",
    category: "Hospitals and clinics",
    status: "Coming soon",
    headline: "Patient records, billing, pharmacy and lab in one secure system.",
    summary:
      "Electronic health records with scheduling and reminders, doctor and nurse dashboards, pharmacy and inventory, billing and insurance claims, laboratory and radiology, telemedicine, and audit trails aligned to HIPAA and GDPR principles, with NHIS and HMO integration.",
    audience: "Clinics, diagnostic centres, hospitals and pharmaceutical companies operating clinical facilities.",
    modules: [
      "Electronic health records, scheduling and reminders",
      "Clinical and administrative dashboards",
      "Pharmacy, dispensing and inventory",
      "Billing, invoicing and insurance claims",
      "Laboratory information system and radiology compatibility",
      "Telemedicine and patient mobile app",
      "NHIS and HMO API integration",
      "Audit trails, encryption and role-based access",
    ],
    differentiators: [
      "Built on the same secure, multi-site architecture as our school platform",
      "Compliance and audit built in for regulated environments",
    ],
    delivery: "In planning. Implementation of partner platforms is available today on request.",
    pricing: "Quoted on the facility's size and modules.",
    catalogCodes: ["HMS-CLN", "HMS-HOS"],
    accent: "moss",
  },
  {
    slug: "goodheart",
    name: "GoodHeart Care Givers Portal",
    category: "Caregiver and group-home operators",
    status: "Live in Canada",
    headline: "Secure operations management for licensed group homes.",
    summary:
      "Clients and support plans, electronic medication administration, incident and serious occurrence reporting, daily logs and handover, staff certifications and screening expiry, scheduling and time off, payroll with overtime and statutory holidays, house inventory, a compliance centre and analytics, built for an operator regulated in Ontario.",
    audience: "Group-home, developmental-services and home-care operators.",
    modules: [
      "Clients, support plans and care goals",
      "Electronic medication administration record",
      "Incident and serious occurrence reporting",
      "Daily activities, observation log and shift handover",
      "Staff certifications, screening expiry and documents",
      "Scheduling, swap requests and time off",
      "Payroll with timesheets, overtime and statutory holidays",
      "Compliance centre with checklists, policies and corrective actions",
    ],
    differentiators: [
      "Live in production for a Canadian operator",
      "Ontario regulatory vocabulary and labour rules built in",
      "Works offline for managers on the floor",
    ],
    delivery: "Single deployment per operator.",
    pricing: "Quoted in Canadian dollars on homes and staff seats.",
    catalogCodes: ["CARE-DEP", "CARE-SUB"],
    accent: "violet",
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}
