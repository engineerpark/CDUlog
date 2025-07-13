import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: false,
  output: 'standalone',
  distDir: '.next',
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
