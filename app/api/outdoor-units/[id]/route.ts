import { NextRequest, NextResponse } from 'next/server';
import { OutdoorUnit, UpdateOutdoorUnitRequest } from '../../../types/outdoor-unit';

// 임시 데이터 저장소 - 실제로는 데이터베이스에서 가져와야 함
// 이 부분은 실제 데이터베이스 연결 시 수정 필요
const outdoorUnits: OutdoorUnit[] = [];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const unit = outdoorUnits.find(unit => unit.id === id);
    
    if (!unit) {
      return NextResponse.json(
        { success: false, error: 'Outdoor unit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: unit
    });
  } catch (error) {
    console.error('Error fetching outdoor unit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch outdoor unit' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateOutdoorUnitRequest = await request.json();
    const unitIndex = outdoorUnits.findIndex(unit => unit.id === id);
    
    if (unitIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Outdoor unit not found' },
        { status: 404 }
      );
    }

    // 시리얼 번호 중복 검사 (자신 제외)
    if (body.serialNumber) {
      const existingUnit = outdoorUnits.find(
        unit => unit.serialNumber === body.serialNumber && unit.id !== id
      );
      if (existingUnit) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Serial number already exists' 
          },
          { status: 409 }
        );
      }
    }

    const updatedUnit: OutdoorUnit = {
      ...outdoorUnits[unitIndex],
      ...body,
      id: id, // ID는 변경되지 않도록
      updatedAt: new Date().toISOString()
    };

    outdoorUnits[unitIndex] = updatedUnit;

    return NextResponse.json({
      success: true,
      data: updatedUnit
    });

  } catch (error) {
    console.error('Error updating outdoor unit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update outdoor unit' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const unitIndex = outdoorUnits.findIndex(unit => unit.id === id);
    
    if (unitIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Outdoor unit not found' },
        { status: 404 }
      );
    }

    const deletedUnit = outdoorUnits.splice(unitIndex, 1)[0];

    return NextResponse.json({
      success: true,
      data: deletedUnit
    });

  } catch (error) {
    console.error('Error deleting outdoor unit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete outdoor unit' },
      { status: 500 }
    );
  }
}