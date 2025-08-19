import { NextRequest, NextResponse } from 'next/server';
import { updateUnitStatus } from '../../../lib/data-store';
import { supabase } from '../../../lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    console.log('PUT maintenance record:', { id, body });
    
    // Supabase에서 레코드 조회
    const { data: existingRecord, error: fetchError } = await supabase
      .from('maintenance_records')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingRecord) {
      console.log('Maintenance record not found in Supabase:', id);
      return NextResponse.json(
        { success: false, error: 'Maintenance record not found' },
        { status: 404 }
      );
    }

    console.log('Found record in Supabase:', existingRecord);
    
    // 업데이트할 데이터 준비
    let updateData: Record<string, string | number | boolean> = {};
    
    // 보수 항목 해제 처리
    if ('isActive' in body && !body.isActive) {
      console.log('Resolving maintenance record');
      updateData = {
        is_active: false,
        resolved_date: new Date().toISOString().split('T')[0], // DATE 형식
        resolved_by: body.resolvedBy || 'LG Chem 현장작업자',
        resolved_notes: body.resolvedNotes || ''
      };
    } else {
      // 기타 업데이트 (필드명 변환)
      if (body.maintenanceDate) updateData.maintenance_date = body.maintenanceDate;
      if (body.maintenanceType) updateData.maintenance_type = body.maintenanceType;
      if (body.description) updateData.description = body.description;
      if (body.performedBy) updateData.performed_by = body.performedBy;
      if (body.status) updateData.status = body.status;
      if (body.nextMaintenanceDate) updateData.next_maintenance_date = body.nextMaintenanceDate;
      if (body.cost) updateData.cost = body.cost;
      if (body.notes) updateData.notes = body.notes;
    }

    // Supabase에서 업데이트
    const { data: updatedRecord, error: updateError } = await supabase
      .from('maintenance_records')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update maintenance record in database' },
        { status: 500 }
      );
    }

    // 응답 데이터를 기존 형식으로 변환
    const responseData = {
      id: updatedRecord.id,
      outdoorUnitId: updatedRecord.outdoor_unit_id,
      maintenanceDate: updatedRecord.maintenance_date,
      maintenanceType: updatedRecord.maintenance_type,
      description: updatedRecord.description,
      performedBy: updatedRecord.performed_by,
      status: updatedRecord.status,
      nextMaintenanceDate: updatedRecord.next_maintenance_date,
      cost: updatedRecord.cost,
      notes: updatedRecord.notes,
      isActive: updatedRecord.is_active,
      resolvedDate: updatedRecord.resolved_date,
      resolvedBy: updatedRecord.resolved_by,
      resolvedNotes: updatedRecord.resolved_notes,
      createdAt: updatedRecord.created_at,
      updatedAt: updatedRecord.updated_at
    };
    
    // 실외기 상태 업데이트 (로컬 데이터만)
    updateUnitStatus(updatedRecord.outdoor_unit_id);

    console.log('Returning success response');
    return NextResponse.json({
      success: true,
      data: responseData
    });

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
    
    // Supabase에서 레코드 삭제 전 조회
    const { data: existingRecord, error: fetchError } = await supabase
      .from('maintenance_records')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingRecord) {
      return NextResponse.json(
        { success: false, error: 'Maintenance record not found' },
        { status: 404 }
      );
    }

    // Supabase에서 삭제
    const { error: deleteError } = await supabase
      .from('maintenance_records')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Supabase delete error:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete maintenance record from database' },
        { status: 500 }
      );
    }

    // 응답 데이터를 기존 형식으로 변환
    const responseData = {
      id: existingRecord.id,
      outdoorUnitId: existingRecord.outdoor_unit_id,
      maintenanceDate: existingRecord.maintenance_date,
      maintenanceType: existingRecord.maintenance_type,
      description: existingRecord.description,
      performedBy: existingRecord.performed_by,
      status: existingRecord.status,
      nextMaintenanceDate: existingRecord.next_maintenance_date,
      cost: existingRecord.cost,
      notes: existingRecord.notes,
      isActive: existingRecord.is_active,
      resolvedDate: existingRecord.resolved_date,
      resolvedBy: existingRecord.resolved_by,
      resolvedNotes: existingRecord.resolved_notes,
      createdAt: existingRecord.created_at,
      updatedAt: existingRecord.updated_at
    };
    
    // 실외기 상태 업데이트 (로컬 데이터만)
    updateUnitStatus(existingRecord.outdoor_unit_id);

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error deleting maintenance record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete maintenance record' },
      { status: 500 }
    );
  }
}