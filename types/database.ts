// 실외기케어 대시보드 - Supabase 데이터베이스 타입 정의
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'admin' | 'manager' | 'technician' | 'viewer'
          full_name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          role?: 'admin' | 'manager' | 'technician' | 'viewer'
          full_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          role?: 'admin' | 'manager' | 'technician' | 'viewer'
          full_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
      }
      units: {
        Row: {
          id: string
          name: string
          location: string
          model: string | null
          manufacturer: string | null
          installation_date: string | null
          warranty_end_date: string | null
          status: 'active' | 'maintenance' | 'inactive' | 'retired'
          specifications: any | null
          notes: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          location: string
          model?: string | null
          manufacturer?: string | null
          installation_date?: string | null
          warranty_end_date?: string | null
          status?: 'active' | 'maintenance' | 'inactive' | 'retired'
          specifications?: any | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          location?: string
          model?: string | null
          manufacturer?: string | null
          installation_date?: string | null
          warranty_end_date?: string | null
          status?: 'active' | 'maintenance' | 'inactive' | 'retired'
          specifications?: any | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      maintenance_logs: {
        Row: {
          id: string
          unit_id: string
          user_id: string
          maintenance_type: 'preventive' | 'corrective' | 'emergency' | 'inspection'
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold'
          title: string
          description: string | null
          notes: string | null
          scheduled_date: string | null
          started_at: string | null
          completed_at: string | null
          estimated_cost: number | null
          actual_cost: number | null
          parts_used: any | null
          attachments: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          unit_id: string
          user_id: string
          maintenance_type?: 'preventive' | 'corrective' | 'emergency' | 'inspection'
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold'
          title: string
          description?: string | null
          notes?: string | null
          scheduled_date?: string | null
          started_at?: string | null
          completed_at?: string | null
          estimated_cost?: number | null
          actual_cost?: number | null
          parts_used?: any | null
          attachments?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          unit_id?: string
          user_id?: string
          maintenance_type?: 'preventive' | 'corrective' | 'emergency' | 'inspection'
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold'
          title?: string
          description?: string | null
          notes?: string | null
          scheduled_date?: string | null
          started_at?: string | null
          completed_at?: string | null
          estimated_cost?: number | null
          actual_cost?: number | null
          parts_used?: any | null
          attachments?: any | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      units_with_latest_maintenance: {
        Row: {
          id: string
          name: string
          location: string
          model: string | null
          manufacturer: string | null
          status: 'active' | 'maintenance' | 'inactive' | 'retired'
          latest_maintenance_id: string | null
          latest_maintenance_type: 'preventive' | 'corrective' | 'emergency' | 'inspection' | null
          latest_maintenance_status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold' | null
          latest_scheduled_date: string | null
          latest_completed_at: string | null
          latest_technician_name: string | null
        }
      }
      maintenance_statistics: {
        Row: {
          unit_id: string
          unit_name: string
          location: string | null
          total_maintenance_count: number
          completed_maintenance_count: number
          scheduled_maintenance_count: number
          avg_maintenance_cost: number | null
          last_maintenance_date: string | null
        }
      }
      user_role_statistics: {
        Row: {
          role: 'admin' | 'manager' | 'technician' | 'viewer'
          user_count: number
          active_users_30d: number
          active_users_7d: number
        }
      }
      recent_user_activity: {
        Row: {
          full_name: string | null
          email: string | null
          role: 'admin' | 'manager' | 'technician' | 'viewer'
          last_sign_in_at: string | null
          registered_at: string
          activity_status: string
        }
      }
    }
    Functions: {
      get_next_maintenance_date: {
        Args: { unit_uuid: string }
        Returns: string
      }
      get_maintenance_cost_summary: {
        Args: { 
          start_date?: string
          end_date?: string 
        }
        Returns: Array<{
          unit_name: string
          total_cost: number
          maintenance_count: number
        }>
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role_permission: {
        Args: { required_role: string }
        Returns: boolean
      }
      update_user_role: {
        Args: { 
          target_user_id: string
          new_role: string 
        }
        Returns: boolean
      }
      update_user_profile: {
        Args: {
          new_full_name?: string
          new_phone?: string
        }
        Returns: {
          id: string
          role: string
          full_name: string | null
          phone: string | null
          updated_at: string | null
        }
      }
      setup_admin_user: {
        Args: { admin_email: string }
        Returns: boolean
      }
    }
    Enums: {
      maintenance_status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold'
      maintenance_type: 'preventive' | 'corrective' | 'emergency' | 'inspection'
    }
  }
}

// 편의를 위한 타입 별칭들
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Unit = Database['public']['Tables']['units']['Row']
export type MaintenanceLog = Database['public']['Tables']['maintenance_logs']['Row']
export type UnitWithLatestMaintenance = Database['public']['Views']['units_with_latest_maintenance']['Row']
export type MaintenanceStatistics = Database['public']['Views']['maintenance_statistics']['Row']

// 삽입용 타입들
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type UnitInsert = Database['public']['Tables']['units']['Insert']
export type MaintenanceLogInsert = Database['public']['Tables']['maintenance_logs']['Insert']

// 업데이트용 타입들  
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type UnitUpdate = Database['public']['Tables']['units']['Update']
export type MaintenanceLogUpdate = Database['public']['Tables']['maintenance_logs']['Update']