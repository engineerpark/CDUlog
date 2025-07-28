import { NextResponse } from 'next/server';
import { maintenanceRecords, outdoorUnits, loadFromLocalStorage } from '../../../lib/data-store';

export async function GET() {
  try {
    // 로컬스토리지에서 데이터 로드
    loadFromLocalStorage();
    
    // 해제된 모든 보수 기록을 최신순으로 정렬
    const resolvedRecords = maintenanceRecords
      .filter(record => !record.isActive)
      .sort((a, b) => {
        const dateA = new Date(a.resolvedDate || a.updatedAt).getTime();
        const dateB = new Date(b.resolvedDate || b.updatedAt).getTime();
        return dateB - dateA;
      })
      .map(record => {
        // 해당 실외기 정보도 함께 포함
        const unit = outdoorUnits.find(u => u.id === record.outdoorUnitId);
        return {
          ...record,
          unit: unit ? {
            id: unit.id,
            name: unit.name,
            factoryName: unit.factoryName,
            location: unit.location
          } : null
        };
      });
    
    return NextResponse.json({
      success: true,
      data: resolvedRecords
    });
  } catch (error) {
    console.error('Error getting all resolved maintenance records:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get all resolved maintenance records'
    }, { status: 500 });
  }
}