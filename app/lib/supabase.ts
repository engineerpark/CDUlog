import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on existing Supabase schema
export interface DatabaseOutdoorUnit {
  id: string;
  name: string;
  factory_id?: string;
  factory_name?: string;
  location_id?: string;
  location?: string;
  model?: string;
  manufacturer?: string;
  serial_number?: string;
  installation_date?: string;
  status?: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseMaintenanceRecord {
  id: string;
  outdoor_unit_id: string;
  maintenance_date: string;
  maintenance_type: string;
  description: string;
  performed_by: string;
  status: string;
  next_maintenance_date?: string;
  cost?: number;
  notes?: string;
  is_active: boolean;
  resolved_date?: string;
  resolved_by?: string;
  resolved_notes?: string;
  created_at?: string;
  updated_at?: string;
}