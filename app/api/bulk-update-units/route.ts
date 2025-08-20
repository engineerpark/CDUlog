import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';

interface UnitUpdateData {
  name: string;
  factory_name: string;
}

export async function POST(request: NextRequest) {
  try {
    const { updates }: { updates: UnitUpdateData[] } = await request.json();
    
    console.log(`Bulk updating ${updates.length} units...`);
    
    const updatePromises = updates.map(async (update) => {
      const { data, error } = await supabase
        .from('outdoor_units')
        .update({ 
          factory_name: update.factory_name,
          updated_at: new Date().toISOString() 
        })
        .eq('name', update.name)
        .select('name, factory_name');
      
      if (error) {
        console.error(`Error updating ${update.name}:`, error);
        return { name: update.name, success: false, error: error.message };
      }
      
      if (data && data.length > 0) {
        console.log(`✓ Updated ${update.name} -> ${update.factory_name}`);
        return { name: update.name, success: true, data: data[0] };
      } else {
        console.warn(`⚠ No unit found with name: ${update.name}`);
        return { name: update.name, success: false, error: 'Unit not found' };
      }
    });
    
    const results = await Promise.all(updatePromises);
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`Bulk update completed: ${successful.length} successful, ${failed.length} failed`);
    
    return NextResponse.json({
      success: true,
      message: `Updated ${successful.length} units successfully, ${failed.length} failed`,
      results: {
        successful: successful.length,
        failed: failed.length,
        details: results
      }
    });
    
  } catch (error) {
    console.error('Bulk update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform bulk update' },
      { status: 500 }
    );
  }
}