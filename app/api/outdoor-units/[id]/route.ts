import { NextRequest, NextResponse } from 'next/server';
import { UpdateOutdoorUnitRequest } from '../../../types/outdoor-unit';
import { updateOutdoorUnit } from '../../../lib/supabase-data-store';
import { supabase } from '../../../lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { data: unit, error } = await supabase
      .from('outdoor_units')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !unit) {
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
    
    const updatedUnit = await updateOutdoorUnit(id, body);

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
    
    const { data: deletedUnit, error } = await supabase
      .from('outdoor_units')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Outdoor unit not found' },
        { status: 404 }
      );
    }

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