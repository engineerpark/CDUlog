/** @type {import('next').NextConfig} */
const nextConfig = {
  // React 18 호환성 설정
  reactStrictMode: true,
  
  // 실험적 기능 비활성화 (React 18과 호환성을 위해)
  experimental: {
    // React 19 관련 기능들 비활성화
    typedRoutes: false,
  },

  // TypeScript 설정
  typescript: {
    // 타입 에러가 있어도 빌드 계속 진행 (개발 단계에서)
    ignoreBuildErrors: false,
  },

  // ESLint 설정
  eslint: {
    // 빌드 시 ESLint 에러 무시 (필요시에만 사용)
    ignoreDuringBuilds: false,
  },

  // 환경변수 설정
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // 빌드 최적화
  poweredByHeader: false,
  compress: true,

  // 이미지 최적화 설정
  images: {
    domains: [],
    unoptimized: false,
  },

  // API 라우트 설정
  async redirects() {
    return [
      // 필요시 리디렉션 규칙 추가
    ]
  },

  // 웹팩 설정 (필요시)
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // React 18 관련 설정
    config.resolve.alias = {
      ...config.resolve.alias,
      // React 버전 강제 고정
      'react': require.resolve('react'),
      'react-dom': require.resolve('react-dom'),
    }
    
    return config
  },
}

module.exports = nextConfig