import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // Routes from the previous WordPress site, so old links and search results keep working.
    return [
      { source: "/solutions", destination: "/services", permanent: true },
      { source: "/solutions/:path*", destination: "/services", permanent: true },
      { source: "/company", destination: "/about", permanent: true },
      { source: "/case-studies", destination: "/about", permanent: true },
      { source: "/case-studies/:path*", destination: "/about", permanent: true },
      { source: "/blog", destination: "/", permanent: true },
      { source: "/blog/:path*", destination: "/", permanent: true },
      { source: "/client-support", destination: "/contact", permanent: true },
      { source: "/industries/:path+", destination: "/industries", permanent: true },
      // The hospital product was withdrawn from the portfolio; clinic systems remain an implementation service.
      { source: "/products/hospital-erp", destination: "/products", permanent: true },
      // School ERP was renamed PursEdu ERP once the product got its own brand.
      { source: "/products/school-erp", destination: "/products/pursedu-erp", permanent: true },
    ];
  },
};

export default nextConfig;
