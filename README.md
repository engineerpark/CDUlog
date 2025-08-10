# 🏢 실외기케어 대시보드 v2.0.0

> **엔터프라이즈급 실외기 유지보수 관리 시스템**
> 
> Next.js 14 + Supabase로 구축된 완전한 풀스택 대시보드

[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://cdulog-mg26hdr1n-jhparks-projects-a744b512.vercel.app)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/dashboard/project/kagztckyqatjrpazxtli)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/engineerpark/CDUlog)

## 🎯 v2.0.0 메이저 업데이트

기존 단순 로그 시스템에서 **완전한 엔터프라이즈급 관리 플랫폼**으로 전환

### ✨ 새로운 핵심 기능

- **🔐 4단계 역할 시스템**: Viewer → Technician → Manager → Admin
- **🏭 실외기 관리**: 등록/수정/삭제, 상태별 분류
- **📋 고급 유지보수 관리**: CRUD + 워크플로우
- **📱 완전 반응형**: 모바일 우선 설계
- **🔍 스마트 검색**: 고급 필터링 + 실시간 검색
- **📊 실시간 대시보드**: KPI 모니터링 + 통계
- **🛡️ 엔터프라이즈 보안**: RLS + 권한 기반 접근제어

## 📋 완료된 Vooster 태스크 (15/15) ✅

### 🏗️ 인프라 & 보안 (T-001 ~ T-007)
- ✅ **T-001**: Supabase 프로젝트 + 환경변수 세팅
- ✅ **T-002**: DB 스키마 설계 + 테이블 생성  
- ✅ **T-003**: Auth 세팅 + 4단계 역할 분리
- ✅ **T-004**: Next.js Supabase 연동 + 인증 플로우
- ✅ **T-005**: CRUD 기능 연동 완료
- ✅ **T-006**: RLS 정책 설정 + 보안 테스트
- ✅ **T-007**: 환경별 환경변수 관리 체계

### 🎨 UI/UX & 기능 (T-008 ~ T-015)  
- ✅ **T-008**: 실외기 이력 등록/수정 UI + 로직
- ✅ **T-009**: 4가지 상태 버튼 + 커스텀 입력 UX
- ✅ **T-010**: 모바일/데스크톱 반응형 최적화
- ✅ **T-011**: 검색/필터링/페이지네이션 구현
- ✅ **T-012**: 권한별 UI 접근 제어
- ✅ **T-013**: 전역 에러 처리 + 피드백 시스템
- ✅ **T-014**: DB 쿼리 성능 최적화
- ✅ **T-015**: QA + 사용자 수용 테스트 완료

## 🚀 배포 현황

| 환경 | URL | 상태 |
|------|-----|------|
| **Production** | [cdulog.vercel.app](https://cdulog-mg26hdr1n-jhparks-projects-a744b512.vercel.app) | 🟢 v2.0.0 배포됨 |
| **Supabase** | [DB Dashboard](https://supabase.com/dashboard/project/kagztckyqatjrpazxtli) | 🟢 활성화 |
| **GitHub** | [Repository](https://github.com/engineerpark/CDUlog) | 🟢 v2.0.0 태그 |

## 📊 성과 지표

| 지표 | 값 |
|-----|---|
| **프로젝트 완성도** | 100% (15/15 태스크) |
| **코드 라인 수** | 4,000+ 라인 |
| **컴포넌트 수** | 26개 파일 |
| **DB 테이블** | 3개 (profiles, units, maintenance_logs) |
| **RLS 정책** | 12개 보안 정책 |
| **API 엔드포인트** | 8개 Server Actions |

## 🛠️ 기술 스택

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: Shadcn/ui, Lucide Icons
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **State Management**: Zustand
- **Authentication**: Supabase Auth with Role-based Access Control

## 📦 설치 및 설정

### 1. 프로젝트 클론

\`\`\`bash
git clone <repository-url>
cd outdoor-unit-care
\`\`\`

### 2. 의존성 설치

\`\`\`bash
npm install
# 또는
yarn install
\`\`\`

### 3. 환경변수 설정

#### 로컬 개발 환경

1. \`.env.example\` 파일을 복사하여 \`.env.local\` 파일을 생성:

\`\`\`bash
cp .env.example .env.local
\`\`\`

2. \`.env.local\` 파일에 실제 Supabase 값을 입력:

\`\`\`env
# Supabase 설정 (필수)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# 애플리케이션 설정 (선택사항)
NEXT_PUBLIC_APP_NAME=실외기케어
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_LOG_LEVEL=debug
NEXT_PUBLIC_DEBUG_MODE=true
\`\`\`

#### Vercel 배포 환경

Vercel 대시보드에서 다음 환경변수를 설정하세요:

**Production 환경:**
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_LOG_LEVEL=warn
NEXT_PUBLIC_ERROR_REPORTING=true
\`\`\`

**Preview 환경:**
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://your-preview-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-preview-anon-key
NEXT_PUBLIC_ENVIRONMENT=preview
NEXT_PUBLIC_LOG_LEVEL=info
\`\`\`

### 4. Supabase 데이터베이스 설정

Supabase SQL 에디터에서 다음 파일들을 순서대로 실행하세요:

1. \`database-schema.sql\` - 기본 테이블 및 구조 생성
2. \`auth-setup.sql\` - 사용자 인증 및 역할 설정
3. \`rls-policies.sql\` - Row Level Security 정책 설정

### 5. 개발 서버 실행

\`\`\`bash
npm run dev
# 또는
yarn dev
\`\`\`

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

## 📁 프로젝트 구조

\`\`\`
outdoor-unit-care/
├── app/                    # Next.js App Router
│   ├── (app)/             # 인증된 사용자 페이지
│   │   ├── dashboard/     # 대시보드
│   │   └── maintenance/   # 유지보수 관리
│   ├── (auth)/            # 인증 페이지
│   │   └── login/         # 로그인
│   └── actions/           # Server Actions
├── lib/                   # 유틸리티 라이브러리
│   ├── supabase/          # Supabase 클라이언트
│   ├── stores/            # 상태 관리
│   └── config.ts          # 환경설정 관리
├── types/                 # TypeScript 타입 정의
├── components/            # UI 컴포넌트
├── *.sql                  # 데이터베이스 스키마 및 설정
└── .env.example           # 환경변수 템플릿
\`\`\`

## 🔐 사용자 역할

시스템은 4가지 사용자 역할을 지원합니다:

### 1. Viewer (조회자)
- 모든 데이터 조회 가능
- 데이터 수정/삭제 불가

### 2. Technician (기술자)
- 모든 데이터 조회 가능
- 실외기 등록 및 수정 가능
- 본인이 작성한 유지보수 로그만 수정 가능

### 3. Manager (관리자)
- 모든 데이터 조회 가능
- 모든 데이터 수정 가능
- 사용자 역할 관리 (admin 역할 제외)

### 4. Admin (최고 관리자)
- 시스템의 모든 기능 접근 가능
- 모든 사용자 역할 관리 가능

## 🧪 테스트

### 환경변수 설정 테스트

\`\`\`bash
# 환경변수 로딩 확인
npm run dev
\`\`\`

개발자 도구 콘솔에서 환경 설정 로그를 확인하세요.

### RLS 정책 테스트

Supabase SQL 에디터에서:

\`\`\`sql
-- 종합 테스트 실행
SELECT * FROM run_comprehensive_rls_test();

-- 인증된 사용자로 테스트 (로그인 후)
SELECT * FROM test_rls_policies();
\`\`\`

## 🚀 배포

### Vercel 배포

1. Vercel에 프로젝트 연결
2. 환경변수 설정 (위 참조)
3. 배포 트리거

\`\`\`bash
# 또는 Vercel CLI 사용
npm install -g vercel
vercel --prod
\`\`\`

## 🔧 환경변수 상세 설명

| 변수명 | 필수 | 설명 |
|--------|------|------|
| \`NEXT_PUBLIC_SUPABASE_URL\` | ✅ | Supabase 프로젝트 URL |
| \`NEXT_PUBLIC_SUPABASE_ANON_KEY\` | ✅ | Supabase 익명 키 |
| \`NEXT_PUBLIC_APP_NAME\` | ❌ | 애플리케이션 이름 |
| \`NEXT_PUBLIC_APP_VERSION\` | ❌ | 애플리케이션 버전 |
| \`NEXT_PUBLIC_ENVIRONMENT\` | ❌ | 환경 구분 (development/preview/production) |
| \`NEXT_PUBLIC_LOG_LEVEL\` | ❌ | 로그 레벨 (debug/info/warn/error) |
| \`NEXT_PUBLIC_DEBUG_MODE\` | ❌ | 디버그 모드 활성화 |
| \`NEXT_PUBLIC_ERROR_REPORTING\` | ❌ | 에러 리포팅 활성화 |

## 📄 라이선스

MIT 라이선스

## 🤝 기여

프로젝트에 기여하고 싶으시다면:

1. Fork 프로젝트
2. Feature 브랜치 생성
3. 변경사항 커밋
4. Push to 브랜치
5. Pull Request 오픈

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 등록해주세요.