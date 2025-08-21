import { OutdoorUnit, MaintenanceRecord } from '../types/outdoor-unit';
import { supabase, DatabaseOutdoorUnit, DatabaseMaintenanceRecord } from './supabase';

// Supabase 기반 데이터 저장소

// 데이터베이스 → 앱 타입 변환
const mapDatabaseUnitToApp = (dbUnit: DatabaseOutdoorUnit): OutdoorUnit => ({
  id: dbUnit.id,
  name: dbUnit.name,
  installationDate: dbUnit.installation_date || '',
  location: dbUnit.location || 'Unknown',
  factoryName: dbUnit.factory_name || 'Unknown',
  status: (dbUnit.status as 'active' | 'maintenance' | 'inactive') || 'active',
  lastMaintenanceDate: dbUnit.last_maintenance_date || '',
  nextMaintenanceDate: dbUnit.next_maintenance_date || '',
  notes: dbUnit.notes || '',
  maintenanceRecords: [], // 별도 로드
  createdAt: dbUnit.created_at || new Date().toISOString(),
  updatedAt: dbUnit.updated_at || new Date().toISOString()
});

const mapDatabaseRecordToApp = (dbRecord: DatabaseMaintenanceRecord): MaintenanceRecord => ({
  id: dbRecord.id,
  outdoorUnitId: dbRecord.outdoor_unit_id,
  maintenanceDate: dbRecord.maintenance_date,
  maintenanceType: dbRecord.maintenance_type as 'preventive' | 'corrective' | 'emergency',
  description: dbRecord.description,
  performedBy: dbRecord.performed_by,
  status: dbRecord.status as 'scheduled' | 'in_progress' | 'completed',
  nextMaintenanceDate: dbRecord.next_maintenance_date,
  cost: dbRecord.cost,
  notes: dbRecord.notes || '',
  isActive: dbRecord.is_active,
  resolvedDate: dbRecord.resolved_date,
  resolvedBy: dbRecord.resolved_by,
  resolvedNotes: dbRecord.resolved_notes,
  createdAt: dbRecord.created_at || new Date().toISOString(),
  updatedAt: dbRecord.updated_at || new Date().toISOString()
});

// 앱 → 데이터베이스 타입 변환
const mapAppUnitToDatabase = (appUnit: Partial<OutdoorUnit>): Partial<DatabaseOutdoorUnit> => ({
  id: appUnit.id,
  name: appUnit.name,
  installation_date: appUnit.installationDate,
  location: appUnit.location,
  factory_name: appUnit.factoryName,
  status: appUnit.status,
  last_maintenance_date: appUnit.lastMaintenanceDate,
  next_maintenance_date: appUnit.nextMaintenanceDate,
  notes: appUnit.notes,
  updated_at: new Date().toISOString()
});

const mapAppRecordToDatabase = (appRecord: Partial<MaintenanceRecord>, includeId: boolean = true): Partial<DatabaseMaintenanceRecord> => {
  const mapped: Partial<DatabaseMaintenanceRecord> = {
    outdoor_unit_id: appRecord.outdoorUnitId,
    maintenance_date: appRecord.maintenanceDate,
    maintenance_type: appRecord.maintenanceType,
    description: appRecord.description,
    performed_by: appRecord.performedBy,
    status: appRecord.status,
    next_maintenance_date: appRecord.nextMaintenanceDate,
    cost: appRecord.cost,
    notes: appRecord.notes,
    is_active: appRecord.isActive,
    resolved_date: appRecord.resolvedDate,
    resolved_by: appRecord.resolvedBy,
    resolved_notes: appRecord.resolvedNotes,
    updated_at: new Date().toISOString()
  };
  
  if (includeId && appRecord.id) {
    mapped.id = appRecord.id;
  }
  
  return mapped;
};

// 실외기 목록 조회
export const fetchOutdoorUnits = async (): Promise<OutdoorUnit[]> => {
  try {
    console.log('Fetching outdoor units from Supabase...');
    const { data, error } = await supabase
      .from('outdoor_units')
      .select('*');

    if (error) {
      console.error('Error fetching outdoor units:', error);
      throw error;
    }

    console.log('Raw data from Supabase:', data?.length || 0, 'units');
    
    return (data || []).map(unit => ({
      id: unit.id,
      name: unit.name,
      installationDate: unit.installation_date || '',
      location: unit.location || 'Unknown',
      factoryName: unit.factory_name || 'Unknown',
      status: (unit.status as 'active' | 'maintenance' | 'inactive') || 'active',
      lastMaintenanceDate: unit.last_maintenance_date || '',
      nextMaintenanceDate: unit.next_maintenance_date || '',
      notes: unit.notes || '',
      maintenanceRecords: [], // 별도 로드
      createdAt: unit.created_at || new Date().toISOString(),
      updatedAt: unit.updated_at || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Failed to fetch outdoor units:', error);
    throw error;
  }
};

// 유지보수 기록 조회
export const fetchMaintenanceRecords = async (outdoorUnitId?: string): Promise<MaintenanceRecord[]> => {
  try {
    let query = supabase.from('maintenance_records').select('*');
    
    if (outdoorUnitId) {
      query = query.eq('outdoor_unit_id', outdoorUnitId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching maintenance records:', error);
      throw error;
    }

    return (data || []).map(mapDatabaseRecordToApp);
  } catch (error) {
    console.error('Failed to fetch maintenance records:', error);
    throw error;
  }
};

// 유지보수 기록 추가
export const addMaintenanceRecord = async (record: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceRecord> => {
  try {
    console.log('Adding maintenance record:', record);
    
    const mappedRecord = mapAppRecordToDatabase(record, false); // ID 제외
    console.log('Mapped record:', mappedRecord);
    
    const newRecord = {
      ...mappedRecord,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Final record to insert:', newRecord);

    const { data, error } = await supabase
      .from('maintenance_records')
      .insert([newRecord])
      .select()
      .single();

    if (error) {
      console.error('Error adding maintenance record:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('Successfully inserted record:', data);
    
    // 실외기 상태 업데이트
    await updateUnitStatus(record.outdoorUnitId);

    return mapDatabaseRecordToApp(data);
  } catch (error) {
    console.error('Failed to add maintenance record:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : error);
    throw error;
  }
};

// 유지보수 기록 업데이트
export const updateMaintenanceRecord = async (recordId: string, updates: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> => {
  try {
    const updateData = {
      ...mapAppRecordToDatabase(updates, true), // ID 포함
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('maintenance_records')
      .update(updateData)
      .eq('id', recordId)
      .select()
      .single();

    if (error) {
      console.error('Error updating maintenance record:', error);
      throw error;
    }

    // 실외기 상태 업데이트
    if (data.outdoor_unit_id) {
      await updateUnitStatus(data.outdoor_unit_id);
    }

    return mapDatabaseRecordToApp(data);
  } catch (error) {
    console.error('Failed to update maintenance record:', error);
    throw error;
  }
};

// 실외기 상태 업데이트
export const updateUnitStatus = async (unitId: string): Promise<void> => {
  try {
    // 활성 유지보수 기록 확인
    const { data: activeRecords, error: recordsError } = await supabase
      .from('maintenance_records')
      .select('*')
      .eq('outdoor_unit_id', unitId)
      .eq('is_active', true);

    if (recordsError) {
      console.error('Error checking active records:', recordsError);
      return;
    }

    // 상태 계산
    const status = (activeRecords && activeRecords.length > 0) ? 'maintenance' : 'active';

    // 실외기 상태 업데이트
    const { error: updateError } = await supabase
      .from('outdoor_units')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', unitId);

    if (updateError) {
      console.error('Error updating unit status:', updateError);
    }
  } catch (error) {
    console.error('Failed to update unit status:', error);
  }
};

// 최근 유지보수 기록 조회
export const getLatestMaintenanceRecord = async (): Promise<{ record: MaintenanceRecord; unit: OutdoorUnit } | null> => {
  try {
    // maintenance_records에서 최신 기록 조회
    const { data: recordData, error: recordError } = await supabase
      .from('maintenance_records')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (recordError || !recordData) {
      return null;
    }

    // 해당 기록의 outdoor_unit 정보 조회
    const { data: unitData, error: unitError } = await supabase
      .from('outdoor_units')
      .select('*')
      .eq('id', recordData.outdoor_unit_id)
      .single();

    if (unitError || !unitData) {
      return null;
    }

    const record = mapDatabaseRecordToApp(recordData);
    const unit: OutdoorUnit = {
      id: unitData.id,
      name: unitData.name,
      installationDate: unitData.installation_date || '',
      location: unitData.location || 'Unknown',
      factoryName: unitData.factory_name || 'Unknown',
      status: (unitData.status as 'active' | 'maintenance' | 'inactive') || 'active',
      lastMaintenanceDate: unitData.last_maintenance_date || '',
      nextMaintenanceDate: unitData.next_maintenance_date || '',
      notes: unitData.notes || '',
      maintenanceRecords: [],
      createdAt: unitData.created_at || new Date().toISOString(),
      updatedAt: unitData.updated_at || new Date().toISOString()
    };

    return { record, unit };
  } catch (error) {
    console.error('Failed to get latest maintenance record:', error);
    return null;
  }
};

// 실외기 추가 (필요시)
export const addOutdoorUnit = async (unit: Omit<OutdoorUnit, 'id' | 'createdAt' | 'updatedAt'>): Promise<OutdoorUnit> => {
  try {
    const newUnit = {
      ...mapAppUnitToDatabase(unit),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('outdoor_units')
      .insert([newUnit])
      .select()
      .single();

    if (error) {
      console.error('Error adding outdoor unit:', error);
      throw error;
    }

    return mapDatabaseUnitToApp(data);
  } catch (error) {
    console.error('Failed to add outdoor unit:', error);
    throw error;
  }
};

// 실외기 업데이트
export const updateOutdoorUnit = async (unitId: string, updates: Partial<OutdoorUnit>): Promise<OutdoorUnit> => {
  try {
    const updateData = {
      ...mapAppUnitToDatabase(updates),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('outdoor_units')
      .update(updateData)
      .eq('id', unitId)
      .select()
      .single();

    if (error) {
      console.error('Error updating outdoor unit:', error);
      throw error;
    }

    return mapDatabaseUnitToApp(data);
  } catch (error) {
    console.error('Failed to update outdoor unit:', error);
    throw error;
  }
};