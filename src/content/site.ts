export const site = {
  name: "Purs & Gold Limited",
  shortName: "Purs & Gold",
  tagline: "Digital Solutions. Real Growth.",
  taglinePt: "Soluções Digitais. Crescimento Real.",
  productTagline: "Predictable. Secure. Profitable. Always On.",
  principle:
    "Our product is not a website, an ERP or an email system. It is a fully integrated digital business system.",
  // Use a fallback when the env var is undefined, null, or an empty string
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.pursandgold.com.ng",
  email: "info@pursandgold.com.ng",
  phones: {
    primary: { display: "+234 810 475 4846", tel: "+2348104754846" },
    secondary: [
      { display: "+234 913 090 4636", tel: "+2349130904636" },
      { display: "+234 813 448 0363", tel: "+2348134480363" },
    ],
    lusophone: { display: "+238 536 7405", tel: "+2385367405" },
  },
  whatsapp: "https://wa.me/2348104754846",
  whatsappPt: "https://wa.me/2385367405",
  location: "Lagos and Abuja, Nigeria",
  founded: 2015,
  offices: [
    { city: "Lagos", address: "1B Bamidele-Daramola Street, Mende, Maryland, Lagos", phone: { display: "+234 810 475 4846", tel: "+2348104754846" } },
    { city: "Abuja", address: "House 3, Plot 54, Cadastral Zone C01, Idu Industrial Area, Karmo District, Abuja", phone: { display: "+234 813 448 0363", tel: "+2348134480363" } },
  ],
  story:
    "Purs & Gold began in 2015 when two brothers, Solomon Ojigbo and Paul Oghenekevwe Ojigbo, started building websites and selling POS software to Lagos businesses. Ten years on, the same idea runs the company: one accountable partner for everything digital, now with six software products of its own.",
  markets: ["Nigeria", "Cape Verde and Lusophone Africa", "Canada (caregiver operations)"],
  leadership: [
    {
      name: "Solomon Ojigbo",
      role: "Founder & Technical Lead",
      bio: "Full-stack engineer and enterprise systems architect, and a pharmaceutical chemist by training (MSc, University of Lagos). Led the build of the Nigeria Pharmaceutical Directory and the digital transformation of Pharmanews Limited before founding Purs & Gold.",
    },
    {
      name: "Paul Oghenekevwe Ojigbo",
      role: "Chief Technology Officer",
      bio: "Sets the technical standards across the company's service lines and software products, from cloud productivity migrations to the platforms behind ParishHub, Pursberry and Veritory.",
    },
  ],
  proof: [
    {
      title: "Nigeria Pharmaceutical Directory",
      text: "Led the build of the national industry database covering manufacturers, distributors, wholesalers, pharmacy chains, associations and regulators.",
    },
    {
      title: "Pharmanews Limited",
      text: "Modernised the digital platforms of Nigeria's foremost pharmaceutical publisher.",
    },
    {
      title: "St. Ferdinand Catholic Church, Ipaja",
      text: "Reference deployment of ParishHub for a parish in the Catholic Archdiocese of Lagos.",
    },
  ],
  promises: [
    {
      title: "Establish digital authority",
      text: "High-performing, sector-aware websites and portals that become your digital headquarters.",
    },
    {
      title: "Enhance market engagement",
      text: "Ethical, data-driven marketing with leads you can count, not hope for.",
    },
    {
      title: "Modernise operations with intelligence",
      text: "ERP, CRM, POS and vertical systems with AI-assisted forecasting under human oversight.",
    },
    {
      title: "Ensure business continuity",
      text: "Managed IT, monitoring, backups and SLA-backed support so technology never stops the business.",
    },
  ],
  compliance: [
    "Nigeria Data Protection Act 2023",
    "Multi-factor authentication on every account",
    "SPF, DKIM and DMARC on every domain",
    "Encrypted, tested backups",
  ],
} as const;
