import { NextRequest, NextResponse } from 'next/server';
import { maintenanceRecords, updateUnitStatus } from '../../../lib/data-store';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    console.log('PUT maintenance record:', { id, body });
    
    const recordIndex = maintenanceRecords.findIndex(record => record.id === id);
    
    if (recordIndex === -1) {
      console.log('Maintenance record not found:', id);
      return NextResponse.json(
        { success: false, error: 'Maintenance record not found' },
        { status: 404 }
      );
    }

    const record = maintenanceRecords[recordIndex];
    const now = new Date().toISOString();
    
    console.log('Found record:', record);
    
    // 보수 항목 해제 처리
    if ('isActive' in body && !body.isActive) {
      console.log('Resolving maintenance record');
      record.isActive = false;
      record.resolvedDate = now;
      record.resolvedBy = body.resolvedBy || 'LG Chem 현장작업자';
      record.resolvedNotes = body.resolvedNotes || '';
      record.updatedAt = now;
      
      console.log('Updated record:', record);
      
      // 실외기 상태 업데이트
      updateUnitStatus(record.outdoorUnitId);
    } else {
      // 기타 업데이트
      Object.assign(record, body, { updatedAt: now });
    }

    console.log('Returning success response');
    return NextResponse.json({
      success: true,
      data: record
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
    const recordIndex = maintenanceRecords.findIndex(record => record.id === id);
    
    if (recordIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Maintenance record not found' },
        { status: 404 }
      );
    }

    const deletedRecord = maintenanceRecords.splice(recordIndex, 1)[0];
    
    // 실외기 상태 업데이트
    updateUnitStatus(deletedRecord.outdoorUnitId);

    return NextResponse.json({
      success: true,
      data: deletedRecord
    });

  } catch (error) {
    console.error('Error deleting maintenance record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete maintenance record' },
      { status: 500 }
    );
  }
}