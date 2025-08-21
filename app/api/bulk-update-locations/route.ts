import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const updates = await request.json();
    console.log('Received location updates:', updates.length);

    if (!Array.isArray(updates)) {
      return NextResponse.json({
        success: false,
        error: 'Updates must be an array'
      }, { status: 400 });
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const update of updates) {
      try {
        const { name, location } = update;
        
        if (!name || !location) {
          console.log('Skipping invalid update:', update);
          errorCount++;
          continue;
        }

        // 장비명으로 실외기 찾기
        const { data: existingUnit, error: findError } = await supabase
          .from('outdoor_units')
          .select('id, name, location')
          .eq('name', name)
          .single();

        if (findError || !existingUnit) {
          console.log(`Unit not found: ${name}, Error:`, findError);
          // 부분 일치로 시도해보기
          const { data: partialMatches } = await supabase
            .from('outdoor_units')
            .select('id, name, location')
            .ilike('name', `%${name}%`);
          
          console.log(`Partial matches for "${name}":`, partialMatches?.slice(0, 3));
          errorCount++;
          continue;
        }

        // location 업데이트
        const { data, error } = await supabase
          .from('outdoor_units')
          .update({ 
            location: location,
            updated_at: new Date().toISOString() 
          })
          .eq('id', existingUnit.id)
          .select()
          .single();

        if (error) {
          console.error(`Error updating ${name}:`, error);
          errorCount++;
          continue;
        }

        console.log(`Updated ${name}: ${existingUnit.location} -> ${location}`);
        results.push({
          id: data.id,
          name: data.name,
          oldLocation: existingUnit.location,
          newLocation: location
        });
        successCount++;

      } catch (unitError) {
        console.error('Error processing unit:', unitError);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${successCount} units successfully, ${errorCount} errors`,
      successCount,
      errorCount,
      results
    });

  } catch (error) {
    console.error('Error in bulk location update:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}