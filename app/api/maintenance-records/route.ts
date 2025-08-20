import { NextRequest, NextResponse } from 'next/server';
import { CreateMaintenanceRecordRequest } from '../../types/outdoor-unit';
import { fetchMaintenanceRecords, addMaintenanceRecord } from '../../lib/supabase-data-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const outdoorUnitId = searchParams.get('outdoorUnitId');
    
    const records = await fetchMaintenanceRecords(outdoorUnitId || undefined);
    
    return NextResponse.json({
      success: true,
      data: records
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

    const newRecord = {
      ...body,
      isActive: true
    };

    // Supabase에 저장
    const createdRecord = await addMaintenanceRecord(newRecord);

    return NextResponse.json({
      success: true,
      data: createdRecord
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating maintenance record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create maintenance record' },
      { status: 500 }
    );
  }
}