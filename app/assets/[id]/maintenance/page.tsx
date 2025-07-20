'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { OutdoorUnit, CreateMaintenanceRecordRequest } from '../../../types/outdoor-unit';

export default function AddMaintenancePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [unit, setUnit] = useState<OutdoorUnit | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUnit, setIsLoadingUnit] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unitId, setUnitId] = useState<string>('');
  
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState<CreateMaintenanceRecordRequest>({
    outdoorUnitId: '',
    maintenanceDate: today,
    maintenanceType: 'preventive',
    description: '',
    performedBy: '',
    status: 'completed',
    nextMaintenanceDate: '',
    cost: 0,
    notes: ''
  });

  useEffect(() => {
    const resolveParams = async () => {
      const { id } = await params;
      setUnitId(id);
      setFormData(prev => ({ ...prev, outdoorUnitId: id }));
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
        setIsLoadingUnit(false);
      }
    };

    if (unitId) {
      fetchOutdoorUnit();
    }
  }, [unitId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cost' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/maintenance-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push(`/assets/${unitId}`);
      } else {
        console.error('Failed to create maintenance record');
        setError('유지보수 기록 저장에 실패했습니다');
      }
    } catch (error) {
      console.error('Error creating maintenance record:', error);
      setError('네트워크 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingUnit) {
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

  if (error && !unit) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="mt-2 text-sm font-medium text-gray-900">오류 발생</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <Link href="/assets" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">유지보수 기록 추가</h1>
                {unit && (
                  <p className="mt-1 text-sm text-gray-600">대상 실외기: {unit.name}</p>
                )}
              </div>
              <Link
                href={`/assets/${unitId}`}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Link>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="maintenanceDate" className="block text-sm font-medium text-gray-700">
                    보수 일자 *
                  </label>
                  <input
                    type="date"
                    name="maintenanceDate"
                    id="maintenanceDate"
                    required
                    value={formData.maintenanceDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="maintenanceType" className="block text-sm font-medium text-gray-700">
                    보수 유형 *
                  </label>
                  <select
                    name="maintenanceType"
                    id="maintenanceType"
                    required
                    value={formData.maintenanceType}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="preventive">예방보전</option>
                    <option value="corrective">수정보전</option>
                    <option value="emergency">긴급보전</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="performedBy" className="block text-sm font-medium text-gray-700">
                    담당자 *
                  </label>
                  <input
                    type="text"
                    name="performedBy"
                    id="performedBy"
                    required
                    value={formData.performedBy}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="담당자 이름을 입력하세요"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    상태 *
                  </label>
                  <select
                    name="status"
                    id="status"
                    required
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="completed">완료</option>
                    <option value="in_progress">진행 중</option>
                    <option value="scheduled">예정</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="nextMaintenanceDate" className="block text-sm font-medium text-gray-700">
                    다음 점검 예정일
                  </label>
                  <input
                    type="date"
                    name="nextMaintenanceDate"
                    id="nextMaintenanceDate"
                    value={formData.nextMaintenanceDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="cost" className="block text-sm font-medium text-gray-700">
                    비용 (원)
                  </label>
                  <input
                    type="number"
                    name="cost"
                    id="cost"
                    min="0"
                    step="1000"
                    value={formData.cost}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  작업 내용 *
                </label>
                <input
                  type="text"
                  name="description"
                  id="description"
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="수행한 작업 내용을 간단히 입력하세요"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  상세 내용 및 비고
                </label>
                <textarea
                  name="notes"
                  id="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="작업 상세 내용, 발견된 문제점, 교체 부품 등을 입력하세요"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Link
                  href={`/assets/${unitId}`}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  취소
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? '저장 중...' : '기록 저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}