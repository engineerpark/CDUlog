import { NextResponse } from 'next/server';
import { getLatestMaintenanceRecord } from '../../../lib/supabase-data-store';

export async function GET() {
  try {
    const latestInfo = await getLatestMaintenanceRecord();
    
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