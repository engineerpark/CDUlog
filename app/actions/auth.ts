// 실외기케어 대시보드 - 인증 관련 서버 액션
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createActionClient } from '@/lib/supabase/server'

/**
 * 로그아웃 서버 액션
 */
export async function signOut() {
  const supabase = createActionClient()
  
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Sign out error:', error)
      return { success: false, error: error.message }
    }
    
    revalidatePath('/', 'layout')
    redirect('/login')
  } catch (error) {
    console.error('Unexpected error during sign out:', error)
    return { success: false, error: '로그아웃 중 오류가 발생했습니다.' }
  }
}

/**
 * 프로필 업데이트 서버 액션
 */
export async function updateUserProfile(formData: FormData) {
  const supabase = createActionClient()
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { success: false, error: '인증이 필요합니다.' }
    }
    
    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string
    
    const updates: { full_name?: string; phone?: string } = {}
    
    if (fullName) updates.full_name = fullName
    if (phone) updates.phone = phone
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    
    if (error) {
      console.error('Profile update error:', error)
      return { success: false, error: '프로필 업데이트에 실패했습니다.' }
    }
    
    revalidatePath('/profile')
    return { success: true, data }
    
  } catch (error) {
    console.error('Unexpected error updating profile:', error)
    return { success: false, error: '프로필 업데이트 중 오류가 발생했습니다.' }
  }
}

/**
 * 사용자 역할 변경 서버 액션 (관리자 전용)
 */
export async function updateUserRole(targetUserId: string, newRole: string) {
  const supabase = createActionClient()
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { success: false, error: '인증이 필요합니다.' }
    }
    
    // 현재 사용자의 권한 확인
    const { data: currentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profileError || !currentProfile) {
      return { success: false, error: '사용자 정보를 찾을 수 없습니다.' }
    }
    
    if (!['admin', 'manager'].includes(currentProfile.role)) {
      return { success: false, error: '권한이 없습니다.' }
    }
    
    // 유효한 역할인지 확인
    const validRoles = ['admin', 'manager', 'technician', 'viewer']
    if (!validRoles.includes(newRole)) {
      return { success: false, error: '유효하지 않은 역할입니다.' }
    }
    
    // 역할 업데이트
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole as any, updated_at: new Date().toISOString() })
      .eq('id', targetUserId)
    
    if (error) {
      console.error('Role update error:', error)
      return { success: false, error: '역할 변경에 실패했습니다.' }
    }
    
    revalidatePath('/users')
    return { success: true }
    
  } catch (error) {
    console.error('Unexpected error updating user role:', error)
    return { success: false, error: '역할 변경 중 오류가 발생했습니다.' }
  }
}

/**
 * 비밀번호 재설정 이메일 발송
 */
export async function resetPassword(email: string) {
  const supabase = createActionClient()
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    })
    
    if (error) {
      console.error('Password reset error:', error)
      return { success: false, error: '비밀번호 재설정 이메일 발송에 실패했습니다.' }
    }
    
    return { success: true }
    
  } catch (error) {
    console.error('Unexpected error sending password reset:', error)
    return { success: false, error: '비밀번호 재설정 중 오류가 발생했습니다.' }
  }
}

/**
 * 새 비밀번호 설정
 */
export async function updatePassword(newPassword: string) {
  const supabase = createActionClient()
  
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    
    if (error) {
      console.error('Password update error:', error)
      return { success: false, error: '비밀번호 변경에 실패했습니다.' }
    }
    
    return { success: true }
    
  } catch (error) {
    console.error('Unexpected error updating password:', error)
    return { success: false, error: '비밀번호 변경 중 오류가 발생했습니다.' }
  }
}