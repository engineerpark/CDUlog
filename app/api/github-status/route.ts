import { NextResponse } from 'next/server';
import { getGitHubStatus } from '../../lib/github-data-store';
import { testGitHubConnection } from '../../lib/github-storage';

export async function GET() {
  try {
    const status = getGitHubStatus();
    
    // GitHub 연결 상태도 확인
    const connectionResult = await testGitHubConnection();
    
    return NextResponse.json({
      success: true,
      data: {
        ...status,
        isConnected: connectionResult.connected,
        connectionError: connectionResult.error || null,
        timestamp: new Date().toISOString(),
        debugInfo: {
          hasToken: !!process.env.GITHUB_TOKEN,
          tokenFormat: process.env.GITHUB_TOKEN ? 
            (process.env.GITHUB_TOKEN.startsWith('ghp_') ? 'classic' : 
             process.env.GITHUB_TOKEN.startsWith('github_pat_') ? 'fine-grained' : 'unknown') : 'none',
          tokenLength: process.env.GITHUB_TOKEN?.length || 0,
        }
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
        connectionError: error instanceof Error ? error.message : 'Unknown error',
        dataCount: { units: 0, records: 0 },
        timestamp: new Date().toISOString(),
        debugInfo: {
          hasToken: false,
          tokenFormat: 'none',
          tokenLength: 0,
        }
      }
    }, { status: 500 });
  }
}