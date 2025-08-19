import { NextRequest, NextResponse } from 'next/server';
import { CreateMaintenanceRecordRequest } from '../../types/outdoor-unit';
import { updateUnitStatus } from '../../lib/data-store';
import { supabase } from '../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const outdoorUnitId = searchParams.get('outdoorUnitId');
    
    // Supabase에서 점검 이력 조회
    let query = supabase
      .from('maintenance_records')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (outdoorUnitId) {
      query = query.eq('outdoor_unit_id', outdoorUnitId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch maintenance records from database' },
        { status: 500 }
      );
    }
    
    // Supabase 데이터를 기존 형식으로 변환
    const transformedData = data?.map(record => ({
      id: record.id,
      outdoorUnitId: record.outdoor_unit_id,
      maintenanceDate: record.maintenance_date,
      maintenanceType: record.maintenance_type,
      description: record.description,
      performedBy: record.performed_by,
      status: record.status,
      nextMaintenanceDate: record.next_maintenance_date,
      cost: record.cost,
      notes: record.notes,
      isActive: record.is_active,
      resolvedDate: record.resolved_date,
      resolvedBy: record.resolved_by,
      resolvedNotes: record.resolved_notes,
      createdAt: record.created_at,
      updatedAt: record.updated_at
    })) || [];
    
    return NextResponse.json({
      success: true,
      data: transformedData
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

    // Supabase 형식으로 데이터 변환 (새로운 스키마)
    const supabaseRecord = {
      outdoor_unit_id: body.outdoorUnitId,
      maintenance_date: body.maintenanceDate,
      maintenance_type: body.maintenanceType,
      description: body.description,
      performed_by: body.performedBy,
      status: body.status,
      next_maintenance_date: body.nextMaintenanceDate || null,
      cost: body.cost || null,
      notes: body.notes || '',
      is_active: true
    };

    // Supabase에 저장 (디버그 로깅 추가)
    console.log('Attempting to insert record:', supabaseRecord);
    const { data, error } = await supabase
      .from('maintenance_records')
      .insert(supabaseRecord)
      .select()
      .single();

    console.log('Supabase response:', { data, error });

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { success: false, error: `Failed to save to database: ${error.message}` },
        { status: 500 }
      );
    }

    // 응답 데이터를 기존 형식으로 변환
    const responseData = {
      id: data.id,
      outdoorUnitId: data.outdoor_unit_id,
      maintenanceDate: data.maintenance_date,
      maintenanceType: data.maintenance_type,
      description: data.description,
      performedBy: data.performed_by,
      status: data.status,
      nextMaintenanceDate: data.next_maintenance_date,
      cost: data.cost,
      notes: data.notes,
      isActive: data.is_active,
      resolvedDate: data.resolved_date,
      resolvedBy: data.resolved_by,
      resolvedNotes: data.resolved_notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    // 실외기 상태 업데이트 (로컬 데이터만)
    updateUnitStatus(body.outdoorUnitId);

    return NextResponse.json({
      success: true,
      data: responseData
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating maintenance record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create maintenance record' },
      { status: 500 }
    );
  }
}