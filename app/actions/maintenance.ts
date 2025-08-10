// 실외기케어 대시보드 - 유지보수 관련 서버 액션
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createActionClient, getCurrentUser } from '@/lib/supabase/server'
import type { MaintenanceLogInsert, MaintenanceLogUpdate } from '@/types/database'

/**
 * 유지보수 이력 생성
 */
export async function createMaintenanceLog(formData: FormData) {
  const supabase = createActionClient()
  const user = await getCurrentUser()
  
  if (!user) {
    return { success: false, error: '인증이 필요합니다.' }
  }
  
  try {
    const unitId = formData.get('unitId') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const maintenanceType = formData.get('maintenanceType') as string
    const status = formData.get('status') as string
    const scheduledDate = formData.get('scheduledDate') as string
    const estimatedCost = formData.get('estimatedCost') as string
    const notes = formData.get('notes') as string
    
    // 필수 필드 검증
    if (!unitId || !title || !maintenanceType) {
      return { success: false, error: '필수 필드를 모두 입력해주세요.' }
    }
    
    const maintenanceLogData: MaintenanceLogInsert = {
      unit_id: unitId,
      user_id: user.id,
      title,
      description: description || null,
      maintenance_type: maintenanceType as any,
      status: (status as any) || 'scheduled',
      scheduled_date: scheduledDate || null,
      estimated_cost: estimatedCost ? parseFloat(estimatedCost) : null,
      notes: notes || null
    }
    
    const { data, error } = await supabase
      .from('maintenance_logs')
      .insert(maintenanceLogData)
      .select(`
        *,
        units(name, location),
        profiles!user_id(full_name)
      `)
      .single()
    
    if (error) {
      console.error('Error creating maintenance log:', error)
      return { success: false, error: '유지보수 이력 생성에 실패했습니다.' }
    }
    
    revalidatePath('/maintenance')
    revalidatePath('/dashboard')
    return { success: true, data }
    
  } catch (error) {
    console.error('Unexpected error creating maintenance log:', error)
    return { success: false, error: '유지보수 이력 생성 중 오류가 발생했습니다.' }
  }
}

/**
 * 유지보수 이력 업데이트
 */
export async function updateMaintenanceLog(id: string, formData: FormData) {
  const supabase = createActionClient()
  const user = await getCurrentUser()
  
  if (!user) {
    return { success: false, error: '인증이 필요합니다.' }
  }
  
  try {
    // 기존 데이터 확인 (권한 검증)
    const { data: existingLog, error: fetchError } = await supabase
      .from('maintenance_logs')
      .select('user_id')
      .eq('id', id)
      .single()
    
    if (fetchError || !existingLog) {
      return { success: false, error: '유지보수 이력을 찾을 수 없습니다.' }
    }
    
    // 본인이 작성한 기록이거나 관리자 권한이 있는지 확인
    const isOwner = existingLog.user_id === user.id
    const hasAdminRole = ['admin', 'manager'].includes(user.profile?.role || '')
    
    if (!isOwner && !hasAdminRole) {
      return { success: false, error: '수정 권한이 없습니다.' }
    }
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const maintenanceType = formData.get('maintenanceType') as string
    const status = formData.get('status') as string
    const scheduledDate = formData.get('scheduledDate') as string
    const startedAt = formData.get('startedAt') as string
    const completedAt = formData.get('completedAt') as string
    const estimatedCost = formData.get('estimatedCost') as string
    const actualCost = formData.get('actualCost') as string
    const notes = formData.get('notes') as string
    
    const updateData: MaintenanceLogUpdate = {}
    
    if (title) updateData.title = title
    if (description !== null) updateData.description = description || null
    if (maintenanceType) updateData.maintenance_type = maintenanceType as any
    if (status) updateData.status = status as any
    if (scheduledDate !== null) updateData.scheduled_date = scheduledDate || null
    if (startedAt !== null) updateData.started_at = startedAt || null
    if (completedAt !== null) updateData.completed_at = completedAt || null
    if (estimatedCost !== null) updateData.estimated_cost = estimatedCost ? parseFloat(estimatedCost) : null
    if (actualCost !== null) updateData.actual_cost = actualCost ? parseFloat(actualCost) : null
    if (notes !== null) updateData.notes = notes || null
    
    const { data, error } = await supabase
      .from('maintenance_logs')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        units(name, location),
        profiles!user_id(full_name)
      `)
      .single()
    
    if (error) {
      console.error('Error updating maintenance log:', error)
      return { success: false, error: '유지보수 이력 업데이트에 실패했습니다.' }
    }
    
    revalidatePath('/maintenance')
    revalidatePath('/dashboard')
    return { success: true, data }
    
  } catch (error) {
    console.error('Unexpected error updating maintenance log:', error)
    return { success: false, error: '유지보수 이력 업데이트 중 오류가 발생했습니다.' }
  }
}

/**
 * 유지보수 이력 삭제
 */
export async function deleteMaintenanceLog(id: string) {
  const supabase = createActionClient()
  const user = await getCurrentUser()
  
  if (!user) {
    return { success: false, error: '인증이 필요합니다.' }
  }
  
  try {
    // 기존 데이터 확인 (권한 검증)
    const { data: existingLog, error: fetchError } = await supabase
      .from('maintenance_logs')
      .select('user_id, title')
      .eq('id', id)
      .single()
    
    if (fetchError || !existingLog) {
      return { success: false, error: '유지보수 이력을 찾을 수 없습니다.' }
    }
    
    // 본인이 작성한 기록이거나 관리자 권한이 있는지 확인
    const isOwner = existingLog.user_id === user.id
    const hasAdminRole = ['admin', 'manager'].includes(user.profile?.role || '')
    
    if (!isOwner && !hasAdminRole) {
      return { success: false, error: '삭제 권한이 없습니다.' }
    }
    
    const { error } = await supabase
      .from('maintenance_logs')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting maintenance log:', error)
      return { success: false, error: '유지보수 이력 삭제에 실패했습니다.' }
    }
    
    revalidatePath('/maintenance')
    revalidatePath('/dashboard')
    return { success: true }
    
  } catch (error) {
    console.error('Unexpected error deleting maintenance log:', error)
    return { success: false, error: '유지보수 이력 삭제 중 오류가 발생했습니다.' }
  }
}

/**
 * 유지보수 상태 변경 (빠른 액션)
 */
export async function updateMaintenanceStatus(id: string, status: string) {
  const supabase = createActionClient()
  const user = await getCurrentUser()
  
  if (!user) {
    return { success: false, error: '인증이 필요합니다.' }
  }
  
  try {
    const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold']
    if (!validStatuses.includes(status)) {
      return { success: false, error: '유효하지 않은 상태입니다.' }
    }
    
    const updateData: MaintenanceLogUpdate = {
      status: status as any
    }
    
    // 상태에 따른 추가 업데이트
    const now = new Date().toISOString()
    if (status === 'in_progress' && !updateData.started_at) {
      updateData.started_at = now
    } else if (status === 'completed' && !updateData.completed_at) {
      updateData.completed_at = now
    }
    
    const { error } = await supabase
      .from('maintenance_logs')
      .update(updateData)
      .eq('id', id)
    
    if (error) {
      console.error('Error updating maintenance status:', error)
      return { success: false, error: '상태 변경에 실패했습니다.' }
    }
    
    revalidatePath('/maintenance')
    revalidatePath('/dashboard')
    return { success: true }
    
  } catch (error) {
    console.error('Unexpected error updating maintenance status:', error)
    return { success: false, error: '상태 변경 중 오류가 발생했습니다.' }
  }
}