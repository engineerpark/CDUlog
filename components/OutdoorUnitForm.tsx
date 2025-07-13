'use client';

import { useState } from 'react';
import { CreateOutdoorUnitInput } from '@/lib/types';

interface OutdoorUnitFormProps {
  onSubmit: (data: CreateOutdoorUnitInput) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export default function OutdoorUnitForm({ onSubmit, onCancel, isOpen }: OutdoorUnitFormProps) {
  const [formData, setFormData] = useState<CreateOutdoorUnitInput>({
    name: '',
    model: '',
    manufacturer: '',
    serialNumber: '',
    installationDate: '',
    location: {
      building: '',
      floor: '',
      room: '',
    },
    specifications: {
      capacity: '',
      refrigerant: '',
      powerConsumption: '',
      voltage: '',
    },
    warranty: {
      startDate: '',
      endDate: '',
      provider: '',
    },
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // 폼 초기화
    setFormData({
      name: '',
      model: '',
      manufacturer: '',
      serialNumber: '',
      installationDate: '',
      location: {
        building: '',
        floor: '',
        room: '',
      },
      specifications: {
        capacity: '',
        refrigerant: '',
        powerConsumption: '',
        voltage: '',
      },
      warranty: {
        startDate: '',
        endDate: '',
        provider: '',
      },
      notes: '',
    });
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof CreateOutdoorUnitInput],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">새 실외기 등록</h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  실외기 명칭 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: A동 로비 실외기"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  모델명 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: RAC-SM1400DX2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제조사 *
                </label>
                <select
                  required
                  value={formData.manufacturer}
                  onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">제조사 선택</option>
                  <option value="삼성전자">삼성전자</option>
                  <option value="LG전자">LG전자</option>
                  <option value="다이킨">다이킨</option>
                  <option value="캐리어">캐리어</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  시리얼 번호 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.serialNumber}
                  onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: SM202301001"
                />
              </div>
            </div>

            {/* 설치 정보 */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">설치 위치</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    건물 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location.building}
                    onChange={(e) => handleInputChange('location.building', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: A동"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    층 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location.floor}
                    onChange={(e) => handleInputChange('location.floor', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 1층"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    호실/위치 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location.room}
                    onChange={(e) => handleInputChange('location.room', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 로비"
                  />
                </div>
              </div>
            </div>

            {/* 사양 정보 */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">기기 사양</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    냉방 용량 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.specifications.capacity}
                    onChange={(e) => handleInputChange('specifications.capacity', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 14kW"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    냉매 타입 *
                  </label>
                  <select
                    required
                    value={formData.specifications.refrigerant}
                    onChange={(e) => handleInputChange('specifications.refrigerant', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">냉매 선택</option>
                    <option value="R410A">R410A</option>
                    <option value="R32">R32</option>
                    <option value="R22">R22</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    소비전력 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.specifications.powerConsumption}
                    onChange={(e) => handleInputChange('specifications.powerConsumption', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 4.2kW"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    전압 *
                  </label>
                  <select
                    required
                    value={formData.specifications.voltage}
                    onChange={(e) => handleInputChange('specifications.voltage', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">전압 선택</option>
                    <option value="220V">220V</option>
                    <option value="380V">380V</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 날짜 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설치일 *
                </label>
                <input
                  type="date"
                  required
                  value={formData.installationDate}
                  onChange={(e) => handleInputChange('installationDate', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 보증 정보 */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">보증 정보</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    보증 시작일 *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.warranty.startDate}
                    onChange={(e) => handleInputChange('warranty.startDate', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    보증 종료일 *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.warranty.endDate}
                    onChange={(e) => handleInputChange('warranty.endDate', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    보증 제공업체 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.warranty.provider}
                    onChange={(e) => handleInputChange('warranty.provider', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 삼성전자서비스"
                  />
                </div>
              </div>
            </div>

            {/* 비고 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비고
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="추가 정보나 특이사항을 입력하세요"
              />
            </div>

            {/* 버튼 */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                등록
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}