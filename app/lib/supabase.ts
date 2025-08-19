import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ollwcmgkjpyrbbyzmqnn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sbHdjbWdranB5cmJieXptcW5uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTYwNTQyMywiZXhwIjoyMDcxMTgxNDIzfQ.I7fux0xC3MZbOeQH2y8m42-HXbwj_exPSxfCjJRjLoo'

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