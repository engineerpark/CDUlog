-- ===============================================
-- 점검 이력 테이블 생성 (기존 레이아웃 유지, 이력만 Supabase)
-- ===============================================

-- 기존 테이블이 있다면 삭제
DROP TABLE IF EXISTS maintenance_records;

-- 점검 이력 테이블 생성
CREATE TABLE maintenance_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    outdoor_unit_id VARCHAR(50) NOT NULL, -- 기존 로컬 실외기 ID 참조
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

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_maintenance_records_outdoor_unit_id ON maintenance_records(outdoor_unit_id);
CREATE INDEX idx_maintenance_records_maintenance_date ON maintenance_records(maintenance_date);
CREATE INDEX idx_maintenance_records_status ON maintenance_records(status);
CREATE INDEX idx_maintenance_records_is_active ON maintenance_records(is_active);
CREATE INDEX idx_maintenance_records_created_at ON maintenance_records(created_at);

-- 업데이트 시간 자동 갱신 트리거
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

-- RLS (Row Level Security) 활성화
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기/쓰기 가능 (익명 사용자 포함)
CREATE POLICY "Public can read maintenance_records" ON maintenance_records FOR SELECT USING (true);
CREATE POLICY "Public can insert maintenance_records" ON maintenance_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update maintenance_records" ON maintenance_records FOR UPDATE USING (true);
CREATE POLICY "Public can delete maintenance_records" ON maintenance_records FOR DELETE USING (true);

-- 샘플 데이터 (테스트용)
INSERT INTO maintenance_records (
    outdoor_unit_id, 
    maintenance_date, 
    maintenance_type, 
    description, 
    performed_by, 
    status,
    notes
) VALUES 
(
    '1', 
    '2025-01-20', 
    'preventive', 
    '정기 점검 및 청소 작업', 
    '점검자A', 
    'completed',
    'Supabase 연동 테스트 완료'
),
(
    '2', 
    '2025-01-20', 
    'corrective', 
    '냉각 성능 저하 문제 해결', 
    '점검자B', 
    'in_progress',
    '부품 교체 필요'
);

-- 테이블 생성 확인
SELECT 
    'maintenance_records 테이블 생성 완료' as status,
    COUNT(*) as sample_records
FROM maintenance_records;