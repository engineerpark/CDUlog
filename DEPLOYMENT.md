# 🚀 실외기케어 대시보드 - 배포 가이드

이 문서는 실외기케어 대시보드를 다양한 환경에 배포하는 방법을 안내합니다.

## 📋 배포 준비 체크리스트

- [ ] Supabase 프로젝트 생성 및 설정 완료
- [ ] 데이터베이스 스키마 적용 (`database-schema.sql`)
- [ ] 인증 시스템 설정 (`auth-setup.sql`) 
- [ ] RLS 정책 적용 (`rls-policies.sql`)
- [ ] 환경변수 설정 완료
- [ ] 로컬에서 테스트 완료

## 🌍 환경별 배포 가이드

### 1. 로컬 개발 환경

#### 1.1 초기 설정

```bash
# 프로젝트 클론
git clone <repository-url>
cd outdoor-unit-care

# 의존성 설치
npm install

# 환경변수 설정
npm run env:init  # .env.local 파일 생성 가이드
cp .env.example .env.local
```

#### 1.2 환경변수 설정

`.env.local` 파일 편집:

```env
# 필수 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# 개발환경 설정
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_LOG_LEVEL=debug
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_SHOW_QUERIES=true
```

#### 1.3 개발 서버 실행

```bash
# 환경변수 검증 후 서버 시작
npm run dev

# 또는 환경변수만 검증
npm run env:check
```

### 2. Vercel 배포 (권장)

#### 2.1 Vercel 프로젝트 생성

1. [Vercel Dashboard](https://vercel.com/dashboard)에서 "New Project" 클릭
2. GitHub 저장소 연결
3. 프로젝트 설정:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`

#### 2.2 환경변수 설정

**Production 환경:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_LOG_LEVEL=warn
NEXT_PUBLIC_ERROR_REPORTING=true
NEXT_PUBLIC_PERFORMANCE_MONITORING=true
```

**Preview 환경:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-staging-anon-key
NEXT_PUBLIC_ENVIRONMENT=preview
NEXT_PUBLIC_LOG_LEVEL=info
NEXT_PUBLIC_ERROR_REPORTING=false
```

**Development 환경 (vercel dev용):**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-dev-anon-key
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_LOG_LEVEL=debug
NEXT_PUBLIC_DEBUG_MODE=true
```

#### 2.3 배포 실행

```bash
# Vercel CLI 설치 (한 번만)
npm install -g vercel

# 프로젝트 배포
vercel --prod

# 또는 Git push로 자동 배포
git push origin main
```

### 3. Docker 배포

#### 3.1 Dockerfile 생성

```dockerfile
FROM node:18-alpine AS base

# 의존성 설치 단계
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# 빌드 단계
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 환경변수 빌드 시점에 설정
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN npm run build

# 실행 단계
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

#### 3.2 Docker 빌드 및 실행

```bash
# 이미지 빌드
docker build -t outdoor-unit-care \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=your-url \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  .

# 컨테이너 실행
docker run -p 3000:3000 outdoor-unit-care
```

### 4. 기타 플랫폼 배포

#### 4.1 Netlify

1. `netlify.toml` 설정:

```toml
[build]
  publish = ".next"
  command = "npm run build"

[build.environment]
  NEXT_PRIVATE_TARGET = "server"

[[redirects]]
  from = "/*"
  to = "/404.html"
  status = 404
```

2. 환경변수는 Netlify 대시보드에서 설정

#### 4.2 AWS Amplify

1. Amplify 콘솔에서 앱 생성
2. 빌드 설정:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
        - npm run env:check
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

## 🔧 환경별 최적화 설정

### Development
- 상세한 로깅 활성화
- 디버그 모드 ON
- 에러 리포팅 OFF
- 성능 모니터링 OFF

### Preview/Staging  
- 적당한 로깅 레벨
- 디버그 모드 OFF
- 에러 리포팅 OFF
- 기본 성능 모니터링

### Production
- 최소한의 로깅
- 모든 디버그 기능 OFF
- 에러 리포팅 ON
- 성능 모니터링 ON

## 🚨 보안 체크리스트

### Supabase 설정
- [ ] RLS(Row Level Security) 활성화 확인
- [ ] 적절한 인증 정책 설정
- [ ] API 키 보안 관리
- [ ] 데이터베이스 백업 설정

### Next.js 보안
- [ ] 환경변수 `.env.local` 파일 .gitignore 등록
- [ ] HTTPS 강제 설정
- [ ] 적절한 CORS 정책
- [ ] CSP(Content Security Policy) 헤더 설정

### 배포 환경 보안
- [ ] 환경변수 암호화 저장
- [ ] 접근 제어 설정
- [ ] 로그 모니터링
- [ ] 정기적인 보안 업데이트

## 🔍 트러블슈팅

### 일반적인 문제

**1. 환경변수 누락 오류**
```bash
# 해결방법: 환경변수 검증 실행
npm run env:check
```

**2. Supabase 연결 실패**
- URL과 키 값 재확인
- Supabase 프로젝트 상태 확인
- 네트워크 연결 확인

**3. 빌드 실패**
- Node.js 버전 확인 (18+ 권장)
- 캐시 초기화: `rm -rf .next node_modules && npm install`

**4. 배포 후 404 오류**
- Next.js 앱 라우터 설정 확인
- 빌드 출력 디렉토리 확인

### 환경별 디버깅

**개발 환경:**
```bash
# 상세 로그 확인
NEXT_PUBLIC_LOG_LEVEL=debug npm run dev

# 환경변수 상태 확인
npm run env:check
```

**프로덕션 환경:**
- 브라우저 개발자 도구에서 네트워크 탭 확인
- 서버 로그 모니터링
- 에러 리포팅 시스템 확인

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. **환경변수 설정**: `npm run env:check`
2. **Supabase 상태**: [Supabase Status](https://status.supabase.com/)
3. **배포 로그**: 각 플랫폼의 배포 로그 확인
4. **이슈 등록**: GitHub Issues에 상세한 오류 정보와 함께 등록

## 📈 모니터링 및 유지보수

### 성능 모니터링
- Vercel Analytics (Vercel 배포 시)
- Core Web Vitals 지표 확인
- 사용자 경험 메트릭 추적

### 정기 유지보수
- 의존성 업데이트: `npm audit`
- Supabase 프로젝트 상태 점검
- 백업 및 복원 테스트
- 보안 패치 적용