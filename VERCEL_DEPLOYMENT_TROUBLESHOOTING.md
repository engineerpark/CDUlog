# Vercel 배포 문제 해결 가이드

## 문제 정의
**문제상황**: GitHub에 커밋이 성공적으로 푸시되었지만 Vercel 자동 배포가 트리거되지 않는 문제

**발생일시**: 2025-01-22  
**프로젝트**: CDUlog (실외기 유지보수 관리 시스템)  
**저장소**: https://github.com/engineerpark/CDUlog.git  
**Vercel URL**: https://cdulog.vercel.app

## 증상
- ✅ GitHub 커밋 및 푸시 성공 
- ❌ Vercel 자동 배포가 트리거되지 않음
- ❌ 프로덕션 환경에 변경사항이 반영되지 않음
- ✅ GitHub Actions나 다른 CI/CD는 정상 작동

## 문제 원인 분석

### 1차 원인: Vercel Webhook 연결 문제
- GitHub과 Vercel 간의 webhook 연결이 일시적으로 끊어짐
- 가능한 원인:
  - Vercel 플랫폼 내부 이슈
  - GitHub webhook 설정 불일치
  - 네트워크 연결 문제
  - Vercel 리소스 제한 도달

### 2차 원인: 배포 트리거 조건 불충족
- 특정 브랜치나 파일 변경에만 반응하도록 설정된 경우
- vercel.json 설정 문제
- Git 히스토리나 커밋 메시지 패턴 문제

### **🆕 3차 원인: 빌드 에러로 인한 배포 실패 (2025-01-22 추가)**
- TypeScript 타입 에러로 인한 컴파일 실패
- 제거된 필드(`capacity`) 참조 에러
- 인터페이스 변경 후 누락된 파일들

## 해결 과정 및 시도한 방법

### 1단계: 강제 트리거 파일 생성
```bash
# webhook 트리거용 파일 생성
echo "Vercel Webhook Force Trigger" > vercel-webhook-trigger.txt
git add vercel-webhook-trigger.txt
git commit -m "trigger: Vercel webhook 강제 실행"
git push origin main
```
**결과**: ❌ 배포 트리거되지 않음

### 2단계: Empty Commit 시도
```bash
# Empty 커밋으로 배포 강제 시도
git commit --allow-empty -m "deploy: Empty 커밋으로 Vercel 배포 강제 트리거"
git push origin main
```
**결과**: ❌ 배포 트리거되지 않음

### 3단계: vercel.json 설정 수정
```json
{
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next"
}
```
**결과**: ❌ 여전히 배포 트리거되지 않음

### 4단계: 패키지 버전 업데이트 (최종 해결)
```json
{
  "name": "cdulog",
  "version": "1.0.1"  // 1.0.0에서 1.0.1로 변경
}
```
**결과**: ✅ 배포 성공! CSS 해시 변경 확인됨

### **🆕 5단계: 빌드 에러 해결 (2025-01-22 추가)**
**문제**: TypeScript 컴파일 에러
```
Property 'capacity' does not exist on type 'OutdoorUnit'
```

**해결 과정**:
1. **첫 번째 에러**: `app/api/export/maintenance-records/route.ts`
   ```typescript
   // ❌ 에러 발생
   unit.capacity.toString()
   
   // ✅ 수정
   unit.location || '미지정'
   ```

2. **두 번째 에러**: `app/assets/add/page.tsx`  
   ```typescript
   // ❌ 에러 발생
   capacity: 0,
   
   // ✅ 수정
   factoryName: '',
   ```

**결과**: ✅ 빌드 성공, 배포 완료!

## 최종 해결 방법

### 즉시 해결 방법 (일반적인 배포 문제)
1. **package.json 버전 업데이트**
   ```bash
   npm version patch
   ```

2. **환경 변수 파일 업데이트**
   ```bash
   # .env.example 파일 생성/수정
   NODE_ENV=production
   NEXT_PUBLIC_APP_VERSION=1.0.4
   DEPLOY_TIMESTAMP=2025-01-22T17:15:00
   ```

3. **커밋 및 푸시**
   ```bash
   git push origin main --follow-tags
   ```

### **🆕 빌드 에러 해결 방법**
1. **타입 에러 확인**:
   ```bash
   npm run build
   # 또는 로컬에서 타입 체크
   npx tsc --noEmit
   ```

2. **에러 발생 파일 수정**:
   - 제거된 필드 참조 삭제
   - 인터페이스 변경사항 반영
   - 타입 정의 업데이트

3. **수정 후 재배포**:
   ```bash
   git add .
   git commit -m "fix: 빌드 에러 수정"
   git push origin main
   npm version patch
   git push origin main --follow-tags
   ```

### 장기적 해결 방법

#### 1. Vercel Dashboard 설정 확인
- Vercel 대시보드에서 Git Integration 상태 확인
- Webhook 설정 재연결 필요시 수행

#### 2. 배포 트리거 조건 명확화
```json
// vercel.json
{
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  }
}
```

#### 3. 환경별 배포 설정
```json
// package.json scripts 추가
{
  "scripts": {
    "deploy:force": "npm version patch && git push origin main --follow-tags",
    "deploy:check": "curl -f https://cdulog.vercel.app || exit 1",
    "build:check": "npm run build && npx tsc --noEmit"
  }
}
```

## 예방 방법

### 1. 정기적인 배포 상태 확인
```bash
# 스크립트 예제: deployment-check.sh
#!/bin/bash
CURRENT_COMMIT=$(git rev-parse --short HEAD)
DEPLOYED_VERSION=$(curl -s https://cdulog.vercel.app | grep -o 'static.*\.css' | head -1)

echo "Current commit: $CURRENT_COMMIT"
echo "Deployed assets: $DEPLOYED_VERSION"
```

### 2. **🆕 빌드 에러 예방**
```bash
# pre-commit hook 설정
#!/bin/sh
npm run build
if [ $? -ne 0 ]; then
  echo "❌ 빌드 실패: 커밋을 중단합니다"
  exit 1
fi

npx tsc --noEmit
if [ $? -ne 0 ]; then
  echo "❌ 타입 체크 실패: 커밋을 중단합니다"
  exit 1
fi
```

### 3. 배포 상태 모니터링
- Vercel webhook 로그 정기 확인
- GitHub Actions으로 배포 상태 확인 자동화
- 배포 실패 알림 설정

### 4. 백업 배포 전략
```json
// package.json에 배포 관련 스크립트 추가
{
  "scripts": {
    "deploy:manual": "vercel --prod",
    "deploy:force": "npm version patch && git push --follow-tags",
    "check:deployment": "curl -f https://cdulog.vercel.app"
  }
}
```

## 트러블슈팅 체크리스트

### 문제 발생 시 순서대로 시도할 방법:

1. **[ ] 기본 확인사항**
   - GitHub 커밋이 원격 저장소에 정상 푸시되었는지 확인
   - Vercel 대시보드에서 최근 배포 로그 확인
   - 네트워크 연결 상태 확인

2. **🆕 [ ] 빌드 에러 확인 (우선 순위 높음)**
   ```bash
   # 로컬에서 빌드 테스트
   npm run build
   
   # 타입 체크
   npx tsc --noEmit
   
   # 에러 발생 시 해당 파일 수정
   ```

3. **[ ] 2단계: 간단한 트리거**
   ```bash
   # 설정 파일 수정으로 배포 트리거
   touch force-deploy.txt
   git add force-deploy.txt
   git commit -m "deploy: Force deployment trigger"
   git push origin main
   ```

4. **[ ] 3단계: vercel.json 수정**
   ```bash
   # vercel.json에 타임스탬프나 설정 추가
   git add vercel.json
   git commit -m "fix: Update vercel configuration"
   git push origin main
   ```

5. **[ ] 4단계: 패키지 버전 업데이트 (권장)**
   ```bash
   # package.json 버전 증가
   npm version patch
   git push origin main --follow-tags
   ```

6. **[ ] 5단계: 수동 배포 (최후 수단)**
   ```bash
   # Vercel CLI 사용
   npx vercel --prod
   ```

## 배포 성공 확인 방법

```bash
# 1. JavaScript 파일 해시 변경 확인 (가장 확실한 방법)
curl -s https://cdulog.vercel.app | grep -o 'static/chunks/app/page-[^"]*\.js'

# 2. CSS 해시 변경 확인
curl -s https://cdulog.vercel.app | grep -o 'static/css/[^"]*\.css'

# 3. 애플리케이션 정상 작동 확인
curl -f https://cdulog.vercel.app

# 4. 특정 기능 확인 (로그인 페이지 로드 여부)
curl -s https://cdulog.vercel.app | grep "실외기 유지보수 관리 시스템"
```

## 관련 링크 및 참조

- [Vercel 공식 문서 - Git Integration](https://vercel.com/docs/concepts/git)
- [Vercel 배포 트러블슈팅](https://vercel.com/docs/concepts/deployments/troubleshoot-a-build)
- [GitHub Webhooks 설정](https://docs.github.com/en/developers/webhooks-and-events/webhooks)
- [Next.js 빌드 에러 해결](https://nextjs.org/docs/messages)

---

**작성일**: 2025-01-22  
**마지막 업데이트**: 2025-01-22  
**작성자**: Claude Code AI Assistant  

> 💡 **참고**: 이 문서는 실제 발생한 Vercel 배포 문제를 바탕으로 작성되었습니다. 유사한 문제 발생 시 이 가이드를 참조하여 단계별로 해결하시기 바랍니다.

> ⚠️ **중요**: 2025-01-22 업데이트로 빌드 에러 해결 방법이 추가되었습니다. 배포 실패 시 반드시 빌드 에러를 먼저 확인하세요!