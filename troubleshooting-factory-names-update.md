# CDUlog 소재지(Factory Names) 업데이트 트러블슈팅 가이드

**작업일**: 2025-08-20  
**작업 범위**: Supabase 데이터베이스에 factory_name 컬럼 추가 및 169개 실외기 소재지 정보 일괄 업데이트

## 🎯 작업 목표

- Supabase outdoor_units 테이블에 factory_name 컬럼 추가
- 163개 실외기의 소재지 정보 업데이트 (전자소재3공장, 전자소재6공장 등)
- UI에서 "Unknown" 대신 실제 공장명 표시

## ⚠️ 발생한 에러들

### 1. 데이터베이스 컬럼 누락 에러

**현상:**
```json
{
  "success": false,
  "error": "Could not find the 'factory_name' column of 'outdoor_units' in the schema cache"
}
```

**원인:**
- 코드에서 `factory_name` 컬럼을 읽으려 했지만 실제 데이터베이스에는 해당 컬럼이 존재하지 않음
- Supabase 테이블 스키마와 코드 간의 불일치

**해결책:**
```sql
-- Supabase SQL Editor에서 실행
ALTER TABLE outdoor_units 
ADD COLUMN factory_name TEXT;
```

### 2. ESLint 빌드 에러 (반복 발생)

**현상:**
```
Failed to compile.

./app/api/add-factory-column/route.ts
21:21  Error: 'alterData' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./app/assets/page.tsx
83:6  Warning: React Hook useEffect has a missing dependency: 'fetchOutdoorUnits'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
```

**원인:**
- 사용하지 않는 변수 `alterData` 선언
- React useEffect 훅의 의존성 배열 불완전

**해결책:**
```typescript
// ❌ 문제 코드
const { data: alterData, error: alterError } = await supabase
  .from('outdoor_units')
  .select('id')
  .limit(1);

// ✅ 수정 코드  
console.error('RPC exec_sql not available - manual column addition required');

// ❌ 문제 코드
useEffect(() => {
  checkAuth();
}, [router]);

// ✅ 수정 코드
useEffect(() => {
  checkAuth();
}, [router, fetchOutdoorUnits]);
```

### 3. Vercel 배포 캐시 문제

**현상:**
- GitHub에 새 커밋을 푸시했지만 Vercel이 계속 이전 커밋을 배포
- 수정된 코드가 반영되지 않고 동일한 빌드 에러 반복

**원인:**
- Vercel의 배포 큐나 캐시 시스템이 특정 커밋에 고착됨
- 빌드 에러가 있는 커밋을 반복적으로 시도

**해결책:**
1. **문제 파일 완전 제거**
   ```bash
   rm app/api/add-factory-column/route.ts
   git commit -m "Remove problematic file"
   ```

2. **강제 배포 트리거**
   ```bash
   echo "Deploy trigger $(date +%s)" > .deploy-trigger
   git add .deploy-trigger
   git commit -m "Force deploy trigger"
   git push origin main
   ```

3. **새 브랜치 생성 후 병합**
   ```bash
   git checkout -b hotfix-factory-names
   git push origin hotfix-factory-names
   git checkout main
   git merge hotfix-factory-names
   ```

## 🛠️ 성공적인 해결 과정

### 1단계: 데이터베이스 스키마 업데이트
```sql
-- Supabase Dashboard에서 실행
ALTER TABLE outdoor_units ADD COLUMN factory_name TEXT;
```

### 2단계: 코드 수정
```typescript
// supabase-data-store.ts
return (data || []).map(unit => ({
  id: unit.id,
  name: unit.name,
  factoryName: unit.factory_name || 'Unknown', // ✅ factory_name 컬럼 읽기
  // ... 기타 필드
}));
```

### 3단계: 일괄 업데이트 API 생성
```typescript
// app/api/bulk-update-units/route.ts
export async function POST(request: NextRequest) {
  const { updates } = await request.json();
  
  const updatePromises = updates.map(async (update) => {
    const { data, error } = await supabase
      .from('outdoor_units')
      .update({ 
        factory_name: update.factory_name,
        updated_at: new Date().toISOString() 
      })
      .eq('name', update.name);
    // ...
  });
}
```

### 4단계: 데이터 일괄 업데이트
```bash
# 배치별로 업데이트 실행
curl -X POST http://localhost:3000/api/bulk-update-units \
-H "Content-Type: application/json" \
-d '{"updates": [{"name": "AHU-H1-1호-CDU1", "factory_name": "전자소재3공장"}]}'
```

## 📊 최종 결과

**업데이트 완료:**
- 전자소재3공장: 37개
- 전자소재6공장: 16개  
- 전자소재7공장: 22개
- 전자소재8공장: 54개
- 전자소재9공장: 22개
- 부설연구소: 18개

**총 169개 실외기 소재지 정보 업데이트 완료**

## 🎓 교훈 및 개선 방안

### 1. 데이터베이스 스키마 변경 시 주의사항

**문제점:**
- 코드와 데이터베이스 스키마 간 동기화 누락

**개선방안:**
1. **스키마 우선 변경**: 데이터베이스 컬럼을 먼저 추가한 후 코드 수정
2. **마이그레이션 스크립트 활용**: 
   ```typescript
   // migrations/add-factory-name.sql
   ALTER TABLE outdoor_units ADD COLUMN IF NOT EXISTS factory_name TEXT;
   ```
3. **개발/프로덕션 환경 동기화**: 로컬에서 테스트 완료 후 프로덕션 반영

### 2. ESLint 에러 방지

**문제점:**
- 사용하지 않는 변수, 불완전한 의존성 배열

**개선방안:**
1. **개발 중 실시간 린트 체크**:
   ```bash
   npm run lint -- --watch
   ```

2. **Pre-commit 훅 설정**:
   ```json
   // package.json
   {
     "husky": {
       "hooks": {
         "pre-commit": "lint-staged"
       }
     },
     "lint-staged": {
       "*.{ts,tsx}": ["eslint --fix", "git add"]
     }
   }
   ```

3. **IDE 설정**: ESLint 자동 수정 활성화

### 3. 배포 안정성 강화

**문제점:**
- Vercel 캐시/큐 문제로 배포 지연

**개선방안:**

1. **단계별 배포 전략**:
   ```bash
   # 1. 로컬 빌드 테스트
   npm run build
   
   # 2. 작은 변경사항부터 배포
   git commit -m "Minor: Add types"
   
   # 3. 주요 변경사항 배포  
   git commit -m "Major: Database schema update"
   ```

2. **배포 확인 스크립트**:
   ```bash
   #!/bin/bash
   # deploy-check.sh
   echo "Checking deployment status..."
   
   # API 응답 확인
   response=$(curl -s https://cdulog.vercel.app/api/outdoor-units)
   
   if echo "$response" | jq '.success' | grep -q true; then
     echo "✅ Deployment successful"
   else
     echo "❌ Deployment failed"
     exit 1
   fi
   ```

3. **롤백 계획 수립**:
   ```bash
   # 문제 발생 시 이전 버전으로 롤백
   git revert HEAD
   git push origin main
   ```

### 4. 대용량 데이터 업데이트 최적화

**현재 방식:**
- 169개 데이터를 여러 배치로 나누어 순차 업데이트

**개선 방안:**
1. **트랜잭션 활용**:
   ```typescript
   const { data, error } = await supabase.rpc('bulk_update_units', {
     updates_json: JSON.stringify(updates)
   });
   ```

2. **배치 크기 최적화**: 한 번에 50개씩 처리하여 타임아웃 방지

3. **진행률 표시**: 사용자에게 업데이트 진행 상황 제공

## 🔄 재발 방지 체크리스트

### 배포 전 체크리스트

- [ ] 로컬 환경에서 `npm run build` 성공 확인
- [ ] ESLint 에러 0개 확인: `npm run lint`
- [ ] TypeScript 컴파일 에러 확인: `npx tsc --noEmit`
- [ ] 데이터베이스 스키마 변경 사항 문서화
- [ ] API 테스트 완료 (Postman/curl)

### 배포 후 체크리스트

- [ ] 프로덕션 API 응답 확인
- [ ] UI에서 실제 데이터 표시 확인  
- [ ] 에러 로그 모니터링
- [ ] 사용자 피드백 수집

## 📚 참고 자료

- [Supabase Database Schema Changes](https://supabase.com/docs/guides/database/managing-schema)
- [Next.js ESLint Configuration](https://nextjs.org/docs/app/api-reference/config/eslint)
- [Vercel Deployment Troubleshooting](https://vercel.com/docs/deployments/troubleshoot)

---

**작성자**: Claude AI  
**마지막 업데이트**: 2025-08-20  
**관련 커밋**: `44d8b56` (Factory names implementation)