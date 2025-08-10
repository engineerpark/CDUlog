-- 실외기케어 대시보드 - RLS 정책 테스트 스크립트
-- rls-policies.sql 실행 후 이 파일로 정책을 테스트하세요

-- =================================================================
-- 1. RLS 정책 및 함수 존재 확인
-- =================================================================

-- RLS 활성화 상태 확인
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'units', 'maintenance_logs')
ORDER BY tablename;

-- 생성된 정책 목록 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    qual as using_expression,
    with_check as check_expression
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'units', 'maintenance_logs')
ORDER BY tablename, policyname;

-- 헬퍼 함수 존재 확인
SELECT 
    routine_name,
    routine_type,
    security_type,
    is_deterministic
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN (
    'get_my_role',
    'is_admin_or_manager', 
    'is_technician_or_above',
    'has_role_level',
    'test_rls_policies'
)
ORDER BY routine_name;

-- =================================================================
-- 2. 테스트 사용자 생성 가이드
-- =================================================================

DO $$
BEGIN
    RAISE NOTICE '👥 테스트 사용자 생성 방법:';
    RAISE NOTICE '';
    RAISE NOTICE '1. Supabase Dashboard > Authentication > Users';
    RAISE NOTICE '2. "Add user" 버튼으로 다음 사용자들 생성:';
    RAISE NOTICE '   - tech1@test.com (technician 역할)';
    RAISE NOTICE '   - manager1@test.com (manager 역할)';  
    RAISE NOTICE '   - admin1@test.com (admin 역할)';
    RAISE NOTICE '   - viewer1@test.com (viewer 역할)';
    RAISE NOTICE '';
    RAISE NOTICE '3. 각 사용자 생성 후 역할 설정:';
    RAISE NOTICE '   UPDATE profiles SET role = ''technician'' WHERE id = ''user-uuid'';';
    RAISE NOTICE '   UPDATE profiles SET role = ''manager'' WHERE id = ''user-uuid'';';
    RAISE NOTICE '   UPDATE profiles SET role = ''admin'' WHERE id = ''user-uuid'';';
    RAISE NOTICE '   UPDATE profiles SET role = ''viewer'' WHERE id = ''user-uuid'';';
END $$;

-- =================================================================
-- 3. 시뮬레이션 테스트 함수
-- =================================================================

-- 특정 사용자로 시뮬레이션하여 RLS 테스트
CREATE OR REPLACE FUNCTION public.simulate_user_test(
    test_user_id UUID,
    test_description TEXT DEFAULT 'RLS Test'
)
RETURNS TABLE (
    operation TEXT,
    table_name TEXT,
    result TEXT,
    details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    original_user_id TEXT;
    user_role TEXT;
    test_unit_id UUID;
    test_log_id UUID;
BEGIN
    -- 원본 사용자 정보 저장
    original_user_id := current_setting('request.jwt.claim.sub', true);
    
    -- 테스트용 사용자 설정
    PERFORM set_config('request.jwt.claim.sub', test_user_id::TEXT, true);
    
    -- 사용자 역할 확인
    SELECT role INTO user_role FROM profiles WHERE id = test_user_id;
    
    RETURN QUERY SELECT 
        'INFO'::TEXT, 
        'user'::TEXT, 
        'SETUP'::TEXT, 
        format('Testing as user %s with role %s', test_user_id, COALESCE(user_role, 'unknown'))::TEXT;
    
    -- =============================================================
    -- SELECT 테스트 (모든 사용자가 가능해야 함)
    -- =============================================================
    
    -- profiles SELECT 테스트
    BEGIN
        PERFORM COUNT(*) FROM profiles;
        RETURN QUERY SELECT 'SELECT'::TEXT, 'profiles'::TEXT, 'PASS'::TEXT, 'Can view profiles'::TEXT;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 'SELECT'::TEXT, 'profiles'::TEXT, 'FAIL'::TEXT, SQLERRM::TEXT;
    END;
    
    -- units SELECT 테스트
    BEGIN
        PERFORM COUNT(*) FROM units;
        RETURN QUERY SELECT 'SELECT'::TEXT, 'units'::TEXT, 'PASS'::TEXT, 'Can view units'::TEXT;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 'SELECT'::TEXT, 'units'::TEXT, 'FAIL'::TEXT, SQLERRM::TEXT;
    END;
    
    -- maintenance_logs SELECT 테스트
    BEGIN
        PERFORM COUNT(*) FROM maintenance_logs;
        RETURN QUERY SELECT 'SELECT'::TEXT, 'maintenance_logs'::TEXT, 'PASS'::TEXT, 'Can view maintenance logs'::TEXT;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 'SELECT'::TEXT, 'maintenance_logs'::TEXT, 'FAIL'::TEXT, SQLERRM::TEXT;
    END;
    
    -- =============================================================
    -- INSERT 테스트 (역할에 따라 다름)
    -- =============================================================
    
    -- units INSERT 테스트 (technician 이상만 가능)
    IF user_role IN ('technician', 'manager', 'admin') THEN
        BEGIN
            INSERT INTO units (name, location, created_by) 
            VALUES ('테스트 실외기', '테스트 위치', test_user_id) 
            RETURNING id INTO test_unit_id;
            
            RETURN QUERY SELECT 'INSERT'::TEXT, 'units'::TEXT, 'PASS'::TEXT, 
                format('Created unit %s', test_unit_id)::TEXT;
        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY SELECT 'INSERT'::TEXT, 'units'::TEXT, 'FAIL'::TEXT, SQLERRM::TEXT;
        END;
    ELSE
        BEGIN
            INSERT INTO units (name, location, created_by) 
            VALUES ('테스트 실외기', '테스트 위치', test_user_id);
            
            RETURN QUERY SELECT 'INSERT'::TEXT, 'units'::TEXT, 'FAIL'::TEXT, 
                'Should not allow insert for viewer'::TEXT;
        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY SELECT 'INSERT'::TEXT, 'units'::TEXT, 'PASS'::TEXT, 
                'Correctly blocked viewer from inserting'::TEXT;
        END;
    END IF;
    
    -- maintenance_logs INSERT 테스트 (technician 이상만 가능)
    IF user_role IN ('technician', 'manager', 'admin') AND test_unit_id IS NOT NULL THEN
        BEGIN
            INSERT INTO maintenance_logs (unit_id, user_id, title, maintenance_type)
            VALUES (test_unit_id, test_user_id, '테스트 유지보수', 'inspection')
            RETURNING id INTO test_log_id;
            
            RETURN QUERY SELECT 'INSERT'::TEXT, 'maintenance_logs'::TEXT, 'PASS'::TEXT,
                format('Created maintenance log %s', test_log_id)::TEXT;
        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY SELECT 'INSERT'::TEXT, 'maintenance_logs'::TEXT, 'FAIL'::TEXT, SQLERRM::TEXT;
        END;
    END IF;
    
    -- =============================================================
    -- UPDATE 테스트
    -- =============================================================
    
    -- 본인 프로필 UPDATE 테스트 (모든 사용자 가능)
    BEGIN
        UPDATE profiles SET full_name = '테스트 이름 ' || test_user_id::TEXT 
        WHERE id = test_user_id;
        
        RETURN QUERY SELECT 'UPDATE'::TEXT, 'profiles'::TEXT, 'PASS'::TEXT, 
            'Can update own profile'::TEXT;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 'UPDATE'::TEXT, 'profiles'::TEXT, 'FAIL'::TEXT, SQLERRM::TEXT;
    END;
    
    -- 본인 유지보수 로그 UPDATE 테스트
    IF test_log_id IS NOT NULL THEN
        BEGIN
            UPDATE maintenance_logs SET notes = '테스트 노트' 
            WHERE id = test_log_id;
            
            RETURN QUERY SELECT 'UPDATE'::TEXT, 'maintenance_logs'::TEXT, 'PASS'::TEXT,
                'Can update own maintenance log'::TEXT;
        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY SELECT 'UPDATE'::TEXT, 'maintenance_logs'::TEXT, 'FAIL'::TEXT, SQLERRM::TEXT;
        END;
    END IF;
    
    -- =============================================================
    -- 정리 (생성된 테스트 데이터 삭제)
    -- =============================================================
    
    -- 테스트 데이터 정리
    IF test_log_id IS NOT NULL THEN
        DELETE FROM maintenance_logs WHERE id = test_log_id;
    END IF;
    
    IF test_unit_id IS NOT NULL THEN
        DELETE FROM units WHERE id = test_unit_id;
    END IF;
    
    -- 원본 사용자 설정 복원
    IF original_user_id IS NOT NULL THEN
        PERFORM set_config('request.jwt.claim.sub', original_user_id, true);
    ELSE
        PERFORM set_config('request.jwt.claim.sub', '', true);
    END IF;
    
    RETURN QUERY SELECT 'CLEANUP'::TEXT, 'all'::TEXT, 'COMPLETE'::TEXT, 
        'Test data cleaned up'::TEXT;
END;
$$;

-- =================================================================
-- 4. 종합 테스트 실행 함수
-- =================================================================

-- 모든 역할에 대한 종합 테스트
CREATE OR REPLACE FUNCTION public.run_comprehensive_rls_test()
RETURNS TABLE (
    test_category TEXT,
    test_name TEXT,
    expected_result TEXT,
    actual_result TEXT,
    status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY SELECT 
        'RLS Status'::TEXT,
        'Table RLS Check'::TEXT,
        'All tables should have RLS enabled'::TEXT,
        (SELECT STRING_AGG(tablename || ':' || 
                CASE WHEN rowsecurity THEN 'ON' ELSE 'OFF' END, ', ')
         FROM pg_tables 
         WHERE schemaname = 'public' 
         AND tablename IN ('profiles', 'units', 'maintenance_logs'))::TEXT,
        CASE WHEN (SELECT COUNT(*) FROM pg_tables 
                  WHERE schemaname = 'public' 
                  AND tablename IN ('profiles', 'units', 'maintenance_logs')
                  AND rowsecurity = true) = 3
        THEN 'PASS' ELSE 'FAIL' END::TEXT;
    
    RETURN QUERY SELECT 
        'Policy Count'::TEXT,
        'Security Policies'::TEXT,
        'Should have multiple policies per table'::TEXT,
        (SELECT COUNT(*)::TEXT FROM pg_policies 
         WHERE schemaname = 'public'
         AND tablename IN ('profiles', 'units', 'maintenance_logs'))::TEXT,
        CASE WHEN (SELECT COUNT(*) FROM pg_policies 
                  WHERE schemaname = 'public'
                  AND tablename IN ('profiles', 'units', 'maintenance_logs')) > 10
        THEN 'PASS' ELSE 'FAIL' END::TEXT;
    
    RETURN QUERY SELECT 
        'Helper Functions'::TEXT,
        'RLS Helper Functions'::TEXT,
        'Should have all helper functions'::TEXT,
        (SELECT COUNT(*)::TEXT FROM information_schema.routines 
         WHERE routine_schema = 'public'
         AND routine_name IN ('get_my_role', 'is_admin_or_manager', 
                             'is_technician_or_above', 'has_role_level'))::TEXT,
        CASE WHEN (SELECT COUNT(*) FROM information_schema.routines 
                  WHERE routine_schema = 'public'
                  AND routine_name IN ('get_my_role', 'is_admin_or_manager', 
                                     'is_technician_or_above', 'has_role_level')) = 4
        THEN 'PASS' ELSE 'FAIL' END::TEXT;
END;
$$;

-- =================================================================
-- 실행 가이드
-- =================================================================

DO $$
BEGIN
    RAISE NOTICE '🧪 RLS 정책 테스트 가이드:';
    RAISE NOTICE '';
    RAISE NOTICE '📊 1. 기본 상태 확인:';
    RAISE NOTICE '   SELECT * FROM run_comprehensive_rls_test();';
    RAISE NOTICE '';
    RAISE NOTICE '👤 2. 인증된 사용자로 테스트 (로그인 후):';
    RAISE NOTICE '   SELECT * FROM test_rls_policies();';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 3. 시뮬레이션 테스트 (사용자 UUID 필요):';
    RAISE NOTICE '   SELECT * FROM simulate_user_test(''user-uuid-here'');';
    RAISE NOTICE '';
    RAISE NOTICE '📋 4. 수동 테스트 체크리스트:';
    RAISE NOTICE '   ✓ Technician으로 로그인하여 유지보수 로그 생성/수정';
    RAISE NOTICE '   ✓ Manager로 로그인하여 모든 데이터 수정/삭제';
    RAISE NOTICE '   ✓ Viewer로 로그인하여 조회만 가능한지 확인';
    RAISE NOTICE '   ✓ 타인의 데이터 수정 시도시 차단되는지 확인';
END $$;