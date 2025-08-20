import { NextRequest, NextResponse } from 'next/server';
import { CreateOutdoorUnitRequest } from '../../types/outdoor-unit';
import { fetchOutdoorUnits, addOutdoorUnit } from '../../lib/supabase-data-store';

export async function GET() {
  try {
    const outdoorUnits = await fetchOutdoorUnits();
    
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
    const requiredFields = ['name', 'installationDate', 'location', 'factoryName'];
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

    const newUnit = {
      ...body,
      status: 'active' as const,
      maintenanceRecords: []
    };

    // Supabase에 저장
    const createdUnit = await addOutdoorUnit(newUnit);

    return NextResponse.json({
      success: true,
      data: createdUnit
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating outdoor unit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create outdoor unit' },
      { status: 500 }
    );
  }
}