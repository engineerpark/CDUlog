-- 실외기케어 대시보드 - Supabase Auth 설정 및 역할 분리
-- Supabase SQL Editor에서 실행하세요

-- =================================================================
-- 1. 프로필 자동 생성 함수
-- =================================================================

-- 새 사용자를 위한 프로필 생성 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, role, full_name, updated_at)
    VALUES (
        NEW.id, 
        'technician', -- 기본 역할을 'technician'으로 설정
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), -- 메타데이터에서 이름 추출 또는 이메일 사용
        NOW()
    );
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- 이미 프로필이 존재하는 경우 무시
        RETURN NEW;
    WHEN OTHERS THEN
        -- 기타 오류 발생 시 로깅하고 계속 진행
        RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- =================================================================
-- 2. auth.users 테이블에 트리거 생성
-- =================================================================

-- 기존 트리거가 있다면 제거
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 새로운 트리거 생성
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =================================================================
-- 3. 사용자 역할 관리 함수들
-- =================================================================

-- 사용자 역할 변경 함수 (관리자만 호출 가능)
CREATE OR REPLACE FUNCTION public.update_user_role(
    target_user_id UUID,
    new_role TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_role TEXT;
BEGIN
    -- 현재 사용자의 역할 확인
    SELECT role INTO current_user_role
    FROM profiles
    WHERE id = auth.uid();
    
    -- 관리자 권한 확인
    IF current_user_role NOT IN ('admin', 'manager') THEN
        RAISE EXCEPTION 'Access denied: Only admin or manager can change user roles';
    END IF;
    
    -- 유효한 역할인지 확인
    IF new_role NOT IN ('admin', 'manager', 'technician', 'viewer') THEN
        RAISE EXCEPTION 'Invalid role: %', new_role;
    END IF;
    
    -- 역할 업데이트
    UPDATE profiles
    SET role = new_role, updated_at = NOW()
    WHERE id = target_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found: %', target_user_id;
    END IF;
    
    RETURN TRUE;
END;
$$;

-- 현재 사용자의 역할 조회 함수
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM profiles
    WHERE id = auth.uid();
    
    RETURN COALESCE(user_role, 'viewer');
END;
$$;

-- 사용자 권한 확인 함수
CREATE OR REPLACE FUNCTION public.has_role_permission(
    required_role TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role TEXT;
    role_hierarchy JSONB DEFAULT '{
        "viewer": 1,
        "technician": 2,
        "manager": 3,
        "admin": 4
    }';
BEGIN
    -- 인증되지 않은 사용자
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;
    
    SELECT role INTO user_role FROM profiles WHERE id = auth.uid();
    
    -- 프로필이 없으면 viewer로 처리
    user_role := COALESCE(user_role, 'viewer');
    
    -- 역할 계층 확인 (숫자가 높을수록 높은 권한)
    RETURN (role_hierarchy->>user_role)::INT >= (role_hierarchy->>required_role)::INT;
END;
$$;

-- =================================================================
-- 4. 사용자 프로필 관리 함수들
-- =================================================================

-- 사용자 프로필 업데이트 함수 (본인만 수정 가능)
CREATE OR REPLACE FUNCTION public.update_user_profile(
    new_full_name TEXT DEFAULT NULL,
    new_phone TEXT DEFAULT NULL
)
RETURNS profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    updated_profile profiles;
BEGIN
    -- 인증 확인
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;
    
    -- 프로필 업데이트
    UPDATE profiles
    SET 
        full_name = COALESCE(new_full_name, full_name),
        phone = COALESCE(new_phone, phone),
        updated_at = NOW()
    WHERE id = auth.uid()
    RETURNING * INTO updated_profile;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Profile not found';
    END IF;
    
    RETURN updated_profile;
END;
$$;

-- 사용자 목록 조회 함수 (관리자만)
CREATE OR REPLACE FUNCTION public.get_users_list()
RETURNS TABLE (
    id UUID,
    email TEXT,
    full_name TEXT,
    role TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 관리자 권한 확인
    IF NOT has_role_permission('manager') THEN
        RAISE EXCEPTION 'Access denied: Manager permission required';
    END IF;
    
    RETURN QUERY
    SELECT 
        p.id,
        u.email,
        p.full_name,
        p.role,
        p.phone,
        u.created_at,
        p.updated_at,
        u.last_sign_in_at
    FROM profiles p
    JOIN auth.users u ON p.id = u.id
    ORDER BY p.role DESC, u.created_at DESC;
END;
$$;

-- =================================================================
-- 5. 기본 관리자 계정 설정 함수
-- =================================================================

-- 첫 번째 사용자를 관리자로 설정하는 함수
CREATE OR REPLACE FUNCTION public.setup_admin_user(
    admin_email TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- 이메일로 사용자 찾기
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = admin_email
    LIMIT 1;
    
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', admin_email;
    END IF;
    
    -- 관리자 역할로 업데이트
    UPDATE profiles
    SET role = 'admin', updated_at = NOW()
    WHERE id = admin_user_id;
    
    IF FOUND THEN
        RAISE NOTICE 'User % has been set as admin', admin_email;
        RETURN TRUE;
    ELSE
        RAISE EXCEPTION 'Failed to update user role';
    END IF;
END;
$$;

-- =================================================================
-- 6. 통계 및 모니터링 뷰
-- =================================================================

-- 사용자 역할별 통계 뷰
CREATE OR REPLACE VIEW user_role_statistics AS
SELECT 
    role,
    COUNT(*) as user_count,
    COUNT(CASE WHEN last_sign_in_at > NOW() - INTERVAL '30 days' THEN 1 END) as active_users_30d,
    COUNT(CASE WHEN last_sign_in_at > NOW() - INTERVAL '7 days' THEN 1 END) as active_users_7d
FROM profiles p
JOIN auth.users u ON p.id = u.id
GROUP BY role
ORDER BY user_count DESC;

-- 최근 사용자 활동 뷰
CREATE OR REPLACE VIEW recent_user_activity AS
SELECT 
    p.full_name,
    u.email,
    p.role,
    u.last_sign_in_at,
    u.created_at as registered_at,
    CASE 
        WHEN u.last_sign_in_at > NOW() - INTERVAL '1 day' THEN '오늘'
        WHEN u.last_sign_in_at > NOW() - INTERVAL '7 days' THEN '이번 주'
        WHEN u.last_sign_in_at > NOW() - INTERVAL '30 days' THEN '이번 달'
        ELSE '비활성'
    END as activity_status
FROM profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY u.last_sign_in_at DESC NULLS LAST;

-- =================================================================
-- 7. 테스트 데이터 및 검증
-- =================================================================

-- 프로필 자동 생성 테스트 함수
CREATE OR REPLACE FUNCTION public.test_profile_creation()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    test_result TEXT;
    profile_count INTEGER;
    user_count INTEGER;
BEGIN
    -- auth.users와 profiles 테이블의 레코드 수 비교
    SELECT COUNT(*) INTO user_count FROM auth.users;
    SELECT COUNT(*) INTO profile_count FROM profiles;
    
    IF user_count = profile_count THEN
        test_result := format('✅ 프로필 생성 테스트 통과: %s명의 사용자 모두 프로필 보유', user_count);
    ELSE
        test_result := format('❌ 프로필 생성 테스트 실패: 사용자 %s명, 프로필 %s명', user_count, profile_count);
    END IF;
    
    RETURN test_result;
END;
$$;

-- =================================================================
-- 설정 완료 메시지
-- =================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Supabase Auth 설정 완료!';
    RAISE NOTICE '🔐 생성된 인증 기능:';
    RAISE NOTICE '   - 프로필 자동 생성 (handle_new_user)';
    RAISE NOTICE '   - 역할 관리 (update_user_role, get_current_user_role)';
    RAISE NOTICE '   - 권한 확인 (has_role_permission)';
    RAISE NOTICE '   - 사용자 관리 (update_user_profile, get_users_list)';
    RAISE NOTICE '👥 지원 역할: admin, manager, technician, viewer';
    RAISE NOTICE '📊 생성된 뷰: user_role_statistics, recent_user_activity';
    RAISE NOTICE '';
    RAISE NOTICE '📋 다음 단계:';
    RAISE NOTICE '1. Supabase Dashboard > Authentication > Providers에서 Email 활성화';
    RAISE NOTICE '2. 테스트 사용자 생성 후 setup_admin_user(''email'') 함수로 관리자 설정';
    RAISE NOTICE '3. T-004 (Next.js에서 Supabase 연결 및 인증 플로우 구현)';
END $$;