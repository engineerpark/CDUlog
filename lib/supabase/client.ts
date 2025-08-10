// 실외기케어 대시보드 - Supabase 클라이언트 (브라우저용)
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'
import { appConfig, logger } from '@/lib/config'

// 클라이언트 컴포넌트에서 사용하는 Supabase 클라이언트
export const createClient = () => {
  const client = createClientComponentClient<Database>()
  
  // 개발 환경에서 쿼리 로깅
  if (appConfig.features.showQueries) {
    logger.debug('Supabase Client Configuration', {
      url: appConfig.supabase.url,
      environment: appConfig.app.environment
    })
  }
  
  return client
}

// 기본 클라이언트 인스턴스 (호환성을 위해)
export const supabase = createClient()