# 🗄️ Supabase 데이터베이스 설정 가이드

## 📋 Supabase 프로젝트 정보

- **프로젝트 URL**: https://kagztckyqatjrpazxtli.supabase.co
- **API Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthZ3p0Y2t5cWF0anJwYXp4dGxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3OTQwMTEsImV4cCI6MjA3MDM3MDAxMX0.pEpjYgrCHIW89tMcobBedToBn4j4joJh7FkpM4uft70`

## 🚀 설정 단계

### 1단계: Supabase SQL Editor 접속

1. [Supabase Dashboard](https://supabase.com/dashboard/project/kagztckyqatjrpazxtli) 접속
2. 좌측 메뉴에서 **SQL Editor** 클릭
3. **New Query** 버튼 클릭

### 2단계: 데이터베이스 스키마 생성

아래 SQL을 복사하여 SQL Editor에 붙여넣고 **RUN** 클릭:

```sql
-- 실외기케어 대시보드 - 데이터베이스 스키마
-- 1. 사용자 프로필 테이블 (profiles)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT NOT NULL DEFAULT 'technician' CHECK (role IN ('admin', 'manager', 'technician', 'viewer')),
    full_name TEXT,
    phone TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 프로필 업데이트 트리거
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profiles_updated_at();

-- 2. 실외기 정보 테이블 (units)
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

-- 실외기 업데이트 트리거
CREATE OR REPLACE FUNCTION update_units_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_units_updated_at
    BEFORE UPDATE ON units
    FOR EACH ROW
    EXECUTE FUNCTION update_units_updated_at();

-- 3. 유지보수 이력 테이블 (maintenance_logs)
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
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 제약조건
    CONSTRAINT valid_dates CHECK (
        (started_at IS NULL OR scheduled_date IS NULL OR started_at >= scheduled_date) AND
        (completed_at IS NULL OR started_at IS NULL OR completed_at >= started_at)
    )
);

-- 유지보수 로그 업데이트 트리거
CREATE OR REPLACE FUNCTION update_maintenance_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_maintenance_logs_updated_at
    BEFORE UPDATE ON maintenance_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_maintenance_logs_updated_at();

-- 4. 성능 최적화를 위한 인덱스 생성
CREATE INDEX idx_units_status ON units(status);
CREATE INDEX idx_units_location ON units(location);
CREATE INDEX idx_units_created_at ON units(created_at DESC);

CREATE INDEX idx_maintenance_logs_unit_id ON maintenance_logs(unit_id);
CREATE INDEX idx_maintenance_logs_user_id ON maintenance_logs(user_id);
CREATE INDEX idx_maintenance_logs_status ON maintenance_logs(status);
CREATE INDEX idx_maintenance_logs_type ON maintenance_logs(maintenance_type);
CREATE INDEX idx_maintenance_logs_scheduled_date ON maintenance_logs(scheduled_date);
CREATE INDEX idx_maintenance_logs_created_at ON maintenance_logs(created_at DESC);

-- 복합 인덱스
CREATE INDEX idx_maintenance_logs_unit_status ON maintenance_logs(unit_id, status);
CREATE INDEX idx_maintenance_logs_user_date ON maintenance_logs(user_id, created_at DESC);

-- 5. 샘플 데이터
INSERT INTO units (name, location, model, manufacturer, installation_date, status) VALUES
('본관동 1호기', '본관 옥상 동쪽', 'AC-2000X', 'LG전자', '2023-01-15', 'active'),
('본관동 2호기', '본관 옥상 서쪽', 'AC-2000X', 'LG전자', '2023-01-15', 'active'),
('별관동 1호기', '별관 옥상', 'AC-1500Y', '삼성전자', '2022-06-01', 'active'),
('강당 1호기', '강당 옥상', 'AC-3000Z', 'LG전자', '2023-03-10', 'maintenance');
```

### 3단계: RLS 보안 정책 설정

새로운 SQL 쿼리를 만들고 아래 SQL을 실행:

```sql
-- RLS(Row Level Security) 정책 설정
-- 1. RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;

-- 2. 헬퍼 함수 생성
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT 
LANGUAGE SQL 
STABLE 
SECURITY DEFINER
AS $$ 
SELECT role FROM public.profiles WHERE id = auth.uid() 
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS BOOLEAN 
LANGUAGE SQL 
STABLE 
SECURITY DEFINER
AS $$ 
SELECT EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() 
  AND role IN ('admin', 'manager')
)
$$;

CREATE OR REPLACE FUNCTION public.is_technician_or_above()
RETURNS BOOLEAN 
LANGUAGE SQL 
STABLE 
SECURITY DEFINER
AS $$ 
SELECT EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() 
  AND role IN ('technician', 'manager', 'admin')
)
$$;

-- 3. profiles 테이블 RLS 정책
CREATE POLICY "Authenticated users can view all profiles" ON profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert profiles" ON profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND (
            (get_my_role() NOT IN ('admin', 'manager') AND OLD.role = NEW.role) OR
            is_admin_or_manager()
        )
    );

CREATE POLICY "Only admins can delete profiles" ON profiles
    FOR DELETE USING (is_admin_or_manager());

-- 4. units 테이블 RLS 정책
CREATE POLICY "Authenticated users can view all units" ON units
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Technicians and above can create units" ON units
    FOR INSERT WITH CHECK (is_technician_or_above());

CREATE POLICY "Technicians and above can update units" ON units
    FOR UPDATE USING (is_technician_or_above())
    WITH CHECK (is_technician_or_above());

CREATE POLICY "Only managers and above can delete units" ON units
    FOR DELETE USING (is_admin_or_manager());

-- 5. maintenance_logs 테이블 RLS 정책
CREATE POLICY "Authenticated users can view maintenance logs" ON maintenance_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create logs with own user_id" ON maintenance_logs
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        is_technician_or_above()
    );

CREATE POLICY "Users can update own logs, managers can update all" ON maintenance_logs
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        is_admin_or_manager()
    )
    WITH CHECK (
        auth.uid() = user_id OR 
        is_admin_or_manager()
    );

CREATE POLICY "Users can delete own logs, managers can delete all" ON maintenance_logs
    FOR DELETE USING (
        auth.uid() = user_id OR 
        is_admin_or_manager()
    );
```

### 4단계: 자동 프로필 생성 트리거

새로운 SQL 쿼리를 만들고 아래 SQL을 실행:

```sql
-- 사용자 가입 시 자동으로 프로필 생성하는 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 
    'technician'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## ✅ 설정 완료 확인

설정이 완료되었는지 확인하려면:

```sql
-- 테이블 존재 확인
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'units', 'maintenance_logs');

-- 샘플 데이터 확인
SELECT COUNT(*) as unit_count FROM units;

-- RLS 정책 확인
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

## 🎯 다음 단계

1. ✅ **데이터베이스 스키마 생성 완료**
2. ✅ **RLS 보안 정책 설정 완료**  
3. ✅ **자동 프로필 생성 트리거 설정 완료**
4. 🔄 **Vercel 환경변수 업데이트 및 재배포**
5. 🧪 **최종 테스트 및 검증**

---

**💡 중요**: 모든 SQL 명령어를 순서대로 실행해야 정상적으로 작동합니다!