# 🚀 Vercel 배포 가이드

## 🔐 1단계: Vercel 계정 및 로그인

### CLI를 통한 배포
```bash
# Vercel 로그인 (브라우저에서 인증)
vercel login

# 프로젝트 배포 (대화형 설정)
vercel

# 프로덕션 배포
vercel --prod
```

### GitHub 연동을 통한 배포 (권장)

1. **GitHub 저장소 생성**
   - GitHub에서 새 리포지토리 생성
   - 로컬 프로젝트와 연결:
   ```bash
   git remote add origin https://github.com/your-username/outdoor-unit-care.git
   git push -u origin main
   ```

2. **Vercel에서 GitHub 연동**
   - [Vercel Dashboard](https://vercel.com/dashboard) 접속
   - "New Project" 클릭
   - GitHub 저장소 선택
   - 프레임워크: **Next.js** 자동 감지
   - Deploy 버튼 클릭

## ⚙️ 2단계: 환경변수 설정

### Vercel Dashboard에서 설정

**Settings > Environment Variables** 에서 다음 환경변수들을 설정:

#### Production 환경
```env
NEXT_PUBLIC_SUPABASE_URL=https://kagztckyqatjrpazxtli.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
NEXT_PUBLIC_APP_NAME=실외기케어
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_LOG_LEVEL=warn
NEXT_PUBLIC_ERROR_REPORTING=true
NEXT_PUBLIC_PERFORMANCE_MONITORING=true
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_SHOW_QUERIES=false
```

#### Preview 환경
```env
NEXT_PUBLIC_SUPABASE_URL=https://kagztckyqatjrpazxtli.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
NEXT_PUBLIC_ENVIRONMENT=preview
NEXT_PUBLIC_LOG_LEVEL=info
NEXT_PUBLIC_ERROR_REPORTING=false
NEXT_PUBLIC_DEBUG_MODE=false
```

### CLI를 통한 환경변수 설정

```bash
# Production 환경변수
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add NEXT_PUBLIC_ENVIRONMENT production

# Preview 환경변수  
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
vercel env add NEXT_PUBLIC_ENVIRONMENT preview

# Development 환경변수
vercel env add NEXT_PUBLIC_SUPABASE_URL development
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development
```

## 🔧 3단계: 빌드 설정 확인

### vercel.json 설정
프로젝트에 이미 `vercel.json`이 설정되어 있습니다:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_APP_NAME": "실외기케어",
    "NEXT_PUBLIC_APP_VERSION": "1.0.0"
  }
}
```

### 빌드 명령어 확인
```bash
# 로컬에서 빌드 테스트
npm install
npm run build
npm start
```

## 🚀 4단계: 배포 실행

### 방법 1: GitHub Push 배포 (권장)
```bash
git add .
git commit -m "deploy: Vercel 배포 설정 완료"
git push origin main
```

### 방법 2: CLI 직접 배포
```bash
# 프리뷰 배포
vercel

# 프로덕션 배포
vercel --prod
```

## 📊 5단계: 배포 확인 및 테스트

### 배포 URL 확인
배포 완료 후 Vercel Dashboard에서 다음 URL들을 확인:
- **Production**: `https://outdoor-unit-care.vercel.app`
- **Preview**: PR 생성 시 자동 생성되는 프리뷰 URL

### 기능 테스트 체크리스트
- [ ] 로그인 페이지 정상 동작
- [ ] Supabase 연결 확인
- [ ] 대시보드 페이지 로딩
- [ ] 유지보수 이력 페이지 접근
- [ ] 환경변수 로딩 확인 (개발자 도구 콘솔)

### 문제 해결
**빌드 오류 발생 시:**
```bash
# 로컬에서 빌드 테스트
npm run build

# 의존성 문제 시
rm -rf node_modules package-lock.json
npm install
npm run build
```

**환경변수 문제 시:**
- Vercel Dashboard > Settings > Environment Variables 재확인
- 대소문자 및 오타 확인
- Redeploy 실행

## 🔄 6단계: 지속적 배포 설정

### 자동 배포
- `main` 브랜치 Push → 자동 Production 배포
- PR 생성 → 자동 Preview 배포 생성
- 배포 상태는 GitHub PR에 자동 표시

### 배포 도메인 설정
1. Vercel Dashboard > Domains
2. 커스텀 도메인 추가 (선택사항)
3. DNS 설정 완료

## 📈 배포 후 모니터링

### Vercel Analytics
- 자동으로 활성화되는 기본 분석
- Core Web Vitals 성능 지표
- 사용자 경험 메트릭

### 로그 모니터링
```bash
# 실시간 로그 확인
vercel logs

# 특정 배포 로그
vercel logs [deployment-url]
```

## 🔐 보안 설정

### HTTPS 강제
Vercel에서 자동으로 HTTPS 적용 및 HTTP → HTTPS 리다이렉트

### 환경변수 보안
- 민감한 정보는 Vercel Dashboard에서만 설정
- `.env.local` 파일은 Git에 커밋하지 않음 (.gitignore 설정 완료)

## 📞 지원

### 유용한 명령어
```bash
# 프로젝트 정보 확인
vercel inspect

# 환경변수 목록 조회
vercel env ls

# 배포 기록 확인
vercel ls
```

### 문제 해결
- [Vercel 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- GitHub Issues에서 배포 로그와 함께 문의

---

**📝 배포 체크리스트:**
- [ ] GitHub 저장소 생성 및 Push
- [ ] Vercel 계정 생성/로그인
- [ ] 프로젝트 연결 및 배포
- [ ] 환경변수 설정 완료
- [ ] 배포 URL 접속 테스트
- [ ] 기능 동작 확인 완료