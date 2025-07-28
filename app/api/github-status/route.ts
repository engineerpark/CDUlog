import { NextResponse } from 'next/server';
import { getGitHubStatus } from '../../lib/github-data-store';
import { testGitHubConnection } from '../../lib/github-storage';

export async function GET() {
  try {
    const status = getGitHubStatus();
    
    // GitHub 연결 상태도 확인
    const isConnected = await testGitHubConnection();
    
    return NextResponse.json({
      success: true,
      data: {
        ...status,
        isConnected,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error getting GitHub status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get GitHub status',
      data: {
        isAvailable: false,
        isInitialized: false,
        isConnected: false,
        dataCount: { units: 0, records: 0 },
        timestamp: new Date().toISOString(),
      }
    }, { status: 500 });
  }
}