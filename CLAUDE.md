# CDUlog 프로젝트 - Claude Code 참조 문서

## 프로젝트 개요
- **프로젝트명**: CDUlog (실외기 유지보수 관리 시스템)
- **대상**: LG Chem 현장 작업자용 시스템
- **기술스택**: Next.js 15.3.5, React 19, TypeScript, Tailwind CSS
- **배포**: Vercel (https://cdulog.vercel.app)

## 주요 기능
- 실외기 목록 관리 및 상태 모니터링
- 보수 항목 입력 및 추적
- 인라인 내역 작성 및 완료 처리
- 보수 이력 관리 및 CSV 내보내기
- 공장별/상태별 필터링

## 개발 명령어
```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행  
npm run start

# 린트 검사
npm run lint

# 타입 체크
npm run typecheck  # (이 명령어는 현재 설정되지 않음 - 필요시 추가)
```

## 중요 파일 위치
- **메인 페이지**: `app/assets/page.tsx`
- **API 라우트**: `app/api/` 폴더
- **타입 정의**: `app/types/outdoor-unit.ts`
- **배포 설정**: `vercel.json`

## 배포 관련 중요 사항

### ⚠️ Vercel 배포 문제 발생 시
배포 문제가 발생하면 다음 문서를 참조하세요:
📋 **참조 문서**: `VERCEL_DEPLOYMENT_TROUBLESHOOTING.md`

### 자주 사용하는 배포 해결 방법
```bash
# 패키지 버전 업데이트로 강제 배포 (가장 효과적)
npm version patch
git push origin main --follow-tags

# 배포 상태 확인
curl -s https://cdulog.vercel.app | grep -o 'static/css/[^"]*\.css'
```

## 코딩 컨벤션
- TypeScript 사용 필수
- 함수형 컴포넌트 + React Hooks 패턴
- Tailwind CSS 유틸리티 클래스 사용
- 한국어 UI/UX (현장 작업자 친화적)
- 반응형 디자인 (모바일 우선)

## 주요 상태 관리 패턴
```typescript
// 실외기 목록 상태
const [outdoorUnits, setOutdoorUnits] = useState<OutdoorUnit[]>([]);

// 인라인 편집 상태  
const [inlineEditingRecord, setInlineEditingRecord] = useState<string | null>(null);
const [inlineNotes, setInlineNotes] = useState<{[key: string]: string}>({});

// 로딩 및 에러 상태
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

## API 엔드포인트
- `GET /api/outdoor-units` - 실외기 목록 조회
- `GET /api/maintenance-records?outdoorUnitId=xxx` - 보수 기록 조회  
- `POST /api/maintenance-records` - 새 보수 기록 생성
- `PUT /api/maintenance-records/:id` - 보수 기록 업데이트 (해제)
- `PUT /api/outdoor-units/:id` - 실외기 상태 업데이트
- `GET /api/export/maintenance-records?format=csv` - CSV 내보내기

## 테스트 및 검증
현재 별도의 테스트 프레임워크는 설정되지 않음. 수동 테스트를 통한 검증 수행.

### 주요 테스트 시나리오
1. 로그인 → 실외기 목록 조회
2. 실외기 선택 → 보수 항목 입력
3. 인라인 내역 작성 → 완료 처리
4. 보수 이력 확인
5. CSV 내보내기

## 문제 해결 가이드

### 자주 발생하는 문제들
1. **Vercel 배포 실패** → `VERCEL_DEPLOYMENT_TROUBLESHOOTING.md` 참조
2. **API 연결 실패** → 네트워크 오류 처리 로직 확인
3. **상태 동기화 문제** → React state 업데이트 패턴 검토
4. **CSS 스타일 깨짐** → Tailwind 클래스명 충돌 확인

### 디버깅 도구
- 브라우저 개발자 도구 콘솔
- Vercel 배포 로그
- GitHub Actions 로그 (있는 경우)

---

**마지막 업데이트**: 2025-01-22  
**현재 버전**: 1.0.1  
**Claude Code AI**: 이 문서를 참조하여 프로젝트 컨텍스트를 파악하고 효율적인 개발 지원을 제공하세요.