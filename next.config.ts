import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Temporarily disable react compiler for Vercel build
  // reactCompiler: true,
  
  // SEO & Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Metadata for SEO
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
        ],
      },
    ];
  },
};

export default nextConfig;

// PWA Configuration (Install next-pwa to enable)
// import withPWA from "next-pwa";
// 
// export default withPWA({
//   dest: "public",
//   register: true,
//   skipWaiting: true,
//   disable: process.env.NODE_ENV === "development",
//   buildExcludes: [/middleware-manifest\.json$/],
// })(nextConfig);
