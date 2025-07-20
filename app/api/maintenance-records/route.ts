import { NextRequest, NextResponse } from 'next/server';
import { MaintenanceRecord, CreateMaintenanceRecordRequest } from '../../types/outdoor-unit';

// 임시 데이터 저장소 (실제 프로덕션에서는 데이터베이스 사용)
let maintenanceRecords: MaintenanceRecord[] = [];
let nextMaintenanceId = 1;

// 실외기 데이터에 접근하기 위한 임포트 (실제로는 공유 데이터베이스 사용)
import outdoorUnitsModule from '../outdoor-units/route';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const outdoorUnitId = searchParams.get('outdoorUnitId');
    
    let filteredRecords = maintenanceRecords;
    if (outdoorUnitId) {
      filteredRecords = maintenanceRecords.filter(record => record.outdoorUnitId === outdoorUnitId);
    }
    
    return NextResponse.json({
      success: true,
      data: filteredRecords
    });
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch maintenance records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateMaintenanceRecordRequest = await request.json();
    
    // 유효성 검사
    const requiredFields = ['outdoorUnitId', 'maintenanceDate', 'maintenanceType', 'description', 'performedBy', 'status'];
    const missingFields = requiredFields.filter(field => !body[field as keyof CreateMaintenanceRecordRequest]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newRecord: MaintenanceRecord = {
      id: nextMaintenanceId.toString(),
      ...body,
      createdAt: now,
      updatedAt: now
    };

    maintenanceRecords.push(newRecord);
    nextMaintenanceId++;

    // 실외기의 최근 점검일과 다음 점검 예정일 업데이트
    // 실제 구현에서는 데이터베이스 트랜잭션으로 처리
    try {
      const updateResponse = await fetch(`${request.nextUrl.origin}/api/outdoor-units/${body.outdoorUnitId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: body.outdoorUnitId,
          lastMaintenanceDate: body.maintenanceDate,
          nextMaintenanceDate: body.nextMaintenanceDate
        }),
      });
    } catch (updateError) {
      console.warn('Failed to update outdoor unit maintenance dates:', updateError);
    }

    return NextResponse.json({
      success: true,
      data: newRecord
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating maintenance record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create maintenance record' },
      { status: 500 }
    );
  }
}