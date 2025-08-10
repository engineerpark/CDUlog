// 실외기케어 대시보드 - Next.js 미들웨어 (인증 보호)
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname
  
  // Supabase 미들웨어 클라이언트 생성
  const supabase = createMiddlewareClient<Database>({ req, res })
  
  // 사용자 세션 확인
  const { data: { session } } = await supabase.auth.getSession()
  
  // 인증이 필요없는 경로들
  const publicPaths = ['/login', '/signup', '/forgot-password', '/', '/api']
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  
  // 정적 파일들 (이미지, CSS, JS 등)
  const isStaticFile = pathname.includes('.')
  
  // API 라우트와 정적 파일은 미들웨어 적용 제외
  if (isStaticFile || pathname.startsWith('/api')) {
    return res
  }
  
  // 이미 로그인된 사용자가 auth 페이지에 접근하는 경우
  if (session && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  
  // 보호된 경로에 인증되지 않은 사용자가 접근하는 경우
  if (!session && !isPublicPath) {
    const redirectUrl = new URL('/login', req.url)
    
    // 원래 접근하려던 경로를 저장 (로그인 후 리다이렉트용)
    if (pathname !== '/') {
      redirectUrl.searchParams.set('redirectTo', pathname)
    }
    
    return NextResponse.redirect(redirectUrl)
  }
  
  // 인증된 사용자의 경우 역할 기반 접근 제어 (추후 확장 가능)
  if (session) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
      
      // 관리자 전용 경로 확인
      const adminOnlyPaths = ['/admin']
      const isAdminPath = adminOnlyPaths.some(path => pathname.startsWith(path))
      
      if (isAdminPath && profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
      
      // 매니저 이상 권한 필요한 경로
      const managerPaths = ['/users', '/reports']
      const isManagerPath = managerPaths.some(path => pathname.startsWith(path))
      
      if (isManagerPath && !['admin', 'manager'].includes(profile?.role || '')) {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
      
    } catch (error) {
      console.error('Error checking user role:', error)
      // 역할 확인 실패시 일반 대시보드로 리다이렉트
      if (pathname.startsWith('/admin') || pathname.startsWith('/users')) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }
  }
  
  return res
}

export const config = {
  matcher: [
    /*
     * 다음 경로들을 제외한 모든 요청에 미들웨어 적용:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}