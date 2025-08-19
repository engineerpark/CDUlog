import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ollwcmgkjpyrbbyzmqnn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sbHdjbWdranB5cmJieXptcW5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MDU0MjMsImV4cCI6MjA3MTE4MTQyM30._5QmnuSaeuxCnpqg6gG6fSWEodbvypklw5BH4Z3o8G0'

export const supabase = createClient(supabaseUrl, supabaseKey)

// 점검 이력 타입 정의 (기존 MaintenanceRecord와 동일)
export interface SupabaseMaintenanceRecord {
  id?: string
  outdoor_unit_id: string
  maintenance_date: string
  maintenance_type: 'preventive' | 'corrective' | 'emergency'
  description: string
  performed_by: string
  status: 'completed' | 'in_progress' | 'scheduled'
  next_maintenance_date?: string
  cost?: number
  notes?: string
  created_at?: string
  updated_at?: string
  is_active: boolean
  resolved_date?: string
  resolved_by?: string
  resolved_notes?: string
}