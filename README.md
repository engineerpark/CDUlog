# CDUlog - 실외기 유지보수 관리 시스템

실외기 유지보수 이력을 간단하게 현장에서 입력할 수 있는 서비스

> 최종 업데이트: 2025-07-20 21:20:00 KST

## 🌐 배포 정보
- **Vercel 배포**: https://vercel.com/jhparks-projects-a744b512/cdulog
- **라이브 사이트**: https://cdulog.vercel.app

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
└── next.config.ts   # Next.js Configuration
```