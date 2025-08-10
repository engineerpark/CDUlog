# 🏢 실외기케어 대시보드

실외기 유지보수 및 관리를 위한 웹 대시보드 애플리케이션입니다.

## 🚀 주요 기능

- **실외기 관리**: 실외기 등록, 수정, 삭제 및 상태 관리
- **유지보수 이력**: 유지보수 작업 계획, 추적 및 완료 관리
- **역할 기반 접근 제어**: 기술자, 매니저, 관리자별 권한 분리
- **대시보드**: 실시간 통계 및 모니터링
- **보안**: Supabase RLS(Row Level Security) 기반 데이터 보호

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