// 실외기케어 대시보드 - 실외기 관련 서버 액션
'use server'

import { revalidatePath } from 'next/cache'
import { createActionClient, getCurrentUser } from '@/lib/supabase/server'
import type { UnitInsert, UnitUpdate } from '@/types/database'

/**
 * 실외기 생성
 */
export async function createUnit(formData: FormData) {
  const supabase = createActionClient()
  const user = await getCurrentUser()
  
  if (!user) {
    return { success: false, error: '인증이 필요합니다.' }
  }
  
  // 실외기 생성 권한 확인 (기술자 이상)
  if (!['technician', 'manager', 'admin'].includes(user.profile?.role || '')) {
    return { success: false, error: '실외기 등록 권한이 없습니다.' }
  }
  
  try {
    const name = formData.get('name') as string
    const location = formData.get('location') as string
    const model = formData.get('model') as string
    const manufacturer = formData.get('manufacturer') as string
    const installationDate = formData.get('installationDate') as string
    const warrantyEndDate = formData.get('warrantyEndDate') as string
    const status = formData.get('status') as string
    const notes = formData.get('notes') as string
    
    // 필수 필드 검증
    if (!name || !location) {
      return { success: false, error: '실외기명과 위치는 필수 입력 사항입니다.' }
    }
    
    const unitData: UnitInsert = {
      name,
      location,
      model: model || null,
      manufacturer: manufacturer || null,
      installation_date: installationDate || null,
      warranty_end_date: warrantyEndDate || null,
      status: (status as any) || 'active',
      notes: notes || null,
      created_by: user.id
    }
    
    const { data, error } = await supabase
      .from('units')
      .insert(unitData)
      .select(`
        *,
        profiles!created_by(full_name)
      `)
      .single()
    
    if (error) {
      console.error('Error creating unit:', error)
      return { success: false, error: '실외기 등록에 실패했습니다.' }
    }
    
    revalidatePath('/units')
    revalidatePath('/dashboard')
    return { success: true, data }
    
  } catch (error) {
    console.error('Unexpected error creating unit:', error)
    return { success: false, error: '실외기 등록 중 오류가 발생했습니다.' }
  }
}

/**
 * 실외기 업데이트
 */
export async function updateUnit(id: string, formData: FormData) {
  const supabase = createActionClient()
  const user = await getCurrentUser()
  
  if (!user) {
    return { success: false, error: '인증이 필요합니다.' }
  }
  
  // 실외기 수정 권한 확인 (기술자 이상)
  if (!['technician', 'manager', 'admin'].includes(user.profile?.role || '')) {
    return { success: false, error: '실외기 수정 권한이 없습니다.' }
  }
  
  try {
    const name = formData.get('name') as string
    const location = formData.get('location') as string
    const model = formData.get('model') as string
    const manufacturer = formData.get('manufacturer') as string
    const installationDate = formData.get('installationDate') as string
    const warrantyEndDate = formData.get('warrantyEndDate') as string
    const status = formData.get('status') as string
    const notes = formData.get('notes') as string
    
    const updateData: UnitUpdate = {}
    
    if (name) updateData.name = name
    if (location) updateData.location = location
    if (model !== undefined) updateData.model = model || null
    if (manufacturer !== undefined) updateData.manufacturer = manufacturer || null
    if (installationDate !== undefined) updateData.installation_date = installationDate || null
    if (warrantyEndDate !== undefined) updateData.warranty_end_date = warrantyEndDate || null
    if (status) updateData.status = status as any
    if (notes !== undefined) updateData.notes = notes || null
    
    const { data, error } = await supabase
      .from('units')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        profiles!created_by(full_name)
      `)
      .single()
    
    if (error) {
      console.error('Error updating unit:', error)
      return { success: false, error: '실외기 업데이트에 실패했습니다.' }
    }
    
    revalidatePath('/units')
    revalidatePath('/dashboard')
    return { success: true, data }
    
  } catch (error) {
    console.error('Unexpected error updating unit:', error)
    return { success: false, error: '실외기 업데이트 중 오류가 발생했습니다.' }
  }
}

/**
 * 실외기 삭제
 */
export async function deleteUnit(id: string) {
  const supabase = createActionClient()
  const user = await getCurrentUser()
  
  if (!user) {
    return { success: false, error: '인증이 필요합니다.' }
  }
  
  // 실외기 삭제 권한 확인 (매니저 이상)
  if (!['manager', 'admin'].includes(user.profile?.role || '')) {
    return { success: false, error: '실외기 삭제 권한이 없습니다.' }
  }
  
  try {
    // 관련된 유지보수 이력 확인
    const { data: maintenanceLogs, error: fetchError } = await supabase
      .from('maintenance_logs')
      .select('id')
      .eq('unit_id', id)
    
    if (fetchError) {
      console.error('Error checking maintenance logs:', fetchError)
      return { success: false, error: '실외기 삭제 전 확인 과정에서 오류가 발생했습니다.' }
    }
    
    if (maintenanceLogs && maintenanceLogs.length > 0) {
      return { 
        success: false, 
        error: `이 실외기에는 ${maintenanceLogs.length}건의 유지보수 이력이 있습니다. 먼저 유지보수 이력을 처리해주세요.` 
      }
    }
    
    const { error } = await supabase
      .from('units')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting unit:', error)
      return { success: false, error: '실외기 삭제에 실패했습니다.' }
    }
    
    revalidatePath('/units')
    revalidatePath('/dashboard')
    return { success: true }
    
  } catch (error) {
    console.error('Unexpected error deleting unit:', error)
    return { success: false, error: '실외기 삭제 중 오류가 발생했습니다.' }
  }
}

/**
 * 실외기 상태 변경 (빠른 액션)
 */
export async function updateUnitStatus(id: string, status: string) {
  const supabase = createActionClient()
  const user = await getCurrentUser()
  
  if (!user) {
    return { success: false, error: '인증이 필요합니다.' }
  }
  
  if (!['technician', 'manager', 'admin'].includes(user.profile?.role || '')) {
    return { success: false, error: '상태 변경 권한이 없습니다.' }
  }
  
  try {
    const validStatuses = ['active', 'maintenance', 'inactive', 'retired']
    if (!validStatuses.includes(status)) {
      return { success: false, error: '유효하지 않은 상태입니다.' }
    }
    
    const { error } = await supabase
      .from('units')
      .update({ status: status as any })
      .eq('id', id)
    
    if (error) {
      console.error('Error updating unit status:', error)
      return { success: false, error: '상태 변경에 실패했습니다.' }
    }
    
    revalidatePath('/units')
    revalidatePath('/dashboard')
    return { success: true }
    
  } catch (error) {
    console.error('Unexpected error updating unit status:', error)
    return { success: false, error: '상태 변경 중 오류가 발생했습니다.' }
  }
}