import type { NextConfig } from "next";

// Temporarily disable PWA for Vercel deployment
// const withPWA = require("@ducanh2912/next-pwa").default({
//   dest: "public",
//   register: true,
//   skipWaiting: true,
//   disable: process.env.NODE_ENV === "development",
//   workboxOptions: {
//     disableDevLogs: true,
//   },
// });

const nextConfig: NextConfig = {
  // Remove standalone for Vercel
  // output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  // swcMinify is deprecated in Next.js 15, SWC is default
  compress: true,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  // experimental: {
  //   optimizeCss: true,
  // },
  
  // Fix trailing slash issue
  trailingSlash: false,
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
// export default withPWA(nextConfig);
