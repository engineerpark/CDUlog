// 실외기 자산 관리 타입 정의

export interface OutdoorUnit {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  installationDate: string;
  location: {
    building: string;
    floor: string;
    room: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  specifications: {
    capacity: string; // 냉방 용량 (예: "3.5kW")
    refrigerant: string; // 냉매 타입 (예: "R410A")
    powerConsumption: string; // 소비전력 (예: "1.2kW")
    voltage: string; // 전압 (예: "220V")
  };
  status: 'active' | 'maintenance' | 'inactive' | 'error';
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  warranty: {
    startDate: string;
    endDate: string;
    provider: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  id: string;
  unitId: string;
  date: string;
  type: 'routine' | 'repair' | 'emergency' | 'inspection';
  technician: string;
  description: string;
  partsReplaced?: string[];
  cost?: number;
  duration: number; // 작업 시간 (분)
  status: 'completed' | 'pending' | 'cancelled';
  photos?: string[];
  createdAt: string;
}

export interface CreateOutdoorUnitInput {
  name: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  installationDate: string;
  location: {
    building: string;
    floor: string;
    room: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  specifications: {
    capacity: string;
    refrigerant: string;
    powerConsumption: string;
    voltage: string;
  };
  warranty: {
    startDate: string;
    endDate: string;
    provider: string;
  };
  notes?: string;
}