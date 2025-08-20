'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OutdoorUnit, CreateMaintenanceRecordRequest, MaintenanceRecord } from '../types/outdoor-unit';

const PRESET_ISSUES = [
  { id: 'refrigerant_leak', label: '냉매배관누설', description: '냉매배관 누설로 인한 냉매 부족', color: 'bg-red-100 text-red-800 hover:bg-red-200' },
  { id: 'fan_motor_replacement', label: '팬모터 교체', description: '팬모터 고장으로 인한 교체 필요', color: 'bg-orange-100 text-orange-800 hover:bg-orange-200' },
  { id: 'filter_dryer_replacement', label: '필터드라이어 교체', description: '필터드라이어 교체 필요', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
  { id: 'compressor_replacement', label: '압축기 교체', description: '압축기 고장으로 인한 교체 필요', color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
  { id: 'expansion_valve_replacement', label: '팽창밸브 교체', description: '팽창밸브 교체 필요', color: 'bg-green-100 text-green-800 hover:bg-green-200' },
  { id: 'refrigerant_refill', label: '냉매 충진', description: '냉매 부족으로 인한 냉매 충진', color: 'bg-purple-100 text-purple-800 hover:bg-purple-200' }
];

export default function AssetsPage() {
  const router = useRouter();
  const [outdoorUnits, setOutdoorUnits] = useState<OutdoorUnit[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<OutdoorUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<OutdoorUnit | null>(null);
  const [customInput, setCustomInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string>('user');
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [allMaintenanceRecords, setAllMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  
  // 해제 모달 상태
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedRecordForResolve, setSelectedRecordForResolve] = useState<string | null>(null);
  const [resolveNotes, setResolveNotes] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'inactive'>('active');
  
  // 인라인 내역 작성 상태
  const [inlineEditingRecord, setInlineEditingRecord] = useState<string | null>(null);
  const [inlineNotes, setInlineNotes] = useState<{[key: string]: string}>({});
  
  // 필터 상태
  const [factoryFilter, setFactoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // 장비명 편집 상태
  const [isEditingUnitName, setIsEditingUnitName] = useState(false);
  const [editingUnitName, setEditingUnitName] = useState<string>('');
  
  // 문의사항 모달 상태
  const [showContactModal, setShowContactModal] = useState(false);
  
  // 최근 보수 이력 상태
  const [latestMaintenanceInfo, setLatestMaintenanceInfo] = useState<{
    record: MaintenanceRecord;
    unit: OutdoorUnit;
  } | null>(null);
  
  // 전체 해제된 보수 이력 상태
  const [allResolvedRecords, setAllResolvedRecords] = useState<(MaintenanceRecord & { unit: OutdoorUnit | null })[]>([]);
  
  // Supabase 연동 상태
  const [supabaseStatus, setSupabaseStatus] = useState<{
    isConnected: boolean;
    isAvailable: boolean;
    dataCount: { units: number; records: number };
    connectionError?: string | null;
    debugInfo?: {
      hasUrl: boolean;
      hasKey: boolean;
      urlPrefix: string;
    };
  } | null>(null);

  useEffect(() => {
    // 로그인 확인
    const checkAuth = () => {
      const loggedIn = localStorage.getItem('isLoggedIn');
      if (loggedIn === 'true') {
        setIsLoggedIn(true);
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          const userData = JSON.parse(userInfo);
          setUserRole(userData.role || 'user');
        }
        fetchOutdoorUnits();
      } else {
        router.push('/');
      }
    };
    
    checkAuth();
  }, [router]);

  useEffect(() => {
    // selectedUnit이 변경될 때 상태 동기화
    if (selectedUnit) {
      setSelectedStatus(selectedUnit.status === 'inactive' ? 'inactive' : 'active');
    }
  }, [selectedUnit]);

  useEffect(() => {
    // 필터링 로직
    let filtered = outdoorUnits;
    
    if (factoryFilter !== 'all') {
      filtered = filtered.filter(unit => 
        unit.factoryName && unit.factoryName.includes(factoryFilter)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(unit => unit.status === statusFilter);
    }
    
    setFilteredUnits(filtered);
  }, [outdoorUnits, factoryFilter, statusFilter]);

  const fetchOutdoorUnits = async () => {
    try {
      const response = await fetch('/api/outdoor-units');
      const result = await response.json();
      
      if (result.success) {
        setOutdoorUnits(result.data);
        // 최근 보수 이력 가져오기
        fetchLatestMaintenanceRecord();
        // 전체 해제된 보수 이력 가져오기
        fetchAllResolvedRecords();
        // Supabase 상태 가져오기
        fetchSupabaseStatus();
      } else {
        setError('Failed to fetch outdoor units');
      }
    } catch {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLatestMaintenanceRecord = async () => {
    try {
      const response = await fetch('/api/maintenance-records/latest');
      const result = await response.json();
      
      if (result.success && result.data) {
        setLatestMaintenanceInfo(result.data);
      }
    } catch (error) {
      console.error('Error fetching latest maintenance record:', error);
    }
  };

  const fetchAllResolvedRecords = async () => {
    try {
      const response = await fetch('/api/maintenance-records/all-resolved');
      const result = await response.json();
      
      if (result.success && result.data) {
        setAllResolvedRecords(result.data);
      }
    } catch (error) {
      console.error('Error fetching all resolved records:', error);
    }
  };

  const fetchSupabaseStatus = async () => {
    try {
      const healthResponse = await fetch('/api/health');
      const healthResult = await healthResponse.json();
      
      if (healthResult.success) {
        // 데이터 수 조회
        const unitsResponse = await fetch('/api/outdoor-units');
        const recordsResponse = await fetch('/api/maintenance-records');
        
        const unitsResult = await unitsResponse.json();
        const recordsResult = await recordsResponse.json();
        
        setSupabaseStatus({
          isConnected: healthResult.data.hasSupabaseUrl && healthResult.data.hasSupabaseKey,
          isAvailable: true,
          dataCount: {
            units: unitsResult.success ? unitsResult.data.length : 0,
            records: recordsResult.success ? recordsResult.data.length : 0
          },
          connectionError: unitsResult.success ? null : 'API 연결 오류',
          debugInfo: {
            hasUrl: healthResult.data.hasSupabaseUrl,
            hasKey: healthResult.data.hasSupabaseKey,
            urlPrefix: healthResult.data.supabaseUrlPrefix
          }
        });
      }
    } catch (error) {
      console.error('Error fetching Supabase status:', error);
      setSupabaseStatus({
        isConnected: false,
        isAvailable: false,
        dataCount: { units: 0, records: 0 },
        connectionError: '연결 실패',
        debugInfo: {
          hasUrl: false,
          hasKey: false,
          urlPrefix: 'Unknown'
        }
      });
    }
  };

  const fetchMaintenanceRecords = async (unitId: string) => {
    try {
      const response = await fetch(`/api/maintenance-records?outdoorUnitId=${unitId}`);
      const result = await response.json();
      
      if (result.success) {
        const records = result.data as MaintenanceRecord[];
        setMaintenanceRecords(records.filter(record => record.isActive));
        setAllMaintenanceRecords(records);
      } else {
        setMaintenanceRecords([]);
        setAllMaintenanceRecords([]);
      }
    } catch {
      setMaintenanceRecords([]);
      setAllMaintenanceRecords([]);
    }
  };

  const handleMaintenanceRecord = async (description: string) => {
    if (!selectedUnit) return;
    
    setIsSubmitting(true);
    
    const today = new Date().toISOString().split('T')[0];
    const maintenanceData: CreateMaintenanceRecordRequest = {
      outdoorUnitId: selectedUnit.id,
      maintenanceDate: today,
      maintenanceType: 'corrective',
      description: description,
      performedBy: 'LG Chem 현장작업자',
      status: 'completed',
      notes: `현장에서 발견된 문제: ${description}`
    };

    try {
      const response = await fetch('/api/maintenance-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(maintenanceData),
      });

      if (response.ok) {
        // 성공 시 실외기 목록 새로고침 및 보수 항목 목록 새로고침
        await fetchOutdoorUnits();
        await fetchMaintenanceRecords(selectedUnit.id);
        // 최근 보수 이력 업데이트
        await fetchLatestMaintenanceRecord();
        // 전체 해제된 보수 이력 업데이트
        await fetchAllResolvedRecords();
        setCustomInput('');
        setError('유지보수 기록이 저장되었습니다.');
        
        // 3초 후 성공 메시지 제거
        setTimeout(() => setError(null), 3000);
      } else {
        setError('유지보수 기록 저장에 실패했습니다');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePresetIssue = (issue: typeof PRESET_ISSUES[0]) => {
    handleMaintenanceRecord(issue.description);
  };

  const handleCustomIssue = () => {
    if (customInput.trim()) {
      handleMaintenanceRecord(customInput.trim());
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loginTime');
    router.push('/');
  };

  const handleCSVDownload = async () => {
    try {
      const response = await fetch('/api/export/maintenance-records?format=csv');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const today = new Date().toISOString().split('T')[0];
        a.download = `maintenance-records-${today}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setError('CSV 파일이 다운로드되었습니다.');
        setTimeout(() => setError(null), 3000);
      } else {
        setError('CSV 다운로드에 실패했습니다.');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: '정상가동', className: 'bg-green-100 text-green-800' },
      maintenance: { label: '보수필요', className: 'bg-yellow-100 text-yellow-800' },
      inactive: { label: '비가동', className: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const handleMaintenanceRecordResolve = async (recordId: string, notes?: string) => {
    if (!selectedUnit) return;
    
    setIsSubmitting(true);
    
    try {
      const currentUser = getCurrentUser();
      const resolvedByName = currentUser ? currentUser.name : 'LG Chem 현장작업자';
      
      console.log('Resolving maintenance record:', {
        recordId,
        notes,
        unitId: selectedUnit.id,
        resolvedBy: resolvedByName
      });
      
      const response = await fetch(`/api/maintenance-records/${recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: false,
          resolvedBy: resolvedByName,
          resolvedNotes: notes || ''
        }),
      });

      const result = await response.json();
      console.log('API Response:', result);

      if (response.ok && result.success) {
        // 성공 시 목록 새로고침
        await fetchOutdoorUnits();
        await fetchMaintenanceRecords(selectedUnit.id);
        // 최근 보수 이력 업데이트
        await fetchLatestMaintenanceRecord();
        // 전체 해제된 보수 이력 업데이트
        await fetchAllResolvedRecords();
        setError('보수 항목이 해제되었습니다.');
        
        // 3초 후 성공 메시지 제거
        setTimeout(() => setError(null), 3000);
        
        // 모달 닫기
        setShowResolveModal(false);
        setSelectedRecordForResolve(null);
        setResolveNotes('');
      } else {
        setError(`보수 항목 해제에 실패했습니다: ${result.error || '알 수 없는 오류'}`);
      }
    } catch (err) {
      console.error('Error resolving maintenance record:', err);
      setError('네트워크 오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleResolveModalOpen = (recordId: string) => {
  //   setSelectedRecordForResolve(recordId);
  //   setShowResolveModal(true);
  //   setResolveNotes('');
  // };

  const handleInlineEditToggle = (recordId: string) => {
    if (inlineEditingRecord === recordId) {
      setInlineEditingRecord(null);
      setInlineNotes(prev => {
        const newNotes = { ...prev };
        delete newNotes[recordId];
        return newNotes;
      });
    } else {
      setInlineEditingRecord(recordId);
      setInlineNotes(prev => ({ ...prev, [recordId]: '' }));
    }
  };

  const handleInlineNotesChange = (recordId: string, value: string) => {
    setInlineNotes(prev => ({ ...prev, [recordId]: value }));
  };

  const handleInlineResolveSubmit = async (recordId: string) => {
    const notes = inlineNotes[recordId] || '';
    await handleMaintenanceRecordResolve(recordId, notes);
    setInlineEditingRecord(null);
    setInlineNotes(prev => {
      const newNotes = { ...prev };
      delete newNotes[recordId];
      return newNotes;
    });
  };

  const handleResolveModalClose = () => {
    setShowResolveModal(false);
    setSelectedRecordForResolve(null);
    setResolveNotes('');
  };

  const handleResolveSubmit = () => {
    if (selectedRecordForResolve) {
      handleMaintenanceRecordResolve(selectedRecordForResolve, resolveNotes);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedUnit) return;
    
    try {
      const response = await fetch(`/api/outdoor-units/${selectedUnit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: selectedStatus
        }),
      });

      if (response.ok) {
        // 성공 시 목록 새로고침
        await fetchOutdoorUnits();
        setError(`상태가 ${selectedStatus === 'active' ? '정상가동' : '비가동'}으로 변경되었습니다.`);
        
        // 3초 후 성공 메시지 제거
        setTimeout(() => setError(null), 3000);
        
        // 선택된 유닛 상태 업데이트
        setSelectedUnit(prev => prev ? { ...prev, status: selectedStatus } : null);
      } else {
        setError('상태 변경에 실패했습니다');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다');
    }
  };

  // 현재 로그인한 사용자 정보 가져오기
  const getCurrentUser = () => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  };

  // 관리자 전용: 장비명 편집 함수
  const handleEditUnitName = () => {
    if (userRole !== 'admin' || !selectedUnit) return;
    setIsEditingUnitName(true);
    setEditingUnitName(selectedUnit.name);
  };

  const handleSaveUnitName = async () => {
    if (!selectedUnit || !editingUnitName.trim()) return;
    
    try {
      const response = await fetch(`/api/outdoor-units/${selectedUnit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingUnitName.trim()
        }),
      });

      if (response.ok) {
        // 성공 시 목록 새로고침
        await fetchOutdoorUnits();
        setIsEditingUnitName(false);
        setEditingUnitName('');
        setError('장비명이 성공적으로 변경되었습니다.');
        
        // 3초 후 성공 메시지 제거
        setTimeout(() => setError(null), 3000);
        
        // 선택된 유닛 이름 업데이트
        setSelectedUnit(prev => prev ? { ...prev, name: editingUnitName.trim() } : null);
      } else {
        setError('장비명 변경에 실패했습니다.');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    }
  };

  const handleCancelEditUnitName = () => {
    setIsEditingUnitName(false);
    setEditingUnitName('');
  };

  if (!isLoggedIn || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">실외기 목록을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 카드 섹션 화면
  if (selectedUnit) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {/* 헤더 */}
            <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
              <div className="text-white flex-1">
                {isEditingUnitName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingUnitName}
                      onChange={(e) => setEditingUnitName(e.target.value)}
                      className="text-xl font-bold bg-white text-gray-900 px-2 py-1 rounded"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveUnitName}
                      className="text-green-200 hover:text-white"
                      title="저장"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleCancelEditUnitName}
                      className="text-red-200 hover:text-white"
                      title="취소"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{selectedUnit.name}</h2>
                    <button
                      onClick={handleEditUnitName}
                      className="text-blue-200 hover:text-white"
                      title="장비명 편집"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                )}
                <p className="text-blue-100">{selectedUnit.factoryName} | {selectedUnit.location || '위치 미정'}</p>
              </div>
              <button
                onClick={() => setSelectedUnit(null)}
                className="text-white hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 설비 정보 */}
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">현재 상태</label>
                  <div className="mt-1">{getStatusBadge(selectedUnit.status)}</div>
                </div>
              </div>
            </div>

            {/* 현재 보수 항목 목록 */}
            {maintenanceRecords.length > 0 && (
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">현재 보수 항목 ({maintenanceRecords.length})</h3>
                <div className="space-y-3">
                  {maintenanceRecords.map((record) => (
                    <div key={record.id} className="bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center justify-between p-3">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{record.description}</div>
                          <div className="text-sm text-gray-500">
                            입력: {new Date(record.createdAt).toLocaleDateString('ko-KR')} {new Date(record.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleMaintenanceRecordResolve(record.id, '기본 해제')}
                            disabled={isSubmitting}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ cursor: isSubmitting ? 'wait' : 'pointer' }}
                          >
                            해제
                          </button>
                          <button
                            onClick={() => handleInlineEditToggle(record.id)}
                            disabled={isSubmitting}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ cursor: isSubmitting ? 'wait' : 'pointer' }}
                          >
                            {inlineEditingRecord === record.id ? '취소' : '내역작성'}
                          </button>
                        </div>
                      </div>
                      
                      {/* 인라인 편집 영역 */}
                      {inlineEditingRecord === record.id && (
                        <div className="px-3 pb-3 border-t border-yellow-300">
                          <div className="mt-3 space-y-3">
                            <label className="block text-sm font-medium text-gray-700">
                              완료 내역 및 비고사항
                            </label>
                            <textarea
                              value={inlineNotes[record.id] || ''}
                              onChange={(e) => handleInlineNotesChange(record.id, e.target.value)}
                              placeholder="예: 팬모터 교체 완료, 냉매 보충으로 누출 문제 해결, 압축기 정상 작동 확인 등..."
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                              disabled={isSubmitting}
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleInlineEditToggle(record.id)}
                                disabled={isSubmitting}
                                className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                              >
                                취소
                              </button>
                              <button
                                onClick={() => handleInlineResolveSubmit(record.id)}
                                disabled={isSubmitting}
                                className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                              >
                                {isSubmitting ? '처리중...' : '완료처리'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 보수 이력 목록 */}
            {allMaintenanceRecords.filter(record => !record.isActive).length > 0 && (
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">보수 이력</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {allMaintenanceRecords
                    .filter(record => !record.isActive)
                    .sort((a, b) => new Date(b.resolvedDate || b.updatedAt).getTime() - new Date(a.resolvedDate || a.updatedAt).getTime())
                    .map((record) => (
                    <div key={record.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="font-medium text-gray-900">{record.description}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        <div>입력: {new Date(record.createdAt).toLocaleDateString('ko-KR')} {new Date(record.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</div>
                        {record.resolvedDate && (
                          <div>해제: {new Date(record.resolvedDate).toLocaleDateString('ko-KR')} {new Date(record.resolvedDate).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} - {record.resolvedBy}</div>
                        )}
                        {record.resolvedNotes && (
                          <div className="mt-1 p-2 bg-white border border-gray-200 rounded text-gray-700">해제 내역: {record.resolvedNotes}</div>
                        )}
                      </div>
                      <div className="flex items-center mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          완료
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 상태 변경 */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">상태 변경</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="active"
                        checked={selectedStatus === 'active'}
                        onChange={(e) => setSelectedStatus(e.target.value as 'active')}
                        className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-900">정상가동</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="inactive"
                        checked={selectedStatus === 'inactive'}
                        onChange={(e) => setSelectedStatus(e.target.value as 'inactive')}
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-900">비가동</span>
                    </label>
                  </div>
                </div>
                <button
                  onClick={handleStatusChange}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  상태 변경 적용
                </button>
              </div>
            </div>

            {/* 보수 항목 입력 */}
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">보수 항목 입력</h3>
              
              {error && (
                <div className={`p-4 mb-4 rounded-md ${error.includes('저장되었습니다') || error.includes('해제되었습니다') || error.includes('변경되었습니다') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`text-sm ${error.includes('저장되었습니다') || error.includes('해제되었습니다') || error.includes('변경되었습니다') ? 'text-green-800' : 'text-red-800'}`}>{error}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* 프리셋 이슈 버튼들 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">자주 발생하는 문제</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {PRESET_ISSUES.map((issue) => (
                      <button
                        key={issue.id}
                        onClick={() => handlePresetIssue(issue)}
                        disabled={isSubmitting}
                        className={`p-4 text-sm font-medium rounded-lg border border-gray-200 ${issue.color} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                      >
                        <div className="text-center">
                          <div className="font-bold">{issue.label}</div>
                          <div className="text-xs mt-1 opacity-75">{issue.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 직접 입력 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">직접 입력</label>
                  <div className="flex gap-3">
                    <textarea
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="발견된 문제나 수행한 작업을 자세히 입력하세요..."
                      rows={3}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      disabled={isSubmitting}
                    />
                    <button
                      onClick={handleCustomIssue}
                      disabled={isSubmitting || !customInput.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? '저장 중...' : '저장'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 메인 목록 화면
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">LG화학 청주공장 실외기 유지보수 관리 시스템</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowContactModal(true)}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              문의사항
            </button>
            <button
              onClick={handleCSVDownload}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              CSV 다운로드
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* Supabase 연결상태 - 작은 신호등 아이콘 */}
        <div className="flex justify-between items-center mb-4">
          <div></div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">DB 연결상태:</span>
            <div 
              className={`w-3 h-3 rounded-full ${
                supabaseStatus?.isConnected 
                  ? 'bg-green-500' 
                  : supabaseStatus?.isAvailable === false 
                  ? 'bg-red-500' 
                  : 'bg-yellow-500'
              }`}
              title={supabaseStatus?.isConnected 
                ? `연결됨 (실외기 ${supabaseStatus.dataCount.units}대, 보수기록 ${supabaseStatus.dataCount.records}건)`
                : supabaseStatus?.connectionError || '연결 확인 중...'}
            ></div>
          </div>
        </div>



        {/* 필터 */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">공장별 필터</label>
              <select
                value={factoryFilter}
                onChange={(e) => setFactoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">전체 공장</option>
                <option value="전자소재3공장">전자소재3공장</option>
                <option value="전자소재6공장">전자소재6공장</option>
                <option value="전자소재7공장">전자소재7공장</option>
                <option value="전자소재8공장">전자소재8공장</option>
                <option value="전자소재9공장">전자소재9공장</option>
                <option value="부설연구소">부설연구소</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">점검상태 필터</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">전체 상태</option>
                <option value="active">정상가동</option>
                <option value="maintenance">보수필요</option>
                <option value="inactive">비가동</option>
              </select>
            </div>
          </div>
        </div>

        {error && !selectedUnit && (
          <div className={`p-4 mb-6 rounded-md ${error.includes('저장되었습니다') || error.includes('해제되었습니다') || error.includes('변경되었습니다') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`text-sm ${error.includes('저장되었습니다') || error.includes('해제되었습니다') || error.includes('변경되었습니다') ? 'text-green-800' : 'text-red-800'}`}>{error}</p>
          </div>
        )}

        {/* 실외기 목록 테이블 */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {filteredUnits.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="mt-2 text-sm font-medium text-gray-900">조건에 맞는 실외기가 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">필터 조건을 변경해보세요.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      소재지
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      장비명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      위치
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      점검상태
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUnits.map((unit) => (
                    <tr
                      key={unit.id}
                      onClick={() => {
                        setSelectedUnit(unit);
                        fetchMaintenanceRecords(unit.id);
                      }}
                      className="hover:bg-blue-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {unit.factoryName || '미지정'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {unit.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {unit.location || '미지정'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(unit.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>행을 클릭하면 해당 설비의 보수 항목을 입력할 수 있습니다.</p>
        </div>
      </div>

      {/* 해제 모달 */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">보수 항목 해제</h3>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  완료 내역 및 비고사항 (선택사항)
                </label>
                <textarea
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="예: 팬모터 교체 완료, 냉매 보충으로 누출 문제 해결, 압축기 정상 작동 확인 등... (선택사항)"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                />
                <p className="mt-2 text-sm text-gray-600">
                  📝 자세한 해제 내역을 입력하시면 향후 이력 관리 및 패턴 분석에 도움이 됩니다.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleResolveModalClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  취소
                </button>
                <button
                  onClick={handleResolveSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '처리중...' : '완료 처리'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 문의사항 모달 */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">문의사항</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">부서</label>
                  <p className="mt-1 text-sm text-gray-900">청주설비기술1팀</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">담당자</label>
                  <p className="mt-1 text-sm text-gray-900">박제현 책임</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">이메일</label>
                  <p className="mt-1 text-sm text-blue-600">
                    <a href="mailto:jhpark24@lgchem.com">jhpark24@lgchem.com</a>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">연락처</label>
                  <p className="mt-1 text-sm text-gray-900">010-4753-3666</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowContactModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}