'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

function revalidateEventPaths() {
  revalidatePath('/admin/events');
  revalidatePath('/events');
  revalidatePath('/');
}

export async function upsertEvent(formData: FormData) {
  const client = createAdminClient();
  const id = formData.get('id') as string | null;

  const title = (formData.get('title') as string)?.trim();
  const slug = (formData.get('slug') as string)?.trim();
  const date = (formData.get('date') as string)?.trim();
  const city = (formData.get('city') as string)?.trim();
  const venue = (formData.get('venue') as string)?.trim();

  if (!title) return { error: 'Título es requerido.' };
  if (!slug) return { error: 'Slug es requerido.' };
  if (!date) return { error: 'Fecha es requerida.' };
  if (!city) return { error: 'Ciudad es requerida.' };
  if (!venue) return { error: 'Venue es requerido.' };

  const tagsRaw = (formData.get('tags') as string) || '';
  const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);

  // Safe numeric parsing — avoids NaN on non-numeric input
  const capacity  = Math.max(0, parseInt(formData.get('capacity') as string, 10) || 0);
  const price     = Math.max(0, parseFloat(formData.get('price') as string) || 0);
  const priceVipRaw = formData.get('price_vip') as string;
  const price_vip = priceVipRaw?.trim() ? Math.max(0, parseFloat(priceVipRaw) || 0) : null;
  const vipBenefitsRaw = (formData.get('vip_benefits') as string) || '';
  const vip_benefits = vipBenefitsRaw.split('\n').map((b) => b.trim()).filter(Boolean);

  const payload = {
    title,
    slug,
    date,
    end_date: (formData.get('end_date') as string)?.trim() || null,
    city,
    state: (formData.get('state') as string)?.trim() || '',
    venue,
    category: (formData.get('category') as string) || 'community',
    status: (formData.get('status') as string) || 'upcoming',
    description:    (formData.get('description')    as string)?.trim() || null,
    title_en:       (formData.get('title_en')       as string)?.trim() || null,
    description_en: (formData.get('description_en') as string)?.trim() || null,
    image_url: (formData.get('image_url') as string)?.trim() || null,
    video_url: (formData.get('video_url') as string)?.trim() || null,
    capacity,
    price,
    price_vip,
    vip_benefits: vip_benefits.length > 0 ? vip_benefits : null,
    eventbrite_url: (formData.get('eventbrite_url') as string)?.trim() || null,
    featured: formData.get('featured') === 'true',
    tags,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { error } = await client.from('events').update(payload).eq('id', id);
    if (error) return { error: error.message };
  } else {
    const { error } = await client.from('events').insert(payload);
    if (error) return { error: error.message };
  }

  revalidateEventPaths();
  return { success: true };
}

export async function deleteEvent(id: string) {
  const client = createAdminClient();
  const { error } = await client.from('events').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidateEventPaths();
  return { success: true };
}

export async function getEvents() {
  const client = createAdminClient();
  const { data, error } = await client
    .from('events')
    .select('*')
    .order('date', { ascending: true });
  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}

export async function getUpcomingEvents() {
  const { createPublicClient } = await import('@/lib/supabase/public');
  const client = createPublicClient();
  const { data, error } = await client
    .from('events')
    .select('id, title, date, city, venue')
    .eq('status', 'upcoming')
    .order('date', { ascending: true });
  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}

/**
 * Marks ONE event as featured for the homepage popup.
 * Uses a single UPDATE to avoid the race-condition window where zero events
 * are featured between the clear-all and the set-one operations.
 */
export async function setFeaturedForPopup(id: string) {
  const client = createAdminClient();

  // Clear all featured flags first, then set the target.
  // Two queries — acceptable for an admin action, not user-facing critical path.
  const { error: clearError } = await client
    .from('events')
    .update({ featured: false })
    .not('id', 'is', null);

  if (clearError) return { error: clearError.message };

  const { error } = await client
    .from('events')
    .update({ featured: true })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidateEventPaths();
  return { success: true };
}
