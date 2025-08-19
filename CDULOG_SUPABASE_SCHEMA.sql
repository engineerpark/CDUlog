-- =====================================================
-- CDUlog 새로운 Supabase 프로젝트 데이터베이스 스키마
-- LG화학 청주공장 실외기 관리 시스템
-- =====================================================

-- 1. 공장/위치 마스터 테이블 (참조 데이터)
CREATE TABLE factories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- IT소재3공장, IT소재1공장 등
    code VARCHAR(20) NOT NULL UNIQUE,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    factory_id UUID REFERENCES factories(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- H1, H2, H3 등
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(factory_id, name)
);

-- 2. 실외기 기본 정보 (로컬과 동기화용)
CREATE TABLE outdoor_units (
    id VARCHAR(50) PRIMARY KEY, -- 로컬 ID와 동일하게 유지
    name VARCHAR(100) NOT NULL, -- AHU-H1-1호-CDU1
    factory_id UUID REFERENCES factories(id),
    location_id UUID REFERENCES locations(id),
    model VARCHAR(50) DEFAULT '일반형',
    manufacturer VARCHAR(50) DEFAULT '표준',
    serial_number VARCHAR(50),
    installation_date DATE,
    status VARCHAR(20) CHECK (status IN ('active', 'maintenance', 'inactive')) DEFAULT 'active',
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 점검/보수 이력 (핵심 누적 데이터)
CREATE TABLE maintenance_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    outdoor_unit_id VARCHAR(50) REFERENCES outdoor_units(id) ON DELETE CASCADE,
    maintenance_date DATE NOT NULL,
    maintenance_type VARCHAR(20) CHECK (maintenance_type IN ('preventive', 'corrective', 'emergency')) NOT NULL,
    description TEXT NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('completed', 'in_progress', 'scheduled')) NOT NULL DEFAULT 'scheduled',
    next_maintenance_date DATE,
    cost DECIMAL(10,2),
    notes TEXT,
    
    -- 해결 관련 정보
    is_active BOOLEAN NOT NULL DEFAULT true,
    resolved_date DATE,
    resolved_by VARCHAR(100),
    resolved_notes TEXT,
    
    -- 메타데이터
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 통계/집계 테이블 (분석용)
CREATE TABLE maintenance_statistics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    period_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
    period_date DATE NOT NULL,
    factory_id UUID REFERENCES factories(id),
    location_id UUID REFERENCES locations(id),
    
    -- 통계 데이터
    total_units INTEGER DEFAULT 0,
    active_units INTEGER DEFAULT 0,
    maintenance_units INTEGER DEFAULT 0,
    inactive_units INTEGER DEFAULT 0,
    
    -- 점검 통계
    total_maintenance_records INTEGER DEFAULT 0,
    preventive_count INTEGER DEFAULT 0,
    corrective_count INTEGER DEFAULT 0,
    emergency_count INTEGER DEFAULT 0,
    completed_count INTEGER DEFAULT 0,
    in_progress_count INTEGER DEFAULT 0,
    
    -- 비용 통계
    total_cost DECIMAL(12,2) DEFAULT 0,
    average_cost DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(period_type, period_date, factory_id, location_id)
);

-- =====================================================
-- 인덱스 생성 (성능 최적화)
-- =====================================================

-- 기본 조회 성능을 위한 인덱스
CREATE INDEX idx_outdoor_units_factory_location ON outdoor_units(factory_id, location_id);
CREATE INDEX idx_outdoor_units_status ON outdoor_units(status);
CREATE INDEX idx_outdoor_units_next_maintenance ON outdoor_units(next_maintenance_date);

-- 점검 이력 조회 성능을 위한 인덱스
CREATE INDEX idx_maintenance_records_unit_id ON maintenance_records(outdoor_unit_id);
CREATE INDEX idx_maintenance_records_date ON maintenance_records(maintenance_date);
CREATE INDEX idx_maintenance_records_status ON maintenance_records(status);
CREATE INDEX idx_maintenance_records_active ON maintenance_records(is_active);
CREATE INDEX idx_maintenance_records_created ON maintenance_records(created_at);

-- 복합 인덱스 (자주 함께 조회되는 컬럼들)
CREATE INDEX idx_maintenance_records_unit_active ON maintenance_records(outdoor_unit_id, is_active);
CREATE INDEX idx_maintenance_records_date_type ON maintenance_records(maintenance_date, maintenance_type);

-- 통계 테이블 인덱스
CREATE INDEX idx_maintenance_statistics_period ON maintenance_statistics(period_type, period_date);
CREATE INDEX idx_maintenance_statistics_factory ON maintenance_statistics(factory_id, period_date);

-- =====================================================
-- 트리거 함수 (자동 업데이트)
-- =====================================================

-- 업데이트 시간 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 모든 테이블에 업데이트 트리거 적용
CREATE TRIGGER update_factories_updated_at 
    BEFORE UPDATE ON factories FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at 
    BEFORE UPDATE ON locations FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outdoor_units_updated_at 
    BEFORE UPDATE ON outdoor_units FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_records_updated_at 
    BEFORE UPDATE ON maintenance_records FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_statistics_updated_at 
    BEFORE UPDATE ON maintenance_statistics FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS (Row Level Security) 설정
-- =====================================================

-- 모든 테이블에 RLS 활성화 (공개 접근 허용)
ALTER TABLE factories ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE outdoor_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_statistics ENABLE ROW LEVEL SECURITY;

-- 공개 접근 정책 (익명 사용자 포함)
CREATE POLICY "Public access for factories" ON factories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for locations" ON locations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for outdoor_units" ON outdoor_units FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for maintenance_records" ON maintenance_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for maintenance_statistics" ON maintenance_statistics FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 초기 데이터 삽입
-- =====================================================

-- 공장 데이터
INSERT INTO factories (name, code) VALUES 
('IT소재3공장', 'IT3'),
('IT소재1공장', 'IT1'),
('IT소재2공장', 'IT2');

-- 위치 데이터 (IT소재3공장 기준)
WITH factory AS (SELECT id FROM factories WHERE code = 'IT3')
INSERT INTO locations (factory_id, name, description) 
SELECT factory.id, location_name, location_name || ' 구역'
FROM factory, (VALUES ('H1'), ('H2'), ('H3'), ('H4'), ('H5')) AS t(location_name);

-- =====================================================
-- 유용한 뷰 생성
-- =====================================================

-- 실외기 상세 정보 뷰 (조인된 데이터)
CREATE VIEW v_outdoor_units_detail AS
SELECT 
    ou.id,
    ou.name,
    f.name as factory_name,
    l.name as location_name,
    ou.model,
    ou.manufacturer,
    ou.serial_number,
    ou.installation_date,
    ou.status,
    ou.last_maintenance_date,
    ou.next_maintenance_date,
    ou.notes,
    ou.created_at,
    ou.updated_at,
    -- 활성 보수 항목 개수
    COALESCE(active_maintenance.count, 0) as active_maintenance_count
FROM outdoor_units ou
LEFT JOIN factories f ON ou.factory_id = f.id
LEFT JOIN locations l ON ou.location_id = l.id
LEFT JOIN (
    SELECT outdoor_unit_id, COUNT(*) as count
    FROM maintenance_records 
    WHERE is_active = true
    GROUP BY outdoor_unit_id
) active_maintenance ON ou.id = active_maintenance.outdoor_unit_id;

-- 점검 이력 상세 정보 뷰
CREATE VIEW v_maintenance_records_detail AS
SELECT 
    mr.*,
    ou.name as unit_name,
    f.name as factory_name,
    l.name as location_name
FROM maintenance_records mr
JOIN outdoor_units ou ON mr.outdoor_unit_id = ou.id
LEFT JOIN factories f ON ou.factory_id = f.id
LEFT JOIN locations l ON ou.location_id = l.id
ORDER BY mr.created_at DESC;

-- =====================================================
-- 완료 메시지
-- =====================================================
SELECT 
    'CDUlog Supabase 데이터베이스 스키마 생성 완료!' as status,
    COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('factories', 'locations', 'outdoor_units', 'maintenance_records', 'maintenance_statistics');