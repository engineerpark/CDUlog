import { OutdoorUnit, MaintenanceRecord } from '../types/outdoor-unit';
import { csvData } from './csv-data';

// 로컬스토리지 기반 지속성 데이터 저장소
const STORAGE_KEYS = {
  OUTDOOR_UNITS: 'cdulog_outdoor_units',
  MAINTENANCE_RECORDS: 'cdulog_maintenance_records',
  NEXT_UNIT_ID: 'cdulog_next_unit_id',
  NEXT_MAINTENANCE_ID: 'cdulog_next_maintenance_id',
  INITIALIZED: 'cdulog_initialized'
};

// 메모리 캐시
export const outdoorUnits: OutdoorUnit[] = [];
export const maintenanceRecords: MaintenanceRecord[] = [];
let nextUnitId = 1;
let nextMaintenanceId = 1;
let isInitialized = false;

// 브라우저 환경 체크
const isClient = typeof window !== 'undefined';

// 로컬스토리지에서 데이터 로드
export const loadFromLocalStorage = () => {
  if (!isClient) return;
  
  try {
    const storedUnits = localStorage.getItem(STORAGE_KEYS.OUTDOOR_UNITS);
    const storedRecords = localStorage.getItem(STORAGE_KEYS.MAINTENANCE_RECORDS);
    const storedNextUnitId = localStorage.getItem(STORAGE_KEYS.NEXT_UNIT_ID);
    const storedNextMaintenanceId = localStorage.getItem(STORAGE_KEYS.NEXT_MAINTENANCE_ID);
    const storedInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    
    if (storedUnits) {
      outdoorUnits.length = 0;
      outdoorUnits.push(...JSON.parse(storedUnits));
    }
    
    if (storedRecords) {
      maintenanceRecords.length = 0;
      maintenanceRecords.push(...JSON.parse(storedRecords));
    }
    
    if (storedNextUnitId) {
      nextUnitId = parseInt(storedNextUnitId, 10);
    }
    
    if (storedNextMaintenanceId) {
      nextMaintenanceId = parseInt(storedNextMaintenanceId, 10);
    }
    
    if (storedInitialized) {
      isInitialized = JSON.parse(storedInitialized);
    }
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
  }
};

// 로컬스토리지에 데이터 저장
export const saveToLocalStorage = () => {
  if (!isClient) return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.OUTDOOR_UNITS, JSON.stringify(outdoorUnits));
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE_RECORDS, JSON.stringify(maintenanceRecords));
    localStorage.setItem(STORAGE_KEYS.NEXT_UNIT_ID, nextUnitId.toString());
    localStorage.setItem(STORAGE_KEYS.NEXT_MAINTENANCE_ID, nextMaintenanceId.toString());
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, JSON.stringify(isInitialized));
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
  }
};

// 최근 보수 이력 조회
export const getLatestMaintenanceRecord = (): { record: MaintenanceRecord; unit: OutdoorUnit } | null => {
  if (maintenanceRecords.length === 0) return null;
  
  const sortedRecords = [...maintenanceRecords].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  const latestRecord = sortedRecords[0];
  const unit = outdoorUnits.find(u => u.id === latestRecord.outdoorUnitId);
  
  if (!unit) return null;
  
  return { record: latestRecord, unit };
};

export const initializeSampleData = () => {
  // 먼저 로컬스토리지에서 데이터 로드
  loadFromLocalStorage();
  
  // 이미 초기화되었거나 기존 데이터가 있으면 건너뛰기
  if (isInitialized || outdoorUnits.length > 0) {
    return;
  }
  
  const now = new Date().toISOString();
  // 외부업체 점검을 위해 민감한 정보 제거 (제조사, 모델명, 시리얼번호)
  // 모든 장비를 정상가동으로 초기화
  const status = 'active';

  // CSV 데이터 기반으로 실외기 데이터 생성
  csvData.forEach((item, index) => {
    const installDate = new Date(2019 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const lastMaintenanceDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const nextMaintenanceDate = new Date(lastMaintenanceDate.getTime() + (90 * 24 * 60 * 60 * 1000)); // 90일 후

    outdoorUnits.push({
      id: nextUnitId.toString(),
      name: item.name,
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
  
  // 로컬스토리지에 저장
  saveToLocalStorage();
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
  
  // 보수 항목이 1개라도 있으면 보수필요, 0개가 되면 다시 정상가동
  if (activeMaintenanceRecords.length > 0) {
    return 'maintenance';
  }
  
  // 보수 항목이 0개이면 정상가동
  return 'active';
};

// 실외기 상태 업데이트 함수
export const updateUnitStatus = (unitId: string) => {
  const unit = outdoorUnits.find(u => u.id === unitId);
  if (unit && unit.status !== 'inactive') {
    unit.status = calculateUnitStatus(unitId);
    unit.updatedAt = new Date().toISOString();
    saveToLocalStorage(); // 상태 변경 시 자동 저장
  }
};

// 실외기 추가
export const addOutdoorUnit = (unit: OutdoorUnit) => {
  outdoorUnits.push(unit);
  saveToLocalStorage();
};

// 실외기 수정
export const updateOutdoorUnit = (unitId: string, updates: Partial<OutdoorUnit>) => {
  const unitIndex = outdoorUnits.findIndex(u => u.id === unitId);
  if (unitIndex !== -1) {
    outdoorUnits[unitIndex] = { ...outdoorUnits[unitIndex], ...updates, updatedAt: new Date().toISOString() };
    saveToLocalStorage();
  }
};

// 보수 기록 추가
export const addMaintenanceRecord = (record: MaintenanceRecord) => {
  maintenanceRecords.push(record);
  updateUnitStatus(record.outdoorUnitId);
  saveToLocalStorage();
};

// 보수 기록 수정
export const updateMaintenanceRecord = (recordId: string, updates: Partial<MaintenanceRecord>) => {
  const recordIndex = maintenanceRecords.findIndex(r => r.id === recordId);
  if (recordIndex !== -1) {
    const updatedRecord = { ...maintenanceRecords[recordIndex], ...updates, updatedAt: new Date().toISOString() };
    maintenanceRecords[recordIndex] = updatedRecord;
    updateUnitStatus(updatedRecord.outdoorUnitId);
    saveToLocalStorage();
  }
};