import { OutdoorUnit, MaintenanceRecord } from '../types/outdoor-unit';
import { csvData } from './csv-data';

// 임시 메모리 데이터 저장소 (실제 프로덕션에서는 데이터베이스 사용)
export const outdoorUnits: OutdoorUnit[] = [];
export const maintenanceRecords: MaintenanceRecord[] = [];

let nextUnitId = 1;
let nextMaintenanceId = 1;

// CSV 데이터 기반 초기화
let isInitialized = false;

export const initializeSampleData = () => {
  if (isInitialized) return;
  
  // 기존 데이터 모두 삭제
  outdoorUnits.length = 0;
  maintenanceRecords.length = 0;
  nextUnitId = 1;
  nextMaintenanceId = 1;
  
  const now = new Date().toISOString();
  const manufacturers = ['LG전자', '삼성전자', '대우전자', '캐리어', 'LG케미드'];
  const models = ['AC-2400X', 'AW-3600Y', 'CU-4800Z', 'DX-1800W', 'AHU-1000', 'DHU-2000', 'CDU-3000'];
  // 모든 장비를 정상가동으로 초기화
  const status = 'active';

  // CSV 데이터 기반으로 실외기 데이터 생성
  csvData.forEach((item, index) => {
    const manufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)];
    const model = models[Math.floor(Math.random() * models.length)];
    
    const installDate = new Date(2019 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const lastMaintenanceDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const nextMaintenanceDate = new Date(lastMaintenanceDate.getTime() + (90 * 24 * 60 * 60 * 1000)); // 90일 후

    outdoorUnits.push({
      id: nextUnitId.toString(),
      name: item.name,
      model,
      manufacturer,
      serialNumber: `${item.factoryName.slice(-3)}${nextUnitId.toString().padStart(4, '0')}`,
      installationDate: installDate.toISOString().split('T')[0],
      location: item.location || '미지정',
      factoryName: item.factoryName,
      status,
      lastMaintenanceDate: lastMaintenanceDate.toISOString().split('T')[0],
      nextMaintenanceDate: nextMaintenanceDate.toISOString().split('T')[0],
      notes: index % 5 === 0 ? '정기점검 필요' : '',
      maintenanceRecords: [],
      createdAt: now,
      updatedAt: now
    });
    nextUnitId++;
  });
  
  isInitialized = true;
};

export const getNextUnitId = () => nextUnitId++;
export const getNextMaintenanceId = () => nextMaintenanceId++;

// 실외기 상태 계산 함수
export const calculateUnitStatus = (unitId: string): 'active' | 'maintenance' | 'inactive' => {
  const activeMaintenanceRecords = maintenanceRecords.filter(
    record => record.outdoorUnitId === unitId && record.isActive
  );
  
  // 비가동 상태는 사용자가 수동으로 설정
  const unit = outdoorUnits.find(u => u.id === unitId);
  if (unit?.status === 'inactive') {
    return 'inactive';
  }
  
  // 활성 보수 항목이 1개 이상 있으면 보수필요
  if (activeMaintenanceRecords.length >= 1) {
    return 'maintenance';
  }
  
  // 그 외에는 정상가동
  return 'active';
};

// 실외기 상태 업데이트 함수
export const updateUnitStatus = (unitId: string) => {
  const unit = outdoorUnits.find(u => u.id === unitId);
  if (unit && unit.status !== 'inactive') {
    unit.status = calculateUnitStatus(unitId);
    unit.updatedAt = new Date().toISOString();
  }
};