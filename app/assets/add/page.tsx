'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreateOutdoorUnitRequest } from '../../types/outdoor-unit';

export default function AddOutdoorUnitPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateOutdoorUnitRequest>({
    name: '',
    installationDate: '',
    location: '',
    factoryName: '',
    status: 'active',
    lastMaintenanceDate: '',
    nextMaintenanceDate: '',
    notes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/outdoor-units', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/assets');
      } else {
        console.error('Failed to create outdoor unit');
        // TODO: Add proper error handling
      }
    } catch (error) {
      console.error('Error creating outdoor unit:', error);
      // TODO: Add proper error handling
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">새 장비 등록</h1>
              <Link
                href="/assets"
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    장비명 *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="예: AHU-H1-1호-CDU1"
                  />
                </div>


                <div>
                  <label htmlFor="factoryName" className="block text-sm font-medium text-gray-700">
                    소재지 *
                  </label>
                  <select
                    name="factoryName"
                    id="factoryName"
                    required
                    value={formData.factoryName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">소재지를 선택하세요</option>
                    <option value="전자소재3공장">전자소재3공장</option>
                    <option value="전자소재6공장">전자소재6공장</option>
                    <option value="전자소재7공장">전자소재7공장</option>
                    <option value="전자소재8공장">전자소재8공장</option>
                    <option value="전자소재9공장">전자소재9공장</option>
                    <option value="부설연구소">부설연구소</option>
                  </select>
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
                    <option value="active">정상 운영</option>
                    <option value="maintenance">점검 중</option>
                    <option value="inactive">비가동</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="installationDate" className="block text-sm font-medium text-gray-700">
                    설치 일자 *
                  </label>
                  <input
                    type="date"
                    name="installationDate"
                    id="installationDate"
                    required
                    value={formData.installationDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="lastMaintenanceDate" className="block text-sm font-medium text-gray-700">
                    최근 점검 일자
                  </label>
                  <input
                    type="date"
                    name="lastMaintenanceDate"
                    id="lastMaintenanceDate"
                    value={formData.lastMaintenanceDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
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
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  위치
                </label>
                <input
                  type="text"
                  name="location"
                  id="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="예: H1, 옥외, 4층 옥상"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  비고
                </label>
                <textarea
                  name="notes"
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="추가 정보나 특이사항을 입력하세요"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Link
                  href="/assets"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  취소
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? '등록 중...' : '장비 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}