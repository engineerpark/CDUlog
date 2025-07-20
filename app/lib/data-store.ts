import { OutdoorUnit, MaintenanceRecord } from '../types/outdoor-unit';

// 임시 메모리 데이터 저장소 (실제 프로덕션에서는 데이터베이스 사용)
export const outdoorUnits: OutdoorUnit[] = [];
export const maintenanceRecords: MaintenanceRecord[] = [];

let nextUnitId = 1;
let nextMaintenanceId = 1;

// 샘플 데이터 초기화
let isInitialized = false;

export const initializeSampleData = () => {
  if (isInitialized) return;
  
  const now = new Date().toISOString();
  const manufacturers = ['LG전자', '삼성전자', '대우전자', '캐리어'];
  const models = ['AC-2400X', 'AW-3600Y', 'CU-4800Z', 'DX-1800W'];
  const capacities = [18.0, 24.0, 36.0, 48.0];
  const statuses: ('active' | 'maintenance' | 'inactive')[] = ['active', 'maintenance', 'inactive'];

  // 1공장 실외기 10개
  for (let i = 1; i <= 10; i++) {
    const manufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)];
    const model = models[Math.floor(Math.random() * models.length)];
    const capacity = capacities[Math.floor(Math.random() * capacities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const installDate = new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const lastMaintenanceDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const nextMaintenanceDate = new Date(lastMaintenanceDate.getTime() + (90 * 24 * 60 * 60 * 1000)); // 90일 후

    outdoorUnits.push({
      id: nextUnitId.toString(),
      name: `1공장 실외기 ${i}호기`,
      model,
      manufacturer,
      serialNumber: `1F${nextUnitId.toString().padStart(4, '0')}`,
      installationDate: installDate.toISOString().split('T')[0],
      location: `1공장 ${Math.floor((i-1)/5) + 1}동 ${((i-1) % 5) + 1}구역`,
      capacity,
      status,
      lastMaintenanceDate: lastMaintenanceDate.toISOString().split('T')[0],
      nextMaintenanceDate: nextMaintenanceDate.toISOString().split('T')[0],
      notes: i % 3 === 0 ? '정기점검 필요' : '',
      maintenanceRecords: [],
      createdAt: now,
      updatedAt: now
    });
    nextUnitId++;
  }

  // 3공장 실외기 10개
  for (let i = 1; i <= 10; i++) {
    const manufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)];
    const model = models[Math.floor(Math.random() * models.length)];
    const capacity = capacities[Math.floor(Math.random() * capacities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const installDate = new Date(2019 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const lastMaintenanceDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const nextMaintenanceDate = new Date(lastMaintenanceDate.getTime() + (90 * 24 * 60 * 60 * 1000)); // 90일 후

    outdoorUnits.push({
      id: nextUnitId.toString(),
      name: `3공장 실외기 ${i}호기`,
      model,
      manufacturer,
      serialNumber: `3F${nextUnitId.toString().padStart(4, '0')}`,
      installationDate: installDate.toISOString().split('T')[0],
      location: `3공장 ${Math.floor((i-1)/5) + 1}동 ${((i-1) % 5) + 1}구역`,
      capacity,
      status,
      lastMaintenanceDate: lastMaintenanceDate.toISOString().split('T')[0],
      nextMaintenanceDate: nextMaintenanceDate.toISOString().split('T')[0],
      notes: i % 4 === 0 ? '교체 검토 필요' : '',
      maintenanceRecords: [],
      createdAt: now,
      updatedAt: now
    });
    nextUnitId++;
  }
  
  isInitialized = true;
};

export const getNextUnitId = () => nextUnitId++;
export const getNextMaintenanceId = () => nextMaintenanceId++;