# CDUlog - 실외기 유지보수 관리 시스템

실외기 유지보수 이력을 간단하게 현장에서 입력할 수 있는 서비스

> 최종 업데이트: 2025-07-20 21:40:00 KST

## 🌐 배포 상태

### 🚫 Vercel (일시 중단)
- **문제**: Free Tier 일일 배포 제한 (100회) 초과
- **복구**: 17시간 후 자동 리셋
- **URL**: https://cdulog.vercel.app (현재 404)

### ✅ Netlify (권장)
- **상태**: 배포 준비 완료
- **설정**: netlify.toml 포함
- **URL**: 배포 후 생성됨

### ✅ Railway
- **상태**: 배포 준비 완료  
- **설정**: railway.json 포함
- **URL**: 배포 후 생성됨

## 🔧 배포 방법

### Netlify 배포 (가장 빠름)
1. https://netlify.com 접속
2. GitHub 계정으로 로그인
3. "Import an existing project" 선택
4. `engineerpark/CDUlog` 선택
5. 자동 빌드 및 배포

### Railway 배포
1. https://railway.app 접속
2. GitHub 계정으로 로그인
3. "Deploy from GitHub repo" 선택
4. `engineerpark/CDUlog` 선택
5. 자동 배포

## 🎯 기능

- ✅ 실외기 유지보수 관리 시스템
- ✅ 로그인 시스템 (lgchem/232576)
- ✅ 보수 항목 관리 (필수 비고사항 입력)
- ✅ 보수 이력 추적
- ✅ CSV 내보내기 기능
- ✅ 자동 상태 계산 (정상가동/보수필요/비가동)

## 기술 스택

- Next.js 15.3.5
- React 19
- TypeScript
- Tailwind CSS

## 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 프로젝트 구조

```
├── app/              # Next.js App Router
│   ├── api/         # API Routes
│   ├── layout.tsx   # Root Layout
│   └── page.tsx     # Home Page
├── public/          # Static Assets
├── package.json     # Dependencies
└── next.config.js   # Next.js Configuration
```