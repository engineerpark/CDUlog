// 실외기케어 대시보드 - Supabase 연결 테스트
import { createClient } from '@supabase/supabase-js'

// 환경변수 검증
function validateEnvironmentVariables() {
    const requiredEnvs = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ]
    
    const missing = requiredEnvs.filter(env => !process.env[env])
    
    if (missing.length > 0) {
        console.error('❌ 누락된 환경변수:', missing)
        console.error('💡 .env.local 파일을 확인하세요')
        return false
    }
    
    console.log('✅ 모든 환경변수가 설정되었습니다')
    return true
}

// Supabase 클라이언트 생성 및 테스트
async function testSupabaseConnection() {
    if (!validateEnvironmentVariables()) {
        return false
    }
    
    try {
        console.log('🔗 Supabase 연결 테스트 중...')
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        console.log('📍 Supabase URL:', supabaseUrl)
        console.log('🔑 API Key (마스킹):', supabaseAnonKey?.substring(0, 20) + '...')
        
        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        
        // 연결 테스트 - 간단한 쿼리 실행
        const { data, error } = await supabase
            .from('test')
            .select('*')
            .limit(1)
        
        if (error && error.code === 'PGRST116') {
            console.log('✅ Supabase 연결 성공 (테이블이 없어서 정상적인 오류)')
            console.log('🎯 다음 단계: 데이터베이스 스키마 생성 필요')
        } else if (error) {
            console.error('❌ 연결 오류:', error.message)
            return false
        } else {
            console.log('✅ Supabase 연결 및 쿼리 성공')
            console.log('📊 데이터:', data)
        }
        
        return true
        
    } catch (error) {
        console.error('❌ Supabase 연결 실패:', error.message)
        return false
    }
}

// Vercel 환경변수 설정 가이드
function showVercelSetupGuide() {
    console.log('\n📦 Vercel 환경변수 설정 가이드:')
    console.log('1. Vercel 프로젝트 대시보드 접속')
    console.log('2. Settings > Environment Variables 메뉴')
    console.log('3. 다음 변수들을 Production, Preview, Development에 추가:')
    console.log('   - NEXT_PUBLIC_SUPABASE_URL')
    console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY')
    console.log('\n💡 배포 후 환경변수가 정상 로드되는지 확인하세요!')
}

// 메인 실행 함수
async function main() {
    console.log('🏠 실외기케어 대시보드 - Supabase 설정 검증')
    console.log('=' .repeat(50))
    
    const isConnected = await testSupabaseConnection()
    
    if (isConnected) {
        console.log('\n🎉 T-001 작업 완료!')
        console.log('✅ Supabase 프로젝트 연결 성공')
        console.log('✅ 환경변수 설정 완료')
        console.log('\n📋 다음 작업: T-002 (DB 스키마 설계 및 테이블 생성)')
    } else {
        console.log('\n❌ T-001 작업 실패')
        console.log('💡 환경변수와 Supabase 프로젝트 설정을 다시 확인하세요')
    }
    
    showVercelSetupGuide()
}

// 브라우저 환경에서는 window 객체에 함수 등록
if (typeof window !== 'undefined') {
    window.testSupabaseConnection = main
}

export { testSupabaseConnection, validateEnvironmentVariables }
export default main