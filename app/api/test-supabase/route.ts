import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      urlLength: supabaseUrl?.length,
      keyLength: supabaseAnonKey?.length
    });
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase environment variables',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Simple test query
    const { data, error } = await supabase
      .from('outdoor_units')
      .select('id, name')
      .limit(3);

    console.log('Supabase query result:', { data, error });

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Supabase query error',
        details: error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      count: data?.length || 0
    });

  } catch (error) {
    console.error('Test Supabase error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}