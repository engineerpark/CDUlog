'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { OutdoorUnit, CreateMaintenanceRecordRequest } from '../types/outdoor-unit';

const PRESET_ISSUES = [
  { id: 'refrigerant_leak', label: '냉매 LEAK', description: '냉매 누출 발견' },
  { id: 'fan_motor_replacement', label: '팬모터 교체 필요', description: '팬모터 교체가 필요한 상태' },
  { id: 'compressor_replacement', label: '압축기 교체 필요', description: '압축기 교체가 필요한 상태' }
];

export default function AssetsPage() {
  const [outdoorUnits, setOutdoorUnits] = useState<OutdoorUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchOutdoorUnits();
  }, []);

  const fetchOutdoorUnits = async () => {
    try {
      const response = await fetch('/api/outdoor-units');
      const result = await response.json();
      
      if (result.success) {
        setOutdoorUnits(result.data);
      } else {
        setError('Failed to fetch outdoor units');
      }
    } catch {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaintenanceRecord = async (unitId: string, description: string) => {
    setIsSubmitting(true);
    
    const today = new Date().toISOString().split('T')[0];
    const maintenanceData: CreateMaintenanceRecordRequest = {
      outdoorUnitId: unitId,
      maintenanceDate: today,
      maintenanceType: 'corrective',
      description: description,
      performedBy: '현장작업자',
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
        // 성공 시 실외기 목록 새로고침
        await fetchOutdoorUnits();
        setSelectedUnit(null);
        setShowCustomInput(null);
        setCustomInput('');
      } else {
        setError('유지보수 기록 저장에 실패했습니다');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePresetIssue = (unitId: string, issue: typeof PRESET_ISSUES[0]) => {
    handleMaintenanceRecord(unitId, issue.description);
  };

  const handleCustomIssue = (unitId: string) => {
    if (customInput.trim()) {
      handleMaintenanceRecord(unitId, customInput.trim());
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: '정상', className: 'bg-green-100 text-green-800' },
      maintenance: { label: '점검중', className: 'bg-yellow-100 text-yellow-800' },
      inactive: { label: '비가동', className: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getFactoryName = (unitName: string) => {
    if (unitName.includes('1공장')) return '1공장';
    if (unitName.includes('3공장')) return '3공장';
    return '공장';
  };

  if (isLoading) {
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">실외기 관리</h1>
          <Link
            href="/assets/add"
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            + 새 실외기 등록
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">오류가 발생했습니다</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {outdoorUnits.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="mt-2 text-sm font-medium text-gray-900">등록된 실외기가 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">새 실외기를 등록하여 관리를 시작하세요.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      공장명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      설비명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      용량 (kW)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      점검상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태 입력
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {outdoorUnits.map((unit) => (
                    <tr key={unit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getFactoryName(unit.name)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {unit.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {unit.capacity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(unit.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {selectedUnit === unit.id ? (
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2 mb-2">
                              {PRESET_ISSUES.map((issue) => (
                                <button
                                  key={issue.id}
                                  onClick={() => handlePresetIssue(unit.id, issue)}
                                  disabled={isSubmitting}
                                  className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {issue.label}
                                </button>
                              ))}
                              <button
                                onClick={() => setShowCustomInput(unit.id)}
                                disabled={isSubmitting}
                                className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50"
                              >
                                + 직접입력
                              </button>
                            </div>
                            
                            {showCustomInput === unit.id && (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={customInput}
                                  onChange={(e) => setCustomInput(e.target.value)}
                                  placeholder="문제 상황을 입력하세요"
                                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                                  disabled={isSubmitting}
                                />
                                <button
                                  onClick={() => handleCustomIssue(unit.id)}
                                  disabled={isSubmitting || !customInput.trim()}
                                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                  저장
                                </button>
                                <button
                                  onClick={() => {
                                    setShowCustomInput(null);
                                    setCustomInput('');
                                  }}
                                  disabled={isSubmitting}
                                  className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
                                >
                                  취소
                                </button>
                              </div>
                            )}
                            
                            <button
                              onClick={() => setSelectedUnit(null)}
                              disabled={isSubmitting}
                              className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
                            >
                              닫기
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedUnit(unit.id)}
                            className="px-3 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 hover:bg-blue-200"
                          >
                            상태 입력
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}