-- 실외기케어 대시보드 - 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요

-- =================================================================
-- 1. 사용자 프로필 테이블 (profiles)
-- auth.users 테이블과 1:1 관계
-- =================================================================

CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT NOT NULL DEFAULT 'technician' CHECK (role IN ('admin', 'manager', 'technician', 'viewer')),
    full_name TEXT,
    phone TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 프로필 업데이트 시 자동으로 updated_at 갱신
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

-- =================================================================
-- 2. 실외기 정보 테이블 (units)
-- =================================================================

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

-- 실외기 업데이트 시 자동으로 updated_at 갱신
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

-- =================================================================
-- 3. 유지보수 상태 ENUM 타입 정의
-- =================================================================

CREATE TYPE maintenance_status AS ENUM (
    'scheduled',    -- 예정됨
    'in_progress',  -- 진행중
    'completed',    -- 완료
    'cancelled',    -- 취소됨
    'on_hold'       -- 대기중
);

CREATE TYPE maintenance_type AS ENUM (
    'preventive',   -- 예방정비
    'corrective',   -- 수정정비
    'emergency',    -- 응급정비
    'inspection'    -- 점검
);

-- =================================================================
-- 4. 유지보수 이력 테이블 (maintenance_logs)
-- =================================================================

CREATE TABLE maintenance_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- 유지보수 정보
    maintenance_type maintenance_type NOT NULL DEFAULT 'corrective',
    status maintenance_status NOT NULL DEFAULT 'scheduled',
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

-- 유지보수 로그 업데이트 시 자동으로 updated_at 갱신
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

-- =================================================================
-- 5. 성능 최적화를 위한 인덱스 생성
-- =================================================================

-- units 테이블 인덱스
CREATE INDEX idx_units_status ON units(status);
CREATE INDEX idx_units_location ON units(location);
CREATE INDEX idx_units_created_at ON units(created_at DESC);

-- maintenance_logs 테이블 인덱스
CREATE INDEX idx_maintenance_logs_unit_id ON maintenance_logs(unit_id);
CREATE INDEX idx_maintenance_logs_user_id ON maintenance_logs(user_id);
CREATE INDEX idx_maintenance_logs_status ON maintenance_logs(status);
CREATE INDEX idx_maintenance_logs_type ON maintenance_logs(maintenance_type);
CREATE INDEX idx_maintenance_logs_scheduled_date ON maintenance_logs(scheduled_date);
CREATE INDEX idx_maintenance_logs_created_at ON maintenance_logs(created_at DESC);

-- 복합 인덱스 (자주 함께 조회되는 컬럼들)
CREATE INDEX idx_maintenance_logs_unit_status ON maintenance_logs(unit_id, status);
CREATE INDEX idx_maintenance_logs_user_date ON maintenance_logs(user_id, created_at DESC);

-- =================================================================
-- 6. 유용한 뷰 생성
-- =================================================================

-- 실외기와 최신 유지보수 정보를 조합한 뷰
CREATE VIEW units_with_latest_maintenance AS
SELECT 
    u.*,
    ml.id as latest_maintenance_id,
    ml.maintenance_type as latest_maintenance_type,
    ml.status as latest_maintenance_status,
    ml.scheduled_date as latest_scheduled_date,
    ml.completed_at as latest_completed_at,
    p.full_name as latest_technician_name
FROM units u
LEFT JOIN LATERAL (
    SELECT * FROM maintenance_logs 
    WHERE unit_id = u.id 
    ORDER BY created_at DESC 
    LIMIT 1
) ml ON true
LEFT JOIN profiles p ON ml.user_id = p.id;

-- 유지보수 통계 뷰
CREATE VIEW maintenance_statistics AS
SELECT 
    u.id as unit_id,
    u.name as unit_name,
    u.location,
    COUNT(ml.id) as total_maintenance_count,
    COUNT(CASE WHEN ml.status = 'completed' THEN 1 END) as completed_maintenance_count,
    COUNT(CASE WHEN ml.status = 'scheduled' THEN 1 END) as scheduled_maintenance_count,
    AVG(CASE WHEN ml.actual_cost IS NOT NULL THEN ml.actual_cost END) as avg_maintenance_cost,
    MAX(ml.completed_at) as last_maintenance_date
FROM units u
LEFT JOIN maintenance_logs ml ON u.id = ml.unit_id
GROUP BY u.id, u.name, u.location;

-- =================================================================
-- 7. 기본 데이터 삽입
-- =================================================================

-- 샘플 프로필 데이터 (실제 사용 시 auth.users에 사용자가 있어야 함)
-- INSERT INTO profiles (id, role, full_name) VALUES
-- ('user-uuid-1', 'admin', '관리자'),
-- ('user-uuid-2', 'technician', '기술자1');

-- 샘플 실외기 데이터
INSERT INTO units (name, location, model, manufacturer, installation_date, status) VALUES
('본관동 1호기', '본관 옥상 동쪽', 'AC-2000X', 'LG전자', '2023-01-15', 'active'),
('본관동 2호기', '본관 옥상 서쪽', 'AC-2000X', 'LG전자', '2023-01-15', 'active'),
('별관동 1호기', '별관 옥상', 'AC-1500Y', '삼성전자', '2022-06-01', 'active'),
('강당 1호기', '강당 옥상', 'AC-3000Z', 'LG전자', '2023-03-10', 'maintenance');

-- 샘플 유지보수 이력 데이터 (실제 사용 시 user_id는 실제 사용자 UUID로 교체)
-- INSERT INTO maintenance_logs (unit_id, user_id, maintenance_type, status, title, description, scheduled_date) 
-- SELECT 
--     u.id,
--     'user-uuid-1',
--     'preventive',
--     'scheduled',
--     u.name || ' 정기점검',
--     '월례 정기점검 및 청소 작업',
--     NOW() + INTERVAL '7 days'
-- FROM units u
-- WHERE u.status = 'active';

-- =================================================================
-- 8. 함수 생성 (편의 기능)
-- =================================================================

-- 실외기별 다음 정기점검일 계산 함수
CREATE OR REPLACE FUNCTION get_next_maintenance_date(unit_uuid UUID)
RETURNS DATE AS $$
DECLARE
    last_maintenance_date DATE;
    maintenance_interval INTERVAL DEFAULT '3 months';
BEGIN
    -- 마지막 완료된 정기점검일 조회
    SELECT DATE(completed_at) INTO last_maintenance_date
    FROM maintenance_logs
    WHERE unit_id = unit_uuid 
      AND status = 'completed'
      AND maintenance_type = 'preventive'
    ORDER BY completed_at DESC
    LIMIT 1;
    
    -- 마지막 정기점검이 없으면 현재일부터 3개월 후
    IF last_maintenance_date IS NULL THEN
        RETURN CURRENT_DATE + maintenance_interval;
    END IF;
    
    -- 마지막 정기점검일부터 3개월 후
    RETURN last_maintenance_date + maintenance_interval;
END;
$$ LANGUAGE plpgsql;

-- 유지보수 비용 집계 함수
CREATE OR REPLACE FUNCTION get_maintenance_cost_summary(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '1 year',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
    unit_name TEXT,
    total_cost DECIMAL,
    maintenance_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.name,
        COALESCE(SUM(ml.actual_cost), 0) as total_cost,
        COUNT(ml.id) as maintenance_count
    FROM units u
    LEFT JOIN maintenance_logs ml ON u.id = ml.unit_id
        AND ml.completed_at BETWEEN start_date AND end_date
        AND ml.status = 'completed'
    GROUP BY u.id, u.name
    ORDER BY total_cost DESC;
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- 스키마 생성 완료 메시지
-- =================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ 실외기케어 대시보드 스키마 생성 완료!';
    RAISE NOTICE '📋 생성된 테이블: profiles, units, maintenance_logs';
    RAISE NOTICE '📊 생성된 뷰: units_with_latest_maintenance, maintenance_statistics';
    RAISE NOTICE '🔧 생성된 함수: get_next_maintenance_date(), get_maintenance_cost_summary()';
    RAISE NOTICE '🎯 다음 단계: T-003 (Supabase Auth 세팅 및 역할 분리)';
END $$;