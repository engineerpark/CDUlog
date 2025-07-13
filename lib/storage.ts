// 로컬 스토리지 기반 데이터 관리

import { OutdoorUnit, MaintenanceRecord, CreateOutdoorUnitInput } from './types';

const STORAGE_KEYS = {
  OUTDOOR_UNITS: 'cdulog_outdoor_units',
  MAINTENANCE_RECORDS: 'cdulog_maintenance_records',
} as const;

// 유틸리티 함수
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getCurrentISOString(): string {
  return new Date().toISOString();
}

// 실외기 관리 함수들
export const outdoorUnitStorage = {
  // 모든 실외기 조회
  getAll(): OutdoorUnit[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(STORAGE_KEYS.OUTDOOR_UNITS);
    return stored ? JSON.parse(stored) : [];
  },

  // ID로 실외기 조회
  getById(id: string): OutdoorUnit | null {
    const units = this.getAll();
    return units.find(unit => unit.id === id) || null;
  },

  // 새 실외기 등록
  create(input: CreateOutdoorUnitInput): OutdoorUnit {
    const units = this.getAll();
    const now = getCurrentISOString();
    
    const newUnit: OutdoorUnit = {
      id: generateId(),
      ...input,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    units.push(newUnit);
    localStorage.setItem(STORAGE_KEYS.OUTDOOR_UNITS, JSON.stringify(units));
    
    return newUnit;
  },

  // 실외기 수정
  update(id: string, updates: Partial<OutdoorUnit>): OutdoorUnit | null {
    const units = this.getAll();
    const index = units.findIndex(unit => unit.id === id);
    
    if (index === -1) return null;
    
    units[index] = {
      ...units[index],
      ...updates,
      updatedAt: getCurrentISOString(),
    };
    
    localStorage.setItem(STORAGE_KEYS.OUTDOOR_UNITS, JSON.stringify(units));
    return units[index];
  },

  // 실외기 삭제
  delete(id: string): boolean {
    const units = this.getAll();
    const filteredUnits = units.filter(unit => unit.id !== id);
    
    if (filteredUnits.length === units.length) return false;
    
    localStorage.setItem(STORAGE_KEYS.OUTDOOR_UNITS, JSON.stringify(filteredUnits));
    return true;
  },

  // 상태별 필터링
  getByStatus(status: OutdoorUnit['status']): OutdoorUnit[] {
    return this.getAll().filter(unit => unit.status === status);
  },

  // 검색
  search(query: string): OutdoorUnit[] {
    const units = this.getAll();
    const lowercaseQuery = query.toLowerCase();
    
    return units.filter(unit => 
      unit.name.toLowerCase().includes(lowercaseQuery) ||
      unit.model.toLowerCase().includes(lowercaseQuery) ||
      unit.manufacturer.toLowerCase().includes(lowercaseQuery) ||
      unit.serialNumber.toLowerCase().includes(lowercaseQuery) ||
      unit.location.building.toLowerCase().includes(lowercaseQuery) ||
      unit.location.room.toLowerCase().includes(lowercaseQuery)
    );
  },
};

// 유지보수 기록 관리 함수들
export const maintenanceStorage = {
  // 모든 유지보수 기록 조회
  getAll(): MaintenanceRecord[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(STORAGE_KEYS.MAINTENANCE_RECORDS);
    return stored ? JSON.parse(stored) : [];
  },

  // 특정 실외기의 유지보수 기록 조회
  getByUnitId(unitId: string): MaintenanceRecord[] {
    return this.getAll().filter(record => record.unitId === unitId);
  },

  // 새 유지보수 기록 생성
  create(record: Omit<MaintenanceRecord, 'id' | 'createdAt'>): MaintenanceRecord {
    const records = this.getAll();
    
    const newRecord: MaintenanceRecord = {
      id: generateId(),
      ...record,
      createdAt: getCurrentISOString(),
    };

    records.push(newRecord);
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE_RECORDS, JSON.stringify(records));
    
    return newRecord;
  },
};

// 샘플 데이터 생성 함수
export function createSampleData(): void {
  // 기존 데이터가 있으면 생성하지 않음
  if (outdoorUnitStorage.getAll().length > 0) return;

  const sampleUnits: CreateOutdoorUnitInput[] = [
    {
      name: "A동 로비 실외기",
      model: "RAC-SM1400DX2",
      manufacturer: "삼성전자",
      serialNumber: "SM202301001",
      installationDate: "2023-03-15",
      location: {
        building: "A동",
        floor: "1층",
        room: "로비",
        coordinates: { lat: 37.5665, lng: 126.9780 }
      },
      specifications: {
        capacity: "14kW",
        refrigerant: "R410A",
        powerConsumption: "4.2kW",
        voltage: "380V"
      },
      warranty: {
        startDate: "2023-03-15",
        endDate: "2028-03-14",
        provider: "삼성전자서비스"
      },
      notes: "신축 건물 설치, 정기점검 필요"
    },
    {
      name: "B동 사무실 실외기",
      model: "FVXM25HVMA",
      manufacturer: "다이킨",
      serialNumber: "DK202301002",
      installationDate: "2023-01-20",
      location: {
        building: "B동",
        floor: "3층",
        room: "301호 사무실"
      },
      specifications: {
        capacity: "2.5kW",
        refrigerant: "R32",
        powerConsumption: "0.8kW",
        voltage: "220V"
      },
      warranty: {
        startDate: "2023-01-20",
        endDate: "2026-01-19",
        provider: "다이킨코리아"
      },
      notes: "소음 최소화 모델"
    },
    {
      name: "C동 회의실 실외기",
      model: "AP130RAPPBH1",
      manufacturer: "LG전자",
      serialNumber: "LG202302001",
      installationDate: "2023-02-10",
      location: {
        building: "C동",
        floor: "2층",
        room: "대회의실"
      },
      specifications: {
        capacity: "13kW",
        refrigerant: "R410A",
        powerConsumption: "3.8kW",
        voltage: "380V"
      },
      warranty: {
        startDate: "2023-02-10",
        endDate: "2028-02-09",
        provider: "LG전자서비스"
      }
    }
  ];

  // 샘플 데이터 생성
  sampleUnits.forEach(unit => {
    outdoorUnitStorage.create(unit);
  });

  console.log('샘플 데이터가 생성되었습니다.');
}