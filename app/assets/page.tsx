'use client';

import { useState, useEffect } from 'react';
import { OutdoorUnit, CreateOutdoorUnitInput } from '@/lib/types';
import { outdoorUnitStorage, createSampleData } from '@/lib/storage';
import OutdoorUnitForm from '@/components/OutdoorUnitForm';
import OutdoorUnitList from '@/components/OutdoorUnitList';

export default function AssetsPage() {
  const [units, setUnits] = useState<OutdoorUnit[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    createSampleData();
    loadUnits();
  }, []);

  const loadUnits = () => {
    let allUnits = outdoorUnitStorage.getAll();
    
    if (searchQuery) {
      allUnits = outdoorUnitStorage.search(searchQuery);
    }
    
    if (selectedStatus !== 'all') {
      allUnits = allUnits.filter(unit => unit.status === selectedStatus);
    }
    
    setUnits(allUnits);
  };

  useEffect(() => {
    loadUnits();
  }, [searchQuery, selectedStatus]);

  const handleAddUnit = (data: CreateOutdoorUnitInput) => {
    outdoorUnitStorage.create(data);
    setIsFormOpen(false);
    loadUnits();
  };

  const handleEditUnit = (unit: OutdoorUnit) => {
    console.log('편집할 실외기:', unit);
  };

  const handleDeleteUnit = (id: string) => {
    outdoorUnitStorage.delete(id);
    loadUnits();
  };

  const handleViewUnit = (unit: OutdoorUnit) => {
    console.log('상세보기:', unit);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">실외기 자산 관리</h1>
          <p className="mt-2 text-sm text-gray-600">실외기 정보를 등록하고 관리하세요.</p>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="실외기 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">전체 상태</option>
                  <option value="active">정상</option>
                  <option value="maintenance">점검중</option>
                  <option value="inactive">비활성</option>
                  <option value="error">오류</option>
                </select>
              </div>

              <button
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                새 실외기 등록
              </button>
            </div>
          </div>

          <div className="px-6 py-4">
            <OutdoorUnitList
              units={units}
              onEdit={handleEditUnit}
              onDelete={handleDeleteUnit}
              onView={handleViewUnit}
            />
          </div>
        </div>
      </div>

      <OutdoorUnitForm
        isOpen={isFormOpen}
        onSubmit={handleAddUnit}
        onCancel={() => setIsFormOpen(false)}
      />
    </div>
  );
}