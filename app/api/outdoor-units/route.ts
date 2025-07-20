import { NextRequest, NextResponse } from 'next/server';
import { CreateOutdoorUnitRequest } from '../../types/outdoor-unit';
import { outdoorUnits, initializeSampleData, getNextUnitId } from '../../lib/data-store';

export async function GET() {
  try {
    // 첫 번째 요청 시 샘플 데이터 초기화
    initializeSampleData();
    
    return NextResponse.json({
      success: true,
      data: outdoorUnits
    });
  } catch (error) {
    console.error('Error fetching outdoor units:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch outdoor units' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateOutdoorUnitRequest = await request.json();
    
    // 유효성 검사
    const requiredFields = ['name', 'model', 'manufacturer', 'serialNumber', 'installationDate', 'location', 'capacity'];
    const missingFields = requiredFields.filter(field => !body[field as keyof CreateOutdoorUnitRequest]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // 시리얼 번호 중복 검사
    const existingUnit = outdoorUnits.find(unit => unit.serialNumber === body.serialNumber);
    if (existingUnit) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Serial number already exists' 
        },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const newUnit = {
      id: getNextUnitId().toString(),
      ...body,
      maintenanceRecords: [],
      createdAt: now,
      updatedAt: now
    };

    outdoorUnits.push(newUnit);

    return NextResponse.json({
      success: true,
      data: newUnit
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating outdoor unit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create outdoor unit' },
      { status: 500 }
    );
  }
}