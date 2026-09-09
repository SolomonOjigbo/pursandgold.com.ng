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
    ];
  },
};

export default nextConfig;
