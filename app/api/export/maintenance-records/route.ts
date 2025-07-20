import { NextRequest, NextResponse } from 'next/server';
import { outdoorUnits, maintenanceRecords, initializeSampleData } from '../../../lib/data-store';

export async function GET(request: NextRequest) {
  try {
    // 데이터 초기화
    initializeSampleData();
    
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    
    if (format !== 'csv') {
      return NextResponse.json(
        { success: false, error: 'Only CSV format is supported' },
        { status: 400 }
      );
    }

    // CSV 헤더
    const headers = [
      '공장명',
      '설비명', 
      '제조사',
      '모델명',
      '시리얼번호',
      '용량(kW)',
      '설치위치',
      '현재상태',
      '보수항목',
      '보수유형',
      '보수일자',
      '작업자',
      '상태',
      '해제일자',
      '해제작업자',
      '비고'
    ];

    // CSV 데이터 생성
    const csvRows = [];
    csvRows.push(headers.join(','));

    // 각 실외기별로 보수 기록과 함께 처리
    for (const unit of outdoorUnits) {
      const factoryName = unit.name.includes('1공장') ? '1공장' : unit.name.includes('3공장') ? '3공장' : '공장';
      const statusLabel = unit.status === 'active' ? '정상가동' : 
                         unit.status === 'maintenance' ? '보수필요' : '비가동';
      
      const unitRecords = maintenanceRecords.filter(record => record.outdoorUnitId === unit.id);
      
      if (unitRecords.length === 0) {
        // 보수 기록이 없는 경우도 기본 설비 정보만 포함
        const row = [
          factoryName,
          unit.name,
          unit.manufacturer,
          unit.model,
          unit.serialNumber,
          unit.capacity.toString(),
          unit.location,
          statusLabel,
          '',  // 보수항목
          '',  // 보수유형
          '',  // 보수일자
          '',  // 작업자
          '',  // 상태
          '',  // 해제일자
          '',  // 해제작업자
          unit.notes || ''  // 비고
        ];
        csvRows.push(row.map(field => `"${field}"`).join(','));
      } else {
        // 보수 기록이 있는 경우 각 기록별로 행 생성
        for (const record of unitRecords) {
          const maintenanceTypeLabel = record.maintenanceType === 'preventive' ? '예방정비' :
                                      record.maintenanceType === 'corrective' ? '수리정비' : '긴급정비';
          const recordStatusLabel = record.isActive ? '진행중' : '완료';
          
          const row = [
            factoryName,
            unit.name,
            unit.manufacturer,
            unit.model,
            unit.serialNumber,
            unit.capacity.toString(),
            unit.location,
            statusLabel,
            record.description,
            maintenanceTypeLabel,
            record.maintenanceDate,
            record.performedBy,
            recordStatusLabel,
            record.resolvedDate || '',
            record.resolvedBy || '',
            record.notes || ''
          ];
          csvRows.push(row.map(field => `"${field}"`).join(','));
        }
      }
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