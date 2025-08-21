-- CDUlog Supabase Schema Cleanup Script
-- 사용하지 않는 테이블, 뷰, 컬럼 삭제
-- 실행일: 2025-08-20

-- ===========================================
-- 1. 뷰 삭제
-- ===========================================

-- v_maintenance_records_detail 뷰 삭제 (한 곳에서만 사용, 대체 구현됨)
DROP VIEW IF EXISTS v_maintenance_records_detail;

-- ===========================================
-- 2. 미사용 테이블 삭제
-- ===========================================

-- factories 테이블 삭제 (완전히 미사용)
DROP TABLE IF EXISTS factories;

-- locations 테이블 삭제 (완전히 미사용)  
DROP TABLE IF EXISTS locations;

-- ===========================================
-- 3. 미사용 컬럼 삭제 (outdoor_units 테이블)
-- ===========================================

-- factory_id 컬럼 삭제 (factory_name으로 대체됨)
ALTER TABLE outdoor_units DROP COLUMN IF EXISTS factory_id;

-- location_id 컬럼 삭제 (location으로 대체됨)
ALTER TABLE outdoor_units DROP COLUMN IF EXISTS location_id;

-- model 컬럼 삭제 (현재 미사용)
ALTER TABLE outdoor_units DROP COLUMN IF EXISTS model;

-- manufacturer 컬럼 삭제 (현재 미사용)
ALTER TABLE outdoor_units DROP COLUMN IF EXISTS manufacturer;

-- serial_number 컬럼 삭제 (현재 미사용)
ALTER TABLE outdoor_units DROP COLUMN IF EXISTS serial_number;

-- ===========================================
-- 4. 정리 완료 확인
-- ===========================================

-- 남은 테이블 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- outdoor_units 테이블 컬럼 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'outdoor_units'
ORDER BY ordinal_position;

-- maintenance_records 테이블 컬럼 확인  
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'maintenance_records'
ORDER BY ordinal_position;

-- ===========================================
-- 스키마 정리 완료
-- ===========================================
-- 삭제된 항목:
-- - 테이블: factories, locations
-- - 뷰: v_maintenance_records_detail  
-- - 컬럼: outdoor_units.factory_id, location_id, model, manufacturer, serial_number
-- 
-- 유지된 핵심 테이블: outdoor_units, maintenance_records
-- ===========================================