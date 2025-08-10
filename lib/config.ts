// 실외기케어 대시보드 - 환경변수 관리 설정
// 환경별 설정을 중앙에서 관리하고 타입 안전성을 제공합니다

/**
 * 환경 타입 정의
 */
export type Environment = 'development' | 'preview' | 'production'

/**
 * 애플리케이션 설정 타입
 */
interface AppConfig {
  app: {
    name: string
    version: string
    environment: Environment
  }
  supabase: {
    url: string
    anonKey: string
  }
  features: {
    debugMode: boolean
    showQueries: boolean
    errorReporting: boolean
    performanceMonitoring: boolean
  }
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error'
  }
}

/**
 * 환경변수 유효성 검사
 */
function validateEnvVar(key: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

/**
 * 현재 환경 감지
 */
export function getCurrentEnvironment(): Environment {
  const env = process.env.NODE_ENV
  const vercelEnv = process.env.VERCEL_ENV
  
  // Vercel 환경에서는 VERCEL_ENV를 우선 사용
  if (vercelEnv === 'production') return 'production'
  if (vercelEnv === 'preview') return 'preview'
  
  // 로컬 환경에서는 NODE_ENV 사용
  if (env === 'production') return 'production'
  if (env === 'development') return 'development'
  
  return 'development'
}

/**
 * 환경별 설정 로드
 */
export function loadAppConfig(): AppConfig {
  const currentEnv = getCurrentEnvironment()
  
  // 필수 환경변수 검증
  const supabaseUrl = validateEnvVar(
    'NEXT_PUBLIC_SUPABASE_URL', 
    process.env.NEXT_PUBLIC_SUPABASE_URL
  )
  
  const supabaseAnonKey = validateEnvVar(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  
  // 설정 객체 생성
  const config: AppConfig = {
    app: {
      name: process.env.NEXT_PUBLIC_APP_NAME || '실외기케어',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: currentEnv
    },
    supabase: {
      url: supabaseUrl,
      anonKey: supabaseAnonKey
    },
    features: {
      debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
      showQueries: process.env.NEXT_PUBLIC_SHOW_QUERIES === 'true',
      errorReporting: process.env.NEXT_PUBLIC_ERROR_REPORTING === 'true',
      performanceMonitoring: process.env.NEXT_PUBLIC_PERFORMANCE_MONITORING === 'true'
    },
    logging: {
      level: (process.env.NEXT_PUBLIC_LOG_LEVEL as any) || 'info'
    }
  }
  
  return config
}

/**
 * 전역 앱 설정 인스턴스
 */
export const appConfig = loadAppConfig()

/**
 * 개발환경 여부 확인
 */
export const isDevelopment = appConfig.app.environment === 'development'

/**
 * 프로덕션 환경 여부 확인
 */
export const isProduction = appConfig.app.environment === 'production'

/**
 * 프리뷰 환경 여부 확인
 */
export const isPreview = appConfig.app.environment === 'preview'

/**
 * 환경별 로깅 유틸리티
 */
export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (appConfig.logging.level === 'debug' || isDevelopment) {
      console.debug(`[${appConfig.app.environment}] ${message}`, ...args)
    }
  },
  info: (message: string, ...args: any[]) => {
    if (['debug', 'info'].includes(appConfig.logging.level)) {
      console.info(`[${appConfig.app.environment}] ${message}`, ...args)
    }
  },
  warn: (message: string, ...args: any[]) => {
    if (['debug', 'info', 'warn'].includes(appConfig.logging.level)) {
      console.warn(`[${appConfig.app.environment}] ${message}`, ...args)
    }
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[${appConfig.app.environment}] ${message}`, ...args)
    
    // 프로덕션에서는 에러 리포팅 서비스로 전송
    if (isProduction && appConfig.features.errorReporting) {
      // TODO: 에러 리포팅 서비스 연동 (Sentry, Rollbar 등)
    }
  }
}

/**
 * 환경 정보 출력 (개발 환경에서만)
 */
if (isDevelopment) {
  logger.debug('Environment Configuration Loaded', {
    environment: appConfig.app.environment,
    features: appConfig.features,
    supabase: {
      url: appConfig.supabase.url,
      hasKey: !!appConfig.supabase.anonKey
    }
  })
}