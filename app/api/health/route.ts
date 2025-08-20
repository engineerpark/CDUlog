import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    return NextResponse.json({
      success: true,
      data: {
        hasSupabaseUrl: !!supabaseUrl,
        hasSupabaseKey: !!supabaseAnonKey,
        supabaseUrlPrefix: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'Not set',
        supabaseKeyPrefix: supabaseAnonKey ? supabaseAnonKey.substring(0, 30) + '...' : 'Not set',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Health check failed'
    }, { status: 500 });
  }
}