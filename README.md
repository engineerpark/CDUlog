# 실외기 유지보수 관리 시스템

실외기의 유지보수 이력을 간단하게 현장에서 입력할 수 있는 웹 애플리케이션입니다.

## 기술 스택

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- PWA (Progressive Web App)

### Backend
- FastAPI (Python)
- PostgreSQL + PostGIS
- Redis
- Alembic (Database Migrations)

### Infrastructure
- Docker & Docker Compose
- Kubernetes
- GitHub Actions (CI/CD)
- AWS S3 (File Storage)

## 개발 환경 설정

### 사전 요구사항
- Node.js 20+
- Python 3.12+
- Docker & Docker Compose

### 로컬 개발

1. 저장소 클론
```bash
git clone <repository-url>
cd <project-directory>
```

2. 환경 변수 설정
```bash
# Backend
cp backend/.env.example backend/.env
# Frontend
cp frontend/.env.example frontend/.env.local
```

3. 개발용 데이터베이스 실행
```bash
docker-compose -f docker-compose.dev.yml up -d
```

4. Backend 개발 서버 실행
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

5. Frontend 개발 서버 실행
```bash
cd frontend
npm install
npm run dev
```

### Docker Compose로 전체 스택 실행

```bash
# 전체 애플리케이션 실행
docker-compose up --build

# 백그라운드 실행
docker-compose up -d --build
```

## API 문서

FastAPI 자동 생성 문서: http://localhost:8000/docs

## 주요 기능

- 🔐 OAuth2 기반 SSO 로그인
- 🏭 실외기 자산 등록 및 관리
- 📝 현장 입력 폼 (오프라인 지원)
- 📊 대시보드 및 통계
- 📱 PWA (오프라인 모드)
- 🔄 GitHub 연동

## 배포

### Kubernetes 배포

```bash
# 네임스페이스 생성
kubectl apply -f infra/kubernetes/namespace.yaml

# 시크릿 생성
kubectl apply -f infra/kubernetes/secrets.yaml

# 서비스 배포
kubectl apply -f infra/kubernetes/postgres.yaml
kubectl apply -f infra/kubernetes/redis.yaml
kubectl apply -f infra/kubernetes/backend.yaml
kubectl apply -f infra/kubernetes/frontend.yaml
```

## 개발 가이드

자세한 개발 가이드는 다음 문서를 참고하세요:
- [PRD](prd.md) - 제품 요구사항 문서
- [Architecture](architecture.md) - 아키텍처 문서
- [Step-by-step](step-by-step.md) - 단계별 구현 가이드