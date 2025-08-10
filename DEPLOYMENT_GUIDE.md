# 🚀 실외기케어 대시보드 v2.0.0 배포 가이드

## ✅ 현재 배포 상태

### GitHub 저장소: [완료] ✅
- **저장소**: https://github.com/engineerpark/CDUlog
- **버전**: v2.0.0 태그 생성 완료
- **상태**: 모든 코드 푸시 완료 (26개 파일, 4,000+ 라인)

### Vercel 프로젝트: [진행중] 🟡
- **프로젝트**: https://vercel.com/jhparks-projects-a744b512/cdulog
- **도메인**: https://cdulog-mg26hdr1n-jhparks-projects-a744b512.vercel.app
- **상태**: GitHub 푸시로 자동 재배포 트리거됨

### Supabase 데이터베이스: [설정 필요] 🟡
- **프로젝트**: https://supabase.com/dashboard/project/kagztckyqatjrpazxtli
- **상태**: 스키마 설정 필요 (SQL 스크립트 실행)

## 🔧 다음 필요 작업

### 1. Supabase 데이터베이스 스키마 설정

Supabase SQL Editor에서 다음 파일들을 순서대로 실행하세요:

#### 1단계: 기본 스키마 생성
```sql
-- 파일: database-schema.sql 내용을 복사하여 실행
-- 테이블 생성: profiles, units, maintenance_logs
-- 인덱스, 뷰, 함수 생성 포함
```

#### 2단계: RLS 보안 정책 설정
```sql
-- 파일: rls-policies.sql 내용을 복사하여 실행
-- Row Level Security 활성화
-- 역할별 권한 정책 설정
-- 헬퍼 함수 생성
```

### 2. Vercel 환경변수 확인

Vercel 대시보드에서 환경변수가 올바르게 설정되었는지 확인:

```env
NEXT_PUBLIC_SUPABASE_URL=https://kagztckyqatjrpazxtli.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Supabase에서 확인]
NEXT_PUBLIC_APP_NAME=실외기케어
NEXT_PUBLIC_APP_VERSION=2.0.0
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_LOG_LEVEL=warn
NEXT_PUBLIC_ERROR_REPORTING=true
NEXT_PUBLIC_PERFORMANCE_MONITORING=true
```

### 3. 배포 완료 후 테스트

#### 기본 기능 테스트
- [ ] 사이트 접속 (https://cdulog-mg26hdr1n-jhparks-projects-a744b512.vercel.app)
- [ ] 회원가입/로그인 기능
- [ ] 대시보드 접속
- [ ] 실외기 등록/조회
- [ ] 유지보수 이력 등록/조회

#### 권한별 테스트
- [ ] Admin 계정 생성 및 모든 기능 접근
- [ ] Manager 계정 권한 테스트
- [ ] Technician 계정 권한 테스트
- [ ] Viewer 계정 읽기 전용 확인

#### 반응형 테스트
- [ ] 모바일 브라우저 접속
- [ ] 태블릿 화면 레이아웃
- [ ] 데스크톱 풀 기능

## 📋 Supabase SQL 스크립트

### 데이터베이스 스키마 (database-schema.sql)

```sql
-- 실외기케어 대시보드 - 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요

-- 1. 사용자 프로필 테이블
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT NOT NULL DEFAULT 'technician' CHECK (role IN ('admin', 'manager', 'technician', 'viewer')),
    full_name TEXT,
    phone TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 실외기 정보 테이블
CREATE TABLE units (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    model TEXT,
    manufacturer TEXT,
    installation_date DATE,
    warranty_end_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive', 'retired')),
    specifications JSONB DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 3. 유지보수 이력 테이블
CREATE TABLE maintenance_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- 유지보수 정보
    maintenance_type TEXT NOT NULL DEFAULT 'corrective' CHECK (maintenance_type IN ('preventive', 'corrective', 'emergency', 'inspection')),
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold')),
    title TEXT NOT NULL,
    description TEXT,
    notes TEXT,
    
    -- 일정 정보
    scheduled_date TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- 비용 정보
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    
    -- 부품 및 자료
    parts_used JSONB DEFAULT '[]',
    attachments JSONB DEFAULT '[]',
    
    -- 메타데이터
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 인덱스 생성 (성능 최적화)
CREATE INDEX idx_units_status ON units(status);
CREATE INDEX idx_units_location ON units(location);
CREATE INDEX idx_maintenance_logs_unit_id ON maintenance_logs(unit_id);
CREATE INDEX idx_maintenance_logs_user_id ON maintenance_logs(user_id);
CREATE INDEX idx_maintenance_logs_status ON maintenance_logs(status);

-- 5. 샘플 데이터
INSERT INTO units (name, location, model, manufacturer, status) VALUES
('본관동 1호기', '본관 옥상 동쪽', 'AC-2000X', 'LG전자', 'active'),
('본관동 2호기', '본관 옥상 서쪽', 'AC-2000X', 'LG전자', 'active'),
('별관동 1호기', '별관 옥상', 'AC-1500Y', '삼성전자', 'active');
```

### RLS 보안 정책 (rls-policies.sql)

```sql
-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;

-- 헬퍼 함수
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT 
LANGUAGE SQL 
STABLE 
SECURITY DEFINER
AS $$ 
SELECT role FROM public.profiles WHERE id = auth.uid() 
$$;

-- profiles 테이블 정책
CREATE POLICY "Authenticated users can view all profiles" ON profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- units 테이블 정책
CREATE POLICY "Authenticated users can view all units" ON units
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Technicians and above can create units" ON units
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('technician', 'manager', 'admin'))
    );

-- maintenance_logs 테이블 정책
CREATE POLICY "Authenticated users can view maintenance logs" ON maintenance_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create logs with own user_id" ON maintenance_logs
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('technician', 'manager', 'admin'))
    );
```

## 🎯 배포 완료 체크리스트

- [x] **GitHub 저장소**: v2.0.0 태그로 코드 배포 완료
- [x] **README 업데이트**: 새로운 기능 및 배포 정보 반영
- [ ] **Supabase 스키마**: SQL 스크립트 실행 필요
- [ ] **Vercel 환경변수**: 프로덕션 설정 확인 필요
- [ ] **배포 테스트**: 기능 동작 확인 필요
- [ ] **사용자 생성**: 초기 Admin 계정 생성 필요

## 🚀 배포 후 다음 단계

1. **초기 관리자 계정 생성**
2. **실외기 데이터 입력**
3. **사용자 역할 할당**
4. **모니터링 설정**
5. **백업 정책 수립**

---

**💡 중요**: Supabase SQL 스크립트를 실행한 후 Vercel 배포가 완료되면 완전히 동작하는 엔터프라이즈급 실외기케어 대시보드를 사용할 수 있습니다!