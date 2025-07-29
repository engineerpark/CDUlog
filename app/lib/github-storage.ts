// GitHub Repository 기반 데이터 저장소
import { OutdoorUnit, MaintenanceRecord } from '../types/outdoor-unit';

// GitHub 설정
const GITHUB_CONFIG = {
  owner: 'engineerpark',
  repo: 'CDUlog',
  branch: 'main',
  dataPath: 'data',
  token: '', // 런타임에 설정됨
};

// 토큰 설정 함수 (서버 사이드에서만 실행)
const getGitHubToken = (): string => {
  if (typeof window !== 'undefined') {
    // 클라이언트 사이드에서는 토큰 없음
    return '';
  }
  
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn('GITHUB_TOKEN environment variable is not set');
    return '';
  }
  
  if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
    console.warn('GITHUB_TOKEN format appears to be invalid');
    return '';
  }
  
  return token;
};

// 데이터 파일 경로
const DATA_FILES = {
  OUTDOOR_UNITS: 'data/outdoor-units.json',
  MAINTENANCE_RECORDS: 'data/maintenance-records.json',
  METADATA: 'data/metadata.json',
};

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  content?: string;
  encoding?: string;
}

interface GitHubCreateUpdateResponse {
  content: GitHubFile;
  commit: {
    sha: string;
    url: string;
    html_url: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
}

interface Metadata {
  nextUnitId: number;
  nextMaintenanceId: number;
  lastUpdated: string;
  version: string;
}

// GitHub API 헤더
const getHeaders = () => {
  const token = getGitHubToken();
  if (!token) {
    throw new Error('GitHub token is not available');
  }
  
  return {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'User-Agent': 'CDUlog-App',
  };
};

// GitHub에서 파일 내용 가져오기
export const getFileFromGitHub = async (filePath: string): Promise<string | null> => {
  try {
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filePath}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (response.status === 404) {
      console.log(`File not found: ${filePath}`);
      return null;
    }

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data: GitHubFile = await response.json();
    
    if (data.content && data.encoding === 'base64') {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching file ${filePath}:`, error);
    return null;
  }
};

// GitHub에 파일 저장하기
export const saveFileToGitHub = async (
  filePath: string, 
  content: string, 
  message: string
): Promise<boolean> => {
  try {
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filePath}`;
    
    // 먼저 기존 파일의 SHA를 가져오기 (업데이트를 위해 필요)
    let existingSha: string | undefined;
    try {
      const existingResponse = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      if (existingResponse.ok) {
        const existingData: GitHubFile = await existingResponse.json();
        existingSha = existingData.sha;
      }
    } catch {
      // 파일이 존재하지 않으면 새로 생성
      console.log(`Creating new file: ${filePath}`);
    }

    const body = {
      message,
      content: Buffer.from(content).toString('base64'),
      branch: GITHUB_CONFIG.branch,
      ...(existingSha && { sha: existingSha }),
    };

    const response = await fetch(url, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`GitHub API error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const result: GitHubCreateUpdateResponse = await response.json();
    console.log(`Successfully saved ${filePath}, commit SHA: ${result.commit.sha}`);
    return true;
  } catch (error) {
    console.error(`Error saving file ${filePath}:`, error);
    return false;
  }
};

// 실외기 데이터 로드
export const loadOutdoorUnitsFromGitHub = async (): Promise<OutdoorUnit[]> => {
  try {
    const content = await getFileFromGitHub(DATA_FILES.OUTDOOR_UNITS);
    if (!content) {
      console.log('No outdoor units file found, returning empty array');
      return [];
    }
    
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error loading outdoor units from GitHub:', error);
    return [];
  }
};

// 보수 기록 데이터 로드
export const loadMaintenanceRecordsFromGitHub = async (): Promise<MaintenanceRecord[]> => {
  try {
    const content = await getFileFromGitHub(DATA_FILES.MAINTENANCE_RECORDS);
    if (!content) {
      console.log('No maintenance records file found, returning empty array');
      return [];
    }
    
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error loading maintenance records from GitHub:', error);
    return [];
  }
};

// 메타데이터 로드
export const loadMetadataFromGitHub = async (): Promise<Metadata> => {
  try {
    const content = await getFileFromGitHub(DATA_FILES.METADATA);
    if (!content) {
      const defaultMetadata: Metadata = {
        nextUnitId: 1,
        nextMaintenanceId: 1,
        lastUpdated: new Date().toISOString(),
        version: '1.0.0',
      };
      return defaultMetadata;
    }
    
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading metadata from GitHub:', error);
    return {
      nextUnitId: 1,
      nextMaintenanceId: 1,
      lastUpdated: new Date().toISOString(),
      version: '1.0.0',
    };
  }
};

// 실외기 데이터 저장
export const saveOutdoorUnitsToGitHub = async (units: OutdoorUnit[]): Promise<boolean> => {
  const content = JSON.stringify(units, null, 2);
  const message = `Update outdoor units data - ${new Date().toISOString()}`;
  return await saveFileToGitHub(DATA_FILES.OUTDOOR_UNITS, content, message);
};

// 보수 기록 데이터 저장
export const saveMaintenanceRecordsToGitHub = async (records: MaintenanceRecord[]): Promise<boolean> => {
  const content = JSON.stringify(records, null, 2);
  const message = `Update maintenance records data - ${new Date().toISOString()}`;
  return await saveFileToGitHub(DATA_FILES.MAINTENANCE_RECORDS, content, message);
};

// 메타데이터 저장
export const saveMetadataToGitHub = async (metadata: Metadata): Promise<boolean> => {
  const content = JSON.stringify(metadata, null, 2);
  const message = `Update metadata - ${new Date().toISOString()}`;
  return await saveFileToGitHub(DATA_FILES.METADATA, content, message);
};

// 모든 데이터를 한 번에 저장 (트랜잭션과 유사한 효과)
export const saveAllDataToGitHub = async (
  units: OutdoorUnit[],
  records: MaintenanceRecord[],
  metadata: Metadata
): Promise<boolean> => {
  try {
    const results = await Promise.all([
      saveOutdoorUnitsToGitHub(units),
      saveMaintenanceRecordsToGitHub(records),
      saveMetadataToGitHub(metadata),
    ]);
    
    return results.every(result => result === true);
  } catch (error) {
    console.error('Error saving all data to GitHub:', error);
    return false;
  }
};

// GitHub 연결 상태 확인
export const testGitHubConnection = async (): Promise<{ connected: boolean; error?: string }> => {
  try {
    // 토큰 확인
    const token = getGitHubToken();
    if (!token) {
      return { 
        connected: false, 
        error: 'GITHUB_TOKEN environment variable is not set or invalid' 
      };
    }

    const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { 
        connected: false, 
        error: `GitHub API error: ${response.status} ${response.statusText} - ${errorText}` 
      };
    }
    
    console.log('GitHub connection successful');
    return { connected: true };
  } catch (error) {
    console.error('GitHub connection test failed:', error);
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};