export interface MaintenanceRecord {
  id: string;
  outdoorUnitId: string;
  maintenanceDate: string;
  maintenanceType: 'preventive' | 'corrective' | 'emergency';
  description: string;
  performedBy: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  nextMaintenanceDate?: string;
  cost?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  resolvedDate?: string;
  resolvedBy?: string;
  resolvedNotes?: string;
}

export interface OutdoorUnit {
  id: string;
  name: string; // 장비명
  installationDate: string;
  location: string; // 위치
  factoryName: string; // 소재지 (공장명)
  status: 'active' | 'maintenance' | 'inactive';
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  notes?: string;
  maintenanceRecords?: MaintenanceRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOutdoorUnitRequest {
  name: string; // 장비명
  installationDate: string;
  location: string; // 위치
  factoryName: string; // 소재지 (공장명)
  status: 'active' | 'maintenance' | 'inactive';
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  notes?: string;
}

export interface UpdateOutdoorUnitRequest extends Partial<CreateOutdoorUnitRequest> {
  id: string;
}

export interface CreateMaintenanceRecordRequest {
  outdoorUnitId: string;
  maintenanceDate: string;
  maintenanceType: 'preventive' | 'corrective' | 'emergency';
  description: string;
  performedBy: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  nextMaintenanceDate?: string;
  cost?: number;
  notes?: string;
}

export interface UpdateMaintenanceRecordRequest extends Partial<CreateMaintenanceRecordRequest> {
  id: string;
}