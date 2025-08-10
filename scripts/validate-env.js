#!/usr/bin/env node

// 실외기케어 대시보드 - 환경변수 유효성 검사 스크립트
// 필수 환경변수가 모두 설정되어 있는지 확인합니다

const fs = require('fs')
const path = require('path')

/**
 * 환경변수 유효성 검사 설정
 */
const ENV_VALIDATION = {
  // 필수 환경변수
  required: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ],
  // 선택적 환경변수 (기본값 제공)
  optional: [
    'NEXT_PUBLIC_APP_NAME',
    'NEXT_PUBLIC_APP_VERSION',
    'NEXT_PUBLIC_ENVIRONMENT',
    'NEXT_PUBLIC_LOG_LEVEL',
    'NEXT_PUBLIC_DEBUG_MODE',
    'NEXT_PUBLIC_ERROR_REPORTING',
    'NEXT_PUBLIC_PERFORMANCE_MONITORING'
  ]
}

/**
 * 현재 환경 감지
 */
function getCurrentEnvironment() {
  const nodeEnv = process.env.NODE_ENV
  const vercelEnv = process.env.VERCEL_ENV
  
  if (vercelEnv === 'production') return 'production'
  if (vercelEnv === 'preview') return 'preview'
  if (nodeEnv === 'production') return 'production'
  if (nodeEnv === 'development') return 'development'
  
  return 'development'
}

/**
 * 환경변수 파일 로드
 */
function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    return {}
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8')
  const envVars = {}
  
  envContent.split('\\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length > 0) {
        envVars[key] = valueParts.join('=')
      }
    }
  })
  
  return envVars
}

/**
 * 환경변수 검증 실행
 */
function validateEnvironment() {
  const currentEnv = getCurrentEnvironment()
  const projectRoot = path.resolve(__dirname, '..')
  
  console.log('🔍 실외기케어 대시보드 - 환경변수 검증')
  console.log('=' + '='.repeat(50))
  console.log(`📍 현재 환경: ${currentEnv}`)
  console.log(`📁 프로젝트 경로: ${projectRoot}`)
  console.log('')
  
  // 환경변수 파일들 확인
  const envFiles = [
    '.env.local',
    '.env.development',
    '.env.production',
    '.env'
  ]
  
  console.log('📄 환경변수 파일 상태:')
  envFiles.forEach(file => {
    const filePath = path.join(projectRoot, file)
    const exists = fs.existsSync(filePath)
    console.log(`   ${exists ? '✅' : '❌'} ${file}`)
  })
  console.log('')
  
  // 현재 환경변수 확인
  console.log('🔑 필수 환경변수 검증:')
  let hasErrors = false
  
  ENV_VALIDATION.required.forEach(envVar => {
    const value = process.env[envVar]
    const status = value ? '✅' : '❌'
    console.log(`   ${status} ${envVar}${value ? ' (설정됨)' : ' (누락)'}`)
    
    if (!value) {
      hasErrors = true
    }
  })
  
  console.log('')
  console.log('⚙️  선택적 환경변수:')
  ENV_VALIDATION.optional.forEach(envVar => {
    const value = process.env[envVar]
    const status = value ? '✅' : '⚠️ '
    console.log(`   ${status} ${envVar}${value ? ` = ${value}` : ' (기본값 사용)'}`)
  })
  
  console.log('')
  
  // 환경별 권장사항
  console.log(`💡 ${currentEnv} 환경 권장 설정:`)
  
  if (currentEnv === 'development') {
    console.log('   - NEXT_PUBLIC_LOG_LEVEL=debug')
    console.log('   - NEXT_PUBLIC_DEBUG_MODE=true')
    console.log('   - NEXT_PUBLIC_ERROR_REPORTING=false')
  } else if (currentEnv === 'preview') {
    console.log('   - NEXT_PUBLIC_LOG_LEVEL=info')
    console.log('   - NEXT_PUBLIC_DEBUG_MODE=false')
    console.log('   - NEXT_PUBLIC_ERROR_REPORTING=false')
  } else if (currentEnv === 'production') {
    console.log('   - NEXT_PUBLIC_LOG_LEVEL=warn')
    console.log('   - NEXT_PUBLIC_DEBUG_MODE=false')
    console.log('   - NEXT_PUBLIC_ERROR_REPORTING=true')
    console.log('   - NEXT_PUBLIC_PERFORMANCE_MONITORING=true')
  }
  
  console.log('')
  
  // 결과 출력
  if (hasErrors) {
    console.log('❌ 환경변수 검증 실패!')
    console.log('')
    console.log('해결 방법:')
    console.log('1. .env.example 파일을 .env.local로 복사')
    console.log('2. 누락된 환경변수 값을 입력')
    console.log('3. Supabase 대시보드에서 프로젝트 URL과 키를 확인')
    console.log('')
    process.exit(1)
  } else {
    console.log('✅ 환경변수 검증 성공!')
    console.log('')
    console.log('🚀 준비 완료! 다음 명령어로 개발 서버를 시작하세요:')
    console.log('   npm run dev')
  }
}

/**
 * 도움말 생성
 */
function generateEnvTemplate() {
  const projectRoot = path.resolve(__dirname, '..')
  const templatePath = path.join(projectRoot, '.env.local.example')
  
  if (!fs.existsSync(templatePath)) {
    console.log('❌ .env.local.example 파일을 찾을 수 없습니다.')
    return
  }
  
  const template = fs.readFileSync(templatePath, 'utf8')
  const outputPath = path.join(projectRoot, '.env.local')
  
  if (fs.existsSync(outputPath)) {
    console.log('⚠️  .env.local 파일이 이미 존재합니다.')
    console.log('기존 파일을 백업하고 새로 생성하시겠습니까? (y/N)')
    return
  }
  
  fs.writeFileSync(outputPath, template)
  console.log('✅ .env.local 파일이 생성되었습니다.')
  console.log('📝 파일을 편집하여 실제 값을 입력해주세요.')
}

/**
 * 메인 실행부
 */
function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('실외기케어 대시보드 - 환경변수 도구')
    console.log('')
    console.log('사용법:')
    console.log('  node scripts/validate-env.js          환경변수 검증')
    console.log('  node scripts/validate-env.js --init   .env.local 파일 생성')
    console.log('  node scripts/validate-env.js --help   도움말 표시')
    return
  }
  
  if (args.includes('--init')) {
    generateEnvTemplate()
    return
  }
  
  validateEnvironment()
}

if (require.main === module) {
  main()
}

module.exports = {
  validateEnvironment,
  getCurrentEnvironment,
  ENV_VALIDATION
}