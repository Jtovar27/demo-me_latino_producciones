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
      .limit(1)
      .single();

    if (error || !data) return NextResponse.json(null);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(null);
  }
}
