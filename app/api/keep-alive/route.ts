import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Create Supabase client
    const supabase = await createClient();

    // Simple query to keep the database active
    const { error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    // Query another table to ensure activity
    const { error: materialError } = await supabase
      .from('materials')
      .select('id')
      .limit(1);

    // You can also call a database function if you have one
    // const { data: dashboard, error: dashError } = await supabase
    //   .rpc('get_student_dashboard', { p_user_id: 'some-uuid' });

    // Log the activity
    console.log(`Keep-alive ping at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tables_checked: ['profiles', 'materials'],
      errors: {
        profiles: profileError?.message || null,
        materials: materialError?.message || null
      }
    });
  } catch (error) {
    console.error('Keep-alive error:', error);
    return NextResponse.json(
      { success: false, error: 'Keep-alive failed' },
      { status: 500 }
    );
  }
}

// Also support POST for flexibility
export async function POST() {
  return GET();
}