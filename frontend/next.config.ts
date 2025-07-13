import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel 최적화된 안정적 설정
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
};

export default nextConfig;
