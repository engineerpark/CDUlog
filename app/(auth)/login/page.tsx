// 실외기케어 대시보드 - 로그인 페이지
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    // 이미 로그인된 사용자 확인
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          router.push(redirectTo)
          return
        }
      } catch (error) {
        console.error('Error checking session:', error)
      }
      setLoading(false)
    }

    checkUser()

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setMessage('로그인 성공! 잠시 후 이동합니다...')
          
          // 프로필 확인 및 생성
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            if (profileError && profileError.code === 'PGRST116') {
              // 프로필이 없으면 생성 (트리거가 실패한 경우 대비)
              await supabase
                .from('profiles')
                .insert({
                  id: session.user.id,
                  role: 'technician',
                  full_name: session.user.email
                })
            }
          } catch (error) {
            console.error('Error handling profile:', error)
          }
          
          setTimeout(() => {
            router.push(redirectTo)
          }, 1500)
        }
        
        if (event === 'SIGNED_OUT') {
          setError(null)
          setMessage(null)
        }
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, router, redirectTo])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>로딩 중...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            실외기케어 대시보드
          </h1>
          <p className="text-gray-600">
            실외기 유지보수 관리 시스템
          </p>
        </div>

        {/* 알림 메시지 */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {message && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{message}</AlertDescription>
          </Alert>
        )}

        {/* 로그인 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>로그인</CardTitle>
            <CardDescription>
              계정에 로그인하여 실외기 관리 시스템을 이용하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Auth
              supabaseClient={supabase}
              view="sign_in"
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#2563eb',
                      brandAccent: '#1d4ed8',
                    },
                  },
                },
                className: {
                  anchor: 'text-blue-600 hover:text-blue-800',
                  button: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors',
                  input: 'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500',
                  label: 'block text-sm font-medium text-gray-700 mb-1',
                  message: 'text-sm text-red-600 mt-1',
                  container: 'space-y-4',
                },
              }}
              localization={{
                variables: {
                  sign_in: {
                    email_label: '이메일 주소',
                    password_label: '비밀번호',
                    button_label: '로그인',
                    loading_button_label: '로그인 중...',
                    social_provider_text: '{{provider}}로 계속하기',
                    link_text: '계정이 이미 있으신가요? 로그인',
                    confirmation_text: '이메일을 확인하세요',
                  },
                  sign_up: {
                    email_label: '이메일 주소',
                    password_label: '비밀번호',
                    button_label: '회원가입',
                    loading_button_label: '가입 중...',
                    social_provider_text: '{{provider}}로 가입하기',
                    link_text: '계정이 없으신가요? 회원가입',
                    confirmation_text: '인증 이메일을 확인하세요',
                  },
                  forgotten_password: {
                    email_label: '이메일 주소',
                    button_label: '비밀번호 재설정 이메일 발송',
                    link_text: '비밀번호를 잊으셨나요?',
                    confirmation_text: '비밀번호 재설정 이메일을 확인하세요',
                  },
                },
              }}
              redirectTo={`${window.location.origin}/auth/callback`}
              onlyThirdPartyProviders={false}
              magicLink={false}
              showLinks={true}
              providers={[]}
            />
          </CardContent>
        </Card>

        {/* 데모 계정 안내 */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <h3 className="font-medium text-blue-900 mb-2">🔧 데모 계정</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>관리자:</strong> admin@outdoor-care.com</p>
              <p><strong>기술자:</strong> tech@outdoor-care.com</p>
              <p><strong>비밀번호:</strong> demo123!@#</p>
            </div>
          </CardContent>
        </Card>

        {/* 시스템 정보 */}
        <div className="text-center text-sm text-gray-500">
          <p>실외기 고장 및 보수 이력 관리 시스템</p>
          <p className="mt-1">© 2024 Outdoor Unit Care. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}