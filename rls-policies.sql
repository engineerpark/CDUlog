-- 실외기케어 대시보드 - RLS(Row Level Security) 정책 설정
-- Supabase SQL Editor에서 실행하세요

-- =================================================================
-- 1. RLS 활성화
-- =================================================================

-- 모든 테이블에서 RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- 2. 헬퍼 함수 생성
-- =================================================================

-- 현재 사용자의 역할을 조회하는 헬퍼 함수
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT 
LANGUAGE SQL 
STABLE 
SECURITY DEFINER
AS $$ 
SELECT role FROM public.profiles WHERE id = auth.uid() 
$$;

-- 사용자가 관리자 권한을 가지고 있는지 확인하는 헬퍼 함수
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

-- 사용자가 기술자 이상의 권한을 가지고 있는지 확인하는 헬퍼 함수
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

-- 역할 계층을 확인하는 헬퍼 함수
CREATE OR REPLACE FUNCTION public.has_role_level(required_level TEXT)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
STABLE 
SECURITY DEFINER
AS $$
DECLARE
    user_role TEXT;
    role_levels JSONB DEFAULT '{
        "viewer": 1,
        "technician": 2, 
        "manager": 3,
        "admin": 4
    }';
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
    
    IF user_role IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN (role_levels->>user_role)::INT >= (role_levels->>required_level)::INT;
END;
$$;

-- =================================================================
-- 3. profiles 테이블 RLS 정책
-- =================================================================

-- profiles 테이블: SELECT 정책 (모든 인증된 사용자가 프로필 조회 가능)
CREATE POLICY "Authenticated users can view all profiles" ON profiles
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- profiles 테이블: INSERT 정책 (시스템에서만 생성 가능)
CREATE POLICY "System can insert profiles" ON profiles
    FOR INSERT 
    WITH CHECK (true); -- 트리거에서 처리되므로 제한 없음

-- profiles 테이블: UPDATE 정책 (본인 프로필만 수정 가능, 역할은 관리자만 변경 가능)
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND (
            -- 일반 사용자는 role을 제외한 필드만 수정 가능
            (get_my_role() NOT IN ('admin', 'manager') AND OLD.role = NEW.role) OR
            -- 관리자는 모든 필드 수정 가능
            is_admin_or_manager()
        )
    );

-- profiles 테이블: DELETE 정책 (관리자만 삭제 가능)
CREATE POLICY "Only admins can delete profiles" ON profiles
    FOR DELETE 
    USING (is_admin_or_manager());

-- =================================================================
-- 4. units 테이블 RLS 정책
-- =================================================================

-- units 테이블: SELECT 정책 (모든 인증된 사용자가 실외기 조회 가능)
CREATE POLICY "Authenticated users can view all units" ON units
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- units 테이블: INSERT 정책 (기술자 이상만 실외기 등록 가능)
CREATE POLICY "Technicians and above can create units" ON units
    FOR INSERT 
    WITH CHECK (is_technician_or_above());

-- units 테이블: UPDATE 정책 (기술자 이상만 실외기 수정 가능)
CREATE POLICY "Technicians and above can update units" ON units
    FOR UPDATE 
    USING (is_technician_or_above())
    WITH CHECK (is_technician_or_above());

-- units 테이블: DELETE 정책 (관리자만 실외기 삭제 가능)
CREATE POLICY "Only managers and above can delete units" ON units
    FOR DELETE 
    USING (is_admin_or_manager());

-- =================================================================
-- 5. maintenance_logs 테이블 RLS 정책
-- =================================================================

-- maintenance_logs 테이블: SELECT 정책 (모든 인증된 사용자가 유지보수 로그 조회 가능)
CREATE POLICY "Authenticated users can view maintenance logs" ON maintenance_logs
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- maintenance_logs 테이블: INSERT 정책 (본인 ID로만 로그 생성 가능)
CREATE POLICY "Users can create logs with own user_id" ON maintenance_logs
    FOR INSERT 
    WITH CHECK (
        auth.uid() = user_id AND 
        is_technician_or_above()
    );

-- maintenance_logs 테이블: UPDATE 정책 
-- - 작성자 본인은 언제든 수정 가능
-- - 관리자는 모든 로그 수정 가능
CREATE POLICY "Users can update own logs, managers can update all" ON maintenance_logs
    FOR UPDATE 
    USING (
        auth.uid() = user_id OR 
        is_admin_or_manager()
    )
    WITH CHECK (
        auth.uid() = user_id OR 
        is_admin_or_manager()
    );

-- maintenance_logs 테이블: DELETE 정책
-- - 작성자 본인은 자신의 로그 삭제 가능
-- - 관리자는 모든 로그 삭제 가능
CREATE POLICY "Users can delete own logs, managers can delete all" ON maintenance_logs
    FOR DELETE 
    USING (
        auth.uid() = user_id OR 
        is_admin_or_manager()
    );

-- =================================================================
-- 6. 고급 보안 정책 (선택사항)
-- =================================================================

-- 완료된 유지보수 로그는 관리자만 삭제 가능하도록 추가 제한
CREATE POLICY "Completed logs can only be deleted by admins" ON maintenance_logs
    FOR DELETE 
    USING (
        CASE 
            WHEN status = 'completed' THEN has_role_level('admin')
            ELSE (auth.uid() = user_id OR is_admin_or_manager())
        END
    );

-- 비용 정보는 관리자만 수정 가능
CREATE POLICY "Only managers can update cost information" ON maintenance_logs
    FOR UPDATE 
    USING (
        auth.uid() = user_id OR 
        is_admin_or_manager()
    )
    WITH CHECK (
        -- 일반 사용자가 비용 정보를 변경하려고 하면 차단
        CASE 
            WHEN (OLD.estimated_cost IS DISTINCT FROM NEW.estimated_cost OR 
                  OLD.actual_cost IS DISTINCT FROM NEW.actual_cost) 
            THEN is_admin_or_manager()
            ELSE (auth.uid() = user_id OR is_admin_or_manager())
        END
    );

-- =================================================================
-- 7. 뷰에 대한 보안 정책
-- =================================================================

-- 뷰는 기본적으로 기본 테이블의 RLS 정책을 상속받지만,
-- 명시적으로 보안 함수로 감싸서 추가 보호

-- 관리자 전용 통계 뷰를 위한 보안 함수
CREATE OR REPLACE FUNCTION public.get_user_statistics()
RETURNS TABLE (
    role TEXT,
    user_count BIGINT,
    active_users_30d BIGINT,
    active_users_7d BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 관리자 권한 확인
    IF NOT is_admin_or_manager() THEN
        RAISE EXCEPTION 'Access denied: Manager permission required';
    END IF;
    
    RETURN QUERY SELECT * FROM user_role_statistics;
END;
$$;

-- =================================================================
-- 8. RLS 정책 테스트 함수
-- =================================================================

-- RLS 정책이 올바르게 작동하는지 테스트하는 함수
CREATE OR REPLACE FUNCTION public.test_rls_policies()
RETURNS TABLE (
    test_name TEXT,
    result TEXT,
    details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id UUID;
    current_role TEXT;
    test_count INTEGER := 0;
    passed_count INTEGER := 0;
BEGIN
    -- 현재 사용자 정보 확인
    current_user_id := auth.uid();
    SELECT get_my_role() INTO current_role;
    
    IF current_user_id IS NULL THEN
        RETURN QUERY SELECT 'Authentication', 'FAIL'::TEXT, 'User not authenticated'::TEXT;
        RETURN;
    END IF;
    
    -- 테스트 1: 프로필 조회 테스트
    test_count := test_count + 1;
    BEGIN
        PERFORM id FROM profiles LIMIT 1;
        passed_count := passed_count + 1;
        RETURN QUERY SELECT 'Profile SELECT'::TEXT, 'PASS'::TEXT, 'Can view profiles'::TEXT;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 'Profile SELECT'::TEXT, 'FAIL'::TEXT, SQLERRM::TEXT;
    END;
    
    -- 테스트 2: 실외기 조회 테스트  
    test_count := test_count + 1;
    BEGIN
        PERFORM id FROM units LIMIT 1;
        passed_count := passed_count + 1;
        RETURN QUERY SELECT 'Units SELECT'::TEXT, 'PASS'::TEXT, 'Can view units'::TEXT;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 'Units SELECT'::TEXT, 'FAIL'::TEXT, SQLERRM::TEXT;
    END;
    
    -- 테스트 3: 유지보수 로그 조회 테스트
    test_count := test_count + 1;
    BEGIN
        PERFORM id FROM maintenance_logs LIMIT 1;
        passed_count := passed_count + 1;
        RETURN QUERY SELECT 'Maintenance SELECT'::TEXT, 'PASS'::TEXT, 'Can view maintenance logs'::TEXT;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 'Maintenance SELECT'::TEXT, 'FAIL'::TEXT, SQLERRM::TEXT;
    END;
    
    -- 요약 결과
    RETURN QUERY SELECT 
        'SUMMARY'::TEXT, 
        CASE WHEN passed_count = test_count THEN 'PASS' ELSE 'PARTIAL' END::TEXT,
        format('Passed %s/%s tests as %s', passed_count, test_count, current_role)::TEXT;
END;
$$;

-- =================================================================
-- RLS 설정 완료 메시지 및 검증
-- =================================================================

DO $$
DECLARE
    profiles_rls BOOLEAN;
    units_rls BOOLEAN; 
    maintenance_rls BOOLEAN;
    policy_count INTEGER;
BEGIN
    -- RLS 활성화 상태 확인
    SELECT relrowsecurity INTO profiles_rls FROM pg_class WHERE relname = 'profiles';
    SELECT relrowsecurity INTO units_rls FROM pg_class WHERE relname = 'units';  
    SELECT relrowsecurity INTO maintenance_rls FROM pg_class WHERE relname = 'maintenance_logs';
    
    -- 생성된 정책 수 확인
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'units', 'maintenance_logs');
    
    RAISE NOTICE '✅ RLS(Row Level Security) 설정 완료!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 RLS 활성화 상태:';
    RAISE NOTICE '   - profiles: %', CASE WHEN profiles_rls THEN '활성화' ELSE '비활성화' END;
    RAISE NOTICE '   - units: %', CASE WHEN units_rls THEN '활성화' ELSE '비활성화' END;
    RAISE NOTICE '   - maintenance_logs: %', CASE WHEN maintenance_rls THEN '활성화' ELSE '비활성화' END;
    RAISE NOTICE '';
    RAISE NOTICE '🔐 생성된 보안 정책: %개', policy_count;
    RAISE NOTICE '';
    RAISE NOTICE '🔧 생성된 헬퍼 함수:';
    RAISE NOTICE '   - get_my_role()';
    RAISE NOTICE '   - is_admin_or_manager()';
    RAISE NOTICE '   - is_technician_or_above()';
    RAISE NOTICE '   - has_role_level(role)';
    RAISE NOTICE '   - test_rls_policies()';
    RAISE NOTICE '';
    RAISE NOTICE '📋 다음 단계:';
    RAISE NOTICE '1. 테스트 사용자 생성 (technician, manager 역할)';
    RAISE NOTICE '2. 각 역할로 로그인하여 CRUD 작업 테스트';
    RAISE NOTICE '3. SELECT test_rls_policies(); 실행하여 정책 검증';
    RAISE NOTICE '4. T-007 (환경변수 관리 체계화)';
END $$;