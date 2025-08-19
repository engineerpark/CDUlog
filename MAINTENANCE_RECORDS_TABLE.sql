-- LG화학 청주공장 실외기 점검 이력 테이블
-- Supabase SQL Editor에서 실행하세요

-- 기존 테이블 삭제 (있는 경우)
DROP TABLE IF EXISTS maintenance_records CASCADE;

-- 점검 이력 테이블 생성
CREATE TABLE maintenance_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    outdoor_unit_id VARCHAR(50) NOT NULL,
    maintenance_date DATE NOT NULL,
    maintenance_type VARCHAR(20) CHECK (maintenance_type IN ('preventive', 'corrective', 'emergency')) NOT NULL,
    description TEXT NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('completed', 'in_progress', 'scheduled')) NOT NULL DEFAULT 'scheduled',
    next_maintenance_date DATE,
    cost DECIMAL(10,2),
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    resolved_date DATE,
    resolved_by VARCHAR(100),
    resolved_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 성능 최적화 인덱스
CREATE INDEX idx_maintenance_records_outdoor_unit_id ON maintenance_records(outdoor_unit_id);
CREATE INDEX idx_maintenance_records_maintenance_date ON maintenance_records(maintenance_date);
CREATE INDEX idx_maintenance_records_status ON maintenance_records(status);
CREATE INDEX idx_maintenance_records_created_at ON maintenance_records(created_at);

-- 자동 업데이트 타임스탬프 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_maintenance_records_updated_at 
    BEFORE UPDATE ON maintenance_records 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS 활성화 (익명 사용자 접근 허용)
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for maintenance_records" ON maintenance_records
FOR ALL USING (true) WITH CHECK (true);