import { OutdoorUnit, MaintenanceRecord } from '../types/outdoor-unit';
import { csvData } from './csv-data';
import {
  loadOutdoorUnitsFromGitHub,
  loadMaintenanceRecordsFromGitHub,
  loadMetadataFromGitHub,
  saveAllDataToGitHub,
  testGitHubConnection
} from './github-storage';

// GitHub 기반 지속성 데이터 저장소
// 메모리 캐시 (성능 향상을 위해)
export const outdoorUnits: OutdoorUnit[] = [];
export const maintenanceRecords: MaintenanceRecord[] = [];
let nextUnitId = 1;
let nextMaintenanceId = 1;
let isInitialized = false;
let isGitHubAvailable = false;

// 서버 환경에서만 실행되는 코드
const isServer = typeof window === 'undefined';

// GitHub에서 모든 데이터 로드
export const loadAllDataFromGitHub = async (): Promise<boolean> => {
  if (!isServer) return false;
  
  try {
    console.log('Loading data from GitHub...');
    
    // GitHub 연결 테스트
    isGitHubAvailable = await testGitHubConnection();
    if (!isGitHubAvailable) {
      console.warn('GitHub not available, using fallback data');
      return false;
    }

    // 병렬로 모든 데이터 로드
    const [units, records, metadata] = await Promise.all([
      loadOutdoorUnitsFromGitHub(),
      loadMaintenanceRecordsFromGitHub(),
      loadMetadataFromGitHub(),
    ]);

    // 메모리 캐시 업데이트
    outdoorUnits.length = 0;
    outdoorUnits.push(...units);
    
    maintenanceRecords.length = 0;
    maintenanceRecords.push(...records);
    
    nextUnitId = metadata.nextUnitId;
    nextMaintenanceId = metadata.nextMaintenanceId;
    
    console.log(`Loaded ${units.length} units and ${records.length} records from GitHub`);
    return true;
  } catch (error) {
    console.error('Error loading data from GitHub:', error);
    isGitHubAvailable = false;
    return false;
  }
};

// GitHub에 모든 데이터 저장
export const saveAllDataToGitHubAsync = async (): Promise<boolean> => {
  if (!isServer || !isGitHubAvailable) return false;
  
  try {
    const metadata = {
      nextUnitId,
      nextMaintenanceId,
      lastUpdated: new Date().toISOString(),
      version: '1.0.12',
    };

    const success = await saveAllDataToGitHub(outdoorUnits, maintenanceRecords, metadata);
    
    if (success) {
      console.log('Successfully saved all data to GitHub');
    } else {
      console.error('Failed to save some data to GitHub');
    }
    
    return success;
  } catch (error) {
    console.error('Error saving data to GitHub:', error);
    return false;
  }
};

// LocalStorage 백업 (클라이언트 사이드에서만)
const isClient = typeof window !== 'undefined';

const STORAGE_KEYS = {
  OUTDOOR_UNITS: 'cdulog_outdoor_units',
  MAINTENANCE_RECORDS: 'cdulog_maintenance_records',
  NEXT_UNIT_ID: 'cdulog_next_unit_id',
  NEXT_MAINTENANCE_ID: 'cdulog_next_maintenance_id',
  INITIALIZED: 'cdulog_initialized'
};

// 로컬스토리지에서 데이터 로드 (백업용)
export const loadFromLocalStorage = () => {
  if (!isClient) return;
  
  try {
    const storedUnits = localStorage.getItem(STORAGE_KEYS.OUTDOOR_UNITS);
    const storedRecords = localStorage.getItem(STORAGE_KEYS.MAINTENANCE_RECORDS);
    const storedNextUnitId = localStorage.getItem(STORAGE_KEYS.NEXT_UNIT_ID);
    const storedNextMaintenanceId = localStorage.getItem(STORAGE_KEYS.NEXT_MAINTENANCE_ID);
    
    if (storedUnits && outdoorUnits.length === 0) {
      outdoorUnits.push(...JSON.parse(storedUnits));
    }
    
    if (storedRecords && maintenanceRecords.length === 0) {
      maintenanceRecords.push(...JSON.parse(storedRecords));
    }
    
    if (storedNextUnitId) {
      nextUnitId = Math.max(nextUnitId, parseInt(storedNextUnitId, 10));
    }
    
    if (storedNextMaintenanceId) {
      nextMaintenanceId = Math.max(nextMaintenanceId, parseInt(storedNextMaintenanceId, 10));
    }
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
  }
};

// 로컬스토리지에 데이터 저장 (백업용)
export const saveToLocalStorage = () => {
  if (!isClient) return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.OUTDOOR_UNITS, JSON.stringify(outdoorUnits));
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE_RECORDS, JSON.stringify(maintenanceRecords));
    localStorage.setItem(STORAGE_KEYS.NEXT_UNIT_ID, nextUnitId.toString());
    localStorage.setItem(STORAGE_KEYS.NEXT_MAINTENANCE_ID, nextMaintenanceId.toString());
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

// CSV 데이터 기반 초기화 (GitHub에서 데이터가 없을 때만)
export const initializeSampleData = async () => {
  if (isInitialized) return;
  
  // GitHub에서 데이터 로드 시도
  const githubLoaded = await loadAllDataFromGitHub();
  
  // GitHub에서 데이터를 불러왔거나 이미 데이터가 있으면 초기화 건너뛰기
  if (githubLoaded || outdoorUnits.length > 0) {
    isInitialized = true;
    return;
  }
  
  // LocalStorage에서 백업 데이터 로드
  loadFromLocalStorage();
  if (outdoorUnits.length > 0) {
    isInitialized = true;
    return;
  }
  
  console.log('Initializing sample data...');
  
  const now = new Date().toISOString();
  // CSV 데이터 기반 초기화
  const units: OutdoorUnit[] = csvData.map(row => ({
    id: getNextUnitId().toString(),
    name: row.name,
    installationDate: '2020-01-01', // 기본 설치일
    location: row.location,
    factoryName: row.factoryName,
    status: 'active' as const,
    lastMaintenanceDate: undefined,
    nextMaintenanceDate: undefined,
    notes: '',
    createdAt: now,
    updatedAt: now
  }));
  
  outdoorUnits.push(...units);
  isInitialized = true;
  
  // 로컬스토리지에 백업 저장
  saveToLocalStorage();
  
  // GitHub에 초기 데이터 저장 시도
  if (isGitHubAvailable) {
    await saveAllDataToGitHubAsync();
    console.log('Sample data saved to GitHub');
  }
};

export const getNextUnitId = () => nextUnitId++;
export const getNextMaintenanceId = () => nextMaintenanceId++;

// 실외기 상태 계산 함수
export const calculateUnitStatus = (unitId: string): 'active' | 'maintenance' | 'inactive' => {
  const activeMaintenanceRecords = maintenanceRecords.filter(
    record => record.outdoorUnitId === unitId && record.isActive
  );
  
  const unit = outdoorUnits.find(u => u.id === unitId);
  if (unit?.status === 'inactive') {
    return 'inactive';
  }
  
  if (activeMaintenanceRecords.length > 0) {
    return 'maintenance';
  }
  
  return 'active';
};

// 실외기 상태 업데이트 함수
export const updateUnitStatus = (unitId: string) => {
  const unit = outdoorUnits.find(u => u.id === unitId);
  if (unit && unit.status !== 'inactive') {
    unit.status = calculateUnitStatus(unitId);
    unit.updatedAt = new Date().toISOString();
    
    // 로컬스토리지 백업
    saveToLocalStorage();
    
    // GitHub에 저장 (비동기)
    if (isServer) {
      saveAllDataToGitHubAsync().catch(error => {
        console.error('Failed to save updated unit status to GitHub:', error);
      });
    }
  }
};

// 실외기 추가
export const addOutdoorUnit = async (unit: OutdoorUnit) => {
  outdoorUnits.push(unit);
  
  // 로컬스토리지 백업
  saveToLocalStorage();
  
  // GitHub에 저장
  if (isServer) {
    await saveAllDataToGitHubAsync();
  }
};

// 실외기 수정
export const updateOutdoorUnit = async (unitId: string, updates: Partial<OutdoorUnit>) => {
  const unitIndex = outdoorUnits.findIndex(u => u.id === unitId);
  if (unitIndex !== -1) {
    outdoorUnits[unitIndex] = { 
      ...outdoorUnits[unitIndex], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    
    // 로컬스토리지 백업
    saveToLocalStorage();
    
    // GitHub에 저장
    if (isServer) {
      await saveAllDataToGitHubAsync();
    }
  }
};

// 보수 기록 추가
export const addMaintenanceRecord = async (record: MaintenanceRecord) => {
  maintenanceRecords.push(record);
  updateUnitStatus(record.outdoorUnitId);
  
  // 로컬스토리지 백업
  saveToLocalStorage();
  
  // GitHub에 저장
  if (isServer) {
    await saveAllDataToGitHubAsync();
  }
};

// 보수 기록 수정
export const updateMaintenanceRecord = async (recordId: string, updates: Partial<MaintenanceRecord>) => {
  const recordIndex = maintenanceRecords.findIndex(r => r.id === recordId);
  if (recordIndex !== -1) {
    const updatedRecord = { 
      ...maintenanceRecords[recordIndex], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    maintenanceRecords[recordIndex] = updatedRecord;
    updateUnitStatus(updatedRecord.outdoorUnitId);
    
    // 로컬스토리지 백업
    saveToLocalStorage();
    
    // GitHub에 저장
    if (isServer) {
      await saveAllDataToGitHubAsync();
    }
  }
};

// GitHub 상태 확인
export const getGitHubStatus = () => ({
  isAvailable: isGitHubAvailable,
  isInitialized,
  dataCount: {
    units: outdoorUnits.length,
    records: maintenanceRecords.length,
  }
});