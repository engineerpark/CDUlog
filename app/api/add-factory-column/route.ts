import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';

export async function POST() {
  try {
    // Add factory_name column to outdoor_units table
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE outdoor_units 
        ADD COLUMN IF NOT EXISTS factory_name TEXT;
        
        ALTER TABLE outdoor_units 
        ADD COLUMN IF NOT EXISTS location TEXT;
      `
    });
    
    if (error) {
      console.error('Error adding columns:', error);
      
      // Log the error for debugging
      console.error('RPC exec_sql not available - manual column addition required');
      
      return NextResponse.json({
        success: false,
        error: error.message,
        note: 'You may need to add these columns manually in Supabase dashboard: factory_name (TEXT), location (TEXT)'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Successfully added factory_name and location columns',
      data
    });
    
  } catch (error) {
    console.error('Database schema update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update database schema' },
      { status: 500 }
    );
  }
}