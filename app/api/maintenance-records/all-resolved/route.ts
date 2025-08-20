import { NextResponse } from 'next/server';
import { fetchMaintenanceRecords, fetchOutdoorUnits } from '../../../lib/supabase-data-store';

export async function GET() {
  try {
    // Supabase에서 데이터 로드
    const allRecords = await fetchMaintenanceRecords();
    const allUnits = await fetchOutdoorUnits();
    
    // 해제된 모든 보수 기록을 최신순으로 정렬
    const resolvedRecords = allRecords
      .filter(record => !record.isActive)
      .sort((a, b) => {
        const dateA = new Date(a.resolvedDate || a.updatedAt).getTime();
        const dateB = new Date(b.resolvedDate || b.updatedAt).getTime();
        return dateB - dateA;
      })
      .map(record => {
        // 해당 실외기 정보도 함께 포함
        const unit = allUnits.find(u => u.id === record.outdoorUnitId);
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