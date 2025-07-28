import { NextRequest, NextResponse } from 'next/server';
import { CreateMaintenanceRecordRequest } from '../../types/outdoor-unit';
import { maintenanceRecords, getNextMaintenanceId, addMaintenanceRecord, loadFromLocalStorage } from '../../lib/github-data-store';

export async function GET(request: NextRequest) {
  try {
    // 로컬스토리지에서 데이터 로드
    loadFromLocalStorage();
    
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
    const newRecord = {
      id: getNextMaintenanceId().toString(),
      ...body,
      isActive: true,
      createdAt: now,
      updatedAt: now
    };

    // 새로운 함수 사용 (자동으로 로컬스토리지에 저장됨)
    addMaintenanceRecord(newRecord);

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