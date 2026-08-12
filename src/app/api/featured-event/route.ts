import { NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase/public';

// Public, unauthenticated endpoint → use the anon client (RLS-scoped), never the service role.
// The featured/upcoming events it returns are covered by the "public read events" RLS policy.
export async function GET() {
  try {
    const client = createPublicClient();
    const { data, error } = await client
      .from('events')
      .select('id, title, date, city, state, venue, image_url, price, price_vip, vip_benefits, eventbrite_url, ticketplate_url, ticket_tiers')
      .eq('featured', true)
      .eq('status', 'upcoming')
      .order('date', { ascending: true })
      .limit(1);

    if (error) {
      console.error('[featured-event] DB error:', error.message);
      return NextResponse.json(null, { status: 200 });
    }
    return NextResponse.json(data?.[0] ?? null, {
      // Short CDN cache so this doesn't run an uncached query on every first page view.
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (err) {
    console.error('[featured-event] Unexpected error:', err);
    // Degrade gracefully — a missing featured event must not surface as an error to the visitor.
    return NextResponse.json(null, { status: 200 });
  }
}
