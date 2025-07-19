export interface OutdoorUnit {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  installationDate: string;
  location: string;
  capacity: number; // 냉방 용량 (kW)
  status: 'active' | 'maintenance' | 'inactive';
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOutdoorUnitRequest {
  name: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  installationDate: string;
  location: string;
  capacity: number;
  status: 'active' | 'maintenance' | 'inactive';
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  notes?: string;
}

export interface UpdateOutdoorUnitRequest extends Partial<CreateOutdoorUnitRequest> {
  id: string;
}