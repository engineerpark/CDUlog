import { NextRequest, NextResponse } from 'next/server';
import { OutdoorUnit, CreateOutdoorUnitRequest } from '../../types/outdoor-unit';

// 임시 데이터 저장소 (실제 프로덕션에서는 데이터베이스 사용)
let outdoorUnits: OutdoorUnit[] = [];
let nextId = 1;

export async function GET() {
  try {
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
    const newUnit: OutdoorUnit = {
      id: nextId.toString(),
      ...body,
      createdAt: now,
      updatedAt: now
    };

    outdoorUnits.push(newUnit);
    nextId++;

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