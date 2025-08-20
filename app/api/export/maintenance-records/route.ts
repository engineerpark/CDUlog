import { NextRequest, NextResponse } from 'next/server';
import { fetchOutdoorUnits, fetchMaintenanceRecords } from '../../../lib/supabase-data-store';

export async function GET(request: NextRequest) {
  try {
    // Supabase에서 데이터 로드
    const outdoorUnits = await fetchOutdoorUnits();
    const maintenanceRecords = await fetchMaintenanceRecords();
    
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    
    if (format !== 'csv') {
      return NextResponse.json(
        { success: false, error: 'Only CSV format is supported' },
        { status: 400 }
      );
    }

    // 날짜별로 보수 기록을 그룹화
    const maintenanceByDate: { [date: string]: { [unitName: string]: string[] } } = {};
    
    // 모든 보수 기록을 날짜별로 정리
    for (const record of maintenanceRecords) {
      const unit = outdoorUnits.find(u => u.id === record.outdoorUnitId);
      if (!unit) continue;
      
      const date = record.maintenanceDate;
      const unitName = `${unit.factoryName}_${unit.name}`;
      const maintenanceInfo = `${record.description} (${record.performedBy})`;
      
      if (!maintenanceByDate[date]) {
        maintenanceByDate[date] = {};
      }
      
      if (!maintenanceByDate[date][unitName]) {
        maintenanceByDate[date][unitName] = [];
      }
      
      maintenanceByDate[date][unitName].push(maintenanceInfo);
    }
    
    // 모든 장비명 수집 (소재지_장비명 형식)
    const allUnitNames = outdoorUnits.map(unit => `${unit.factoryName}_${unit.name}`);
    const uniqueUnitNames = [...new Set(allUnitNames)].sort();
    
    // CSV 헤더 생성 (날짜, 장비명들...)
    const headers = ['날짜', ...uniqueUnitNames];
    
    // CSV 데이터 생성
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    // 날짜별로 행 생성
    const sortedDates = Object.keys(maintenanceByDate).sort();
    
    for (const date of sortedDates) {
      const row = [date];
      
      // 각 장비명에 대해 해당 날짜의 보수 기록 확인
      for (const unitName of uniqueUnitNames) {
        const maintenanceInfos = maintenanceByDate[date][unitName] || [];
        const cellContent = maintenanceInfos.join('; ');
        row.push(cellContent);
      }
      
      csvRows.push(row.map(field => `"${field}"`).join(','));
    }

    const csvContent = csvRows.join('\n');
    const today = new Date().toISOString().split('T')[0];
    
    // CSV 파일 응답
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="maintenance-records-${today}.csv"`,
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Error generating CSV:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate CSV export' },
      { status: 500 }
    );
  }
}