import { NextRequest, NextResponse } from 'next/server';
import { updateMaintenanceRecord } from '../../../lib/supabase-data-store';
import { supabase } from '../../../lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    console.log('PUT maintenance record:', { id, body });
    
    // 보수 항목 해제 처리
    if ('isActive' in body && !body.isActive) {
      console.log('Resolving maintenance record');
      const updates = {
        isActive: false,
        resolvedDate: new Date().toISOString().split('T')[0],
        resolvedBy: body.resolvedBy || 'LG Chem 현장작업자',
        resolvedNotes: body.resolvedNotes || '기본 해제'
      };
      
      const updatedRecord = await updateMaintenanceRecord(id, updates);
      
      console.log('Updated record with Supabase');
      return NextResponse.json({
        success: true,
        data: updatedRecord
      });
    } else {
      // 기타 업데이트
      const updatedRecord = await updateMaintenanceRecord(id, body);
      return NextResponse.json({
        success: true,
        data: updatedRecord
      });
    }

  } catch (error) {
    console.error('Error updating maintenance record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update maintenance record' },
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
    
    // Supabase에서 삭제
    const { data, error } = await supabase
      .from('maintenance_records')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting maintenance record:', error);
      return NextResponse.json(
        { success: false, error: 'Maintenance record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Error deleting maintenance record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete maintenance record' },
      { status: 500 }
    );
  }
}