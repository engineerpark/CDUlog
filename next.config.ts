import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel 배포 최적화
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  generateEtags: false,
};

export default nextConfig;
