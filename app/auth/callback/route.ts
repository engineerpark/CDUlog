// 실외기케어 대시보드 - Auth 콜백 라우트
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/database'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/dashboard'

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(new URL('/login?error=callback_error', requestUrl.origin))
      }

      if (data.session) {
        // 프로필 확인 및 생성
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single()

        if (profileError && profileError.code === 'PGRST116') {
          // 프로필이 없으면 생성
          await supabase
            .from('profiles')
            .insert({
              id: data.session.user.id,
              role: 'technician',
              full_name: data.session.user.email || data.session.user.user_metadata?.full_name || null
            })
        }

        // 성공적으로 로그인된 경우 리다이렉트
        return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
      }
    } catch (error) {
      console.error('Unexpected error in auth callback:', error)
      return NextResponse.redirect(new URL('/login?error=unexpected_error', requestUrl.origin))
    }
  }

  // 코드가 없거나 처리 실패한 경우
  return NextResponse.redirect(new URL('/login?error=no_code', requestUrl.origin))
}