import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const client = createAdminClient();
    const { data, error } = await client
      .from('events')
      .select('id, title, date, city, state, venue, image_url, price')
      .eq('featured', true)
      .eq('status', 'upcoming')
      .order('date', { ascending: true })
      .limit(1);

    if (error) {
      console.error('[featured-event] DB error:', error.message);
      return NextResponse.json(null, { status: 500 });
    }
    return NextResponse.json(data?.[0] ?? null);
  } catch (err) {
    console.error('[featured-event] Unexpected error:', err);
    return NextResponse.json(null, { status: 500 });
  }
}
