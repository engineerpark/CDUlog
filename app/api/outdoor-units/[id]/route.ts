import { NextRequest, NextResponse } from 'next/server';
import { UpdateOutdoorUnitRequest } from '../../../types/outdoor-unit';
import { outdoorUnits, initializeSampleData } from '../../../lib/data-store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 데이터 초기화
    initializeSampleData();
    
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
    // 데이터 초기화
    initializeSampleData();
    
    const { id } = await params;
    const body: UpdateOutdoorUnitRequest = await request.json();
    const unitIndex = outdoorUnits.findIndex(unit => unit.id === id);
    
    if (unitIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Outdoor unit not found' },
        { status: 404 }
      );
    }


    const updatedUnit = {
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
    // 데이터 초기화
    initializeSampleData();
    
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