'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { OutdoorUnit } from '../../types/outdoor-unit';

export default function OutdoorUnitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [unit, setUnit] = useState<OutdoorUnit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unitId, setUnitId] = useState<string>('');

  useEffect(() => {
    const resolveParams = async () => {
      const { id } = await params;
      setUnitId(id);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    const fetchOutdoorUnit = async () => {
      try {
        const response = await fetch(`/api/outdoor-units/${unitId}`);
        const result = await response.json();
        
        if (result.success) {
          setUnit(result.data);
        } else {
          setError('실외기를 찾을 수 없습니다');
        }
      } catch {
        setError('네트워크 오류가 발생했습니다');
      } finally {
        setIsLoading(false);
      }
    };

    if (unitId) {
      fetchOutdoorUnit();
    }
  }, [unitId]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: '정상 운영', className: 'bg-green-100 text-green-800' },
      maintenance: { label: '점검 중', className: 'bg-yellow-100 text-yellow-800' },
      inactive: { label: '비가동', className: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getMaintenanceTypeBadge = (type: string) => {
    const typeConfig = {
      preventive: { label: '예방보전', className: 'bg-blue-100 text-blue-800' },
      corrective: { label: '수정보전', className: 'bg-orange-100 text-orange-800' },
      emergency: { label: '긴급보전', className: 'bg-red-100 text-red-800' }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.preventive;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">실외기 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">오류 발생</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <Link
                href="/assets"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                목록으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Link
              href="/assets"
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{unit.name}</h1>
            {getStatusBadge(unit.status)}
          </div>
          <Link
            href={`/assets/${unitId}/maintenance`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            + 유지보수 기록 추가
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 기본 정보 */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">기본 정보</h3>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">제조사</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{unit.manufacturer}</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">모델명</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{unit.model}</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">시리얼 번호</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{unit.serialNumber}</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">설치 위치</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{unit.location}</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">냉방 용량</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{unit.capacity} kW</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">설치 일자</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {new Date(unit.installationDate).toLocaleDateString('ko-KR')}
                    </dd>
                  </div>
                  {unit.notes && (
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">비고</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{unit.notes}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>

          {/* 유지보수 정보 */}
          <div>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">유지보수 정보</h3>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  {unit.lastMaintenanceDate && (
                    <div className="bg-gray-50 px-4 py-5">
                      <dt className="text-sm font-medium text-gray-500">최근 점검일</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(unit.lastMaintenanceDate).toLocaleDateString('ko-KR')}
                      </dd>
                    </div>
                  )}
                  {unit.nextMaintenanceDate && (
                    <div className="bg-white px-4 py-5">
                      <dt className="text-sm font-medium text-gray-500">다음 점검 예정일</dt>
                      <dd className="mt-1 text-sm text-orange-600">
                        {new Date(unit.nextMaintenanceDate).toLocaleDateString('ko-KR')}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* 유지보수 이력 */}
        <div className="mt-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">유지보수 이력</h3>
            </div>
            <div className="border-t border-gray-200">
              {(!unit.maintenanceRecords || unit.maintenanceRecords.length === 0) ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">유지보수 이력이 없습니다</h3>
                  <p className="mt-1 text-sm text-gray-500">첫 번째 유지보수 기록을 추가해보세요.</p>
                  <div className="mt-6">
                    <Link
                      href={`/assets/${unitId}/maintenance`}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      + 유지보수 기록 추가
                    </Link>
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {unit.maintenanceRecords.map((record) => (
                    <li key={record.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                              <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900">{record.description}</p>
                              {getMaintenanceTypeBadge(record.maintenanceType)}
                            </div>
                            <p className="text-xs text-gray-500">담당자: {record.performedBy}</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(record.maintenanceDate).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                      {record.notes && (
                        <div className="mt-2 ml-11">
                          <p className="text-sm text-gray-600">{record.notes}</p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}