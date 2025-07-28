import { NextResponse } from 'next/server';
import { getLatestMaintenanceRecord, loadFromLocalStorage } from '../../../lib/data-store';

export async function GET() {
  try {
    // 로컬스토리지에서 데이터 로드
    loadFromLocalStorage();
    
    const latestInfo = getLatestMaintenanceRecord();
    
    return NextResponse.json({
      success: true,
      data: latestInfo
    });
  } catch (error) {
    console.error('Error getting latest maintenance record:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get latest maintenance record'
    }, { status: 500 });
  }
}