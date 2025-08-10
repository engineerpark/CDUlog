-- 실외기케어 대시보드 - 스키마 검증 및 테스트 쿼리
-- database-schema.sql 실행 후 이 파일을 실행하여 검증하세요

-- =================================================================
-- 1. 테이블 생성 확인
-- =================================================================

DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'units', 'maintenance_logs');
    
    IF table_count = 3 THEN
        RAISE NOTICE '✅ 모든 테이블이 정상적으로 생성되었습니다 (3/3)';
    ELSE
        RAISE NOTICE '❌ 테이블 생성 확인: %/3개 테이블 발견', table_count;
    END IF;
END $$;

-- =================================================================
-- 2. 인덱스 생성 확인
-- =================================================================

SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('units', 'maintenance_logs', 'profiles')
ORDER BY tablename, indexname;

-- =================================================================
-- 3. 뷰 생성 확인
-- =================================================================

SELECT 
    table_name as view_name,
    is_updatable
FROM information_schema.views 
WHERE table_schema = 'public'
AND table_name IN ('units_with_latest_maintenance', 'maintenance_statistics');

-- =================================================================
-- 4. 함수 생성 확인
-- =================================================================

SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN ('get_next_maintenance_date', 'get_maintenance_cost_summary');

-- =================================================================
-- 5. 샘플 데이터 확인
-- =================================================================

-- 실외기 데이터 확인
SELECT 
    '실외기' as table_name,
    COUNT(*) as record_count
FROM units;

-- 실외기 목록 조회
SELECT 
    name,
    location,
    model,
    status,
    created_at
FROM units
ORDER BY created_at;

-- =================================================================
-- 6. 관계 및 제약조건 테스트
-- =================================================================

-- 유효하지 않은 unit_id로 maintenance_logs 삽입 시도 (실패해야 함)
DO $$
BEGIN
    BEGIN
        INSERT INTO maintenance_logs (unit_id, user_id, maintenance_type, title)
        VALUES ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'corrective', '테스트');
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✅ 외래 키 제약조건이 정상적으로 작동합니다: %', SQLERRM;
    END;
END $$;

-- =================================================================
-- 7. 뷰 테스트
-- =================================================================

-- 실외기와 최신 유지보수 정보 뷰 테스트
SELECT 
    name as unit_name,
    location,
    status,
    latest_maintenance_status,
    latest_maintenance_type
FROM units_with_latest_maintenance
LIMIT 5;

-- 유지보수 통계 뷰 테스트
SELECT 
    unit_name,
    location,
    total_maintenance_count,
    completed_maintenance_count
FROM maintenance_statistics
LIMIT 5;

-- =================================================================
-- 8. 함수 테스트
-- =================================================================

-- 다음 정기점검일 계산 함수 테스트
SELECT 
    u.name,
    get_next_maintenance_date(u.id) as next_maintenance_date
FROM units u
LIMIT 3;

-- 유지보수 비용 집계 함수 테스트
SELECT * FROM get_maintenance_cost_summary();

-- =================================================================
-- 9. 성능 테스트용 쿼리
-- =================================================================

-- 인덱스 사용 여부 확인 (EXPLAIN 계획)
EXPLAIN (ANALYZE, BUFFERS) 
SELECT u.name, ml.title, ml.status
FROM units u
JOIN maintenance_logs ml ON u.id = ml.unit_id
WHERE u.status = 'active'
AND ml.status = 'completed'
ORDER BY ml.created_at DESC;

-- =================================================================
-- 10. 데이터 무결성 검사
-- =================================================================

-- 고아 레코드 확인
SELECT 
    'maintenance_logs' as table_name,
    COUNT(*) as orphan_count
FROM maintenance_logs ml
LEFT JOIN units u ON ml.unit_id = u.id
WHERE u.id IS NULL;

-- 날짜 제약조건 확인
SELECT 
    id,
    scheduled_date,
    started_at,
    completed_at,
    CASE 
        WHEN started_at < scheduled_date THEN '❌ 시작일이 예정일보다 이름'
        WHEN completed_at < started_at THEN '❌ 완료일이 시작일보다 이름'
        ELSE '✅ 날짜 순서 정상'
    END as date_validation
FROM maintenance_logs
WHERE scheduled_date IS NOT NULL OR started_at IS NOT NULL OR completed_at IS NOT NULL;

-- =================================================================
-- 검증 완료 메시지
-- =================================================================

DO $$
BEGIN
    RAISE NOTICE '🔍 스키마 검증 완료!';
    RAISE NOTICE '📋 위의 결과를 확인하여 모든 구조가 정상적으로 생성되었는지 점검하세요.';
    RAISE NOTICE '🎯 다음 단계: T-003 (Supabase Auth 세팅 및 역할 분리)';
END $$;