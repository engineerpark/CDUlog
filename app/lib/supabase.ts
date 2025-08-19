import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kagztckyqatjrpazxtli.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthZ3p0Y2t5cWF0anJwYXp4dGxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3OTQwMTEsImV4cCI6MjA3MDM3MDAxMX0.pEpjYgrCHIW89tMcobBedToBn4j4joJh7FkpM4uft70'

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