import { NextRequest, NextResponse } from 'next/server';
import { maintenanceRecords, updateMaintenanceRecord, loadFromLocalStorage, updateUnitStatus, saveToLocalStorage } from '../../../lib/github-data-store';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 로컬스토리지에서 데이터 로드
    loadFromLocalStorage();
    
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
      const updates = {
        isActive: false,
        resolvedDate: now,
        resolvedBy: body.resolvedBy || 'LG Chem 현장작업자',
        resolvedNotes: body.resolvedNotes || ''
      };
      
      // 새로운 업데이트 함수 사용 (자동으로 로컬스토리지에 저장됨)
      updateMaintenanceRecord(id, updates);
      
      console.log('Updated record with new function');
    } else {
      // 기타 업데이트
      updateMaintenanceRecord(id, body);
    }

    const updatedRecord = maintenanceRecords.find(r => r.id === id);
    console.log('Returning success response');
    return NextResponse.json({
      success: true,
      data: updatedRecord
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
    // 로컬스토리지에서 데이터 로드
    loadFromLocalStorage();
    
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
    
    // 로컬스토리지에 저장
    saveToLocalStorage();

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