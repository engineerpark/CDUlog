import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static Export 설정
  output: 'export',
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    unoptimized: true
  },
  // 빌드 출력 디렉토리
  distDir: '.next',
};

export default nextConfig;
