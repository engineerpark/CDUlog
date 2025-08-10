// 실외기케어 대시보드 - Supabase 서버 (Server Components & Server Actions용)
import { createServerComponentClient, createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'
import { appConfig, logger } from '@/lib/config'

// 서버 컴포넌트에서 사용하는 Supabase 클라이언트
export const createServerClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

// 서버 액션에서 사용하는 Supabase 클라이언트
export const createActionClient = () => {
  const cookieStore = cookies()
  return createServerActionClient<Database>({ cookies: () => cookieStore })
}

// 사용자 정보 가져오기 (서버 사이드)
export async function getCurrentUser() {
  const supabase = createServerClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }
    
    // 프로필 정보도 함께 가져오기
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    return {
      ...user,
      profile
    }
  } catch (error) {
    logger.error('Error getting current user:', error)
    return null
  }
}

// 사용자 권한 확인 (서버 사이드)
export async function checkUserPermission(requiredRole: string) {
  const user = await getCurrentUser()
  
  if (!user || !user.profile) {
    return false
  }
  
  const roleHierarchy: Record<string, number> = {
    viewer: 1,
    technician: 2,
    manager: 3,
    admin: 4
  }
  
  const userLevel = roleHierarchy[user.profile.role] || 0
  const requiredLevel = roleHierarchy[requiredRole] || 0
  
  return userLevel >= requiredLevel
}