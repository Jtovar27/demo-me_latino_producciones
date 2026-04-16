'use server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { createPublicClient } from '@/lib/supabase/public';

export async function upsertReview(formData: FormData) {
  const client = createAdminClient();
  const id = formData.get('id') as string | null;

  const name = (formData.get('name') as string)?.trim();
  if (!name) return { error: 'El nombre es requerido.' };

  const ratingRaw = Number(formData.get('rating'));
  const rating = Number.isFinite(ratingRaw) && ratingRaw >= 1 && ratingRaw <= 5
    ? Math.round(ratingRaw) : 5;

  const payload = {
    name,
    role: (formData.get('role') as string) || null,
    company: (formData.get('company') as string) || null,
    event_id: (formData.get('event_id') as string) || null,
    event_name: (formData.get('eventName') as string) || null,
    text: (formData.get('quote') as string) || null,
    rating,
    status: (formData.get('status') as string) || 'pending',
    featured: formData.get('featured') === 'true',
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { error } = await client.from('reviews').update(payload).eq('id', id);
    if (error) return { error: error.message };
  } else {
    const { error } = await client.from('reviews').insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath('/admin/reviews');
  revalidatePath('/');
  return { success: true };
}

export async function deleteReview(id: string) {
  const client = createAdminClient();
  const { error } = await client.from('reviews').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/reviews');
  revalidatePath('/');
  return { success: true };
}

export async function getReviews() {
  const client = createAdminClient();
  const { data, error } = await client
    .from('reviews')
    .select('*')
    .order('submitted_at', { ascending: false });
  return { data: data ?? [], error: error?.message ?? null };
}

export async function getPublishedReviews(limit = 12) {
  // Use public anon client — RLS policy already filters to status = 'published'
  const client = createPublicClient();
  const { data, error } = await client
    .from('reviews')
    .select('*')
    .eq('status', 'published')
    .order('featured', { ascending: false })
    .order('submitted_at', { ascending: false })
    .limit(limit);
  return { data: data ?? [], error: error?.message ?? null };
}

/**
 * Fetches published reviews for a specific event.
 * Matches by event_id (FK) when available; falls back to event_name for
 * legacy reviews that predate the event_id column.
 */
export async function getPublishedReviewsForEvent(
  eventId: string,
  eventTitle: string,
  limit = 50,
) {
  const client = createPublicClient();
  const { data, error } = await client
    .from('reviews')
    .select('*')
    .eq('status', 'published')
    .or(`event_id.eq.${eventId},event_name.ilike.${eventTitle}`)
    .order('featured', { ascending: false })
    .order('submitted_at', { ascending: false })
    .limit(limit);
  return { data: data ?? [], error: error?.message ?? null };
}

export async function submitPublicReview(formData: FormData) {
  // Use public client — subject to RLS, not service-role
  const client = createPublicClient();

  const name = (formData.get('name') as string)?.trim();
  if (!name || name.length > 200) return { error: 'El nombre es requerido.' };

  const email = (formData.get('email') as string)?.trim() || null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Email inválido.' };
  }

  const ratingRaw = Number(formData.get('rating'));
  const rating = Number.isFinite(ratingRaw) && ratingRaw >= 1 && ratingRaw <= 5
    ? Math.round(ratingRaw) : 5;

  const payload = {
    name,
    email,
    role: (formData.get('role') as string)?.trim() || null,
    company: (formData.get('company') as string)?.trim() || null,
    event_name: (formData.get('event_name') as string)?.trim() || null,
    text: (formData.get('text') as string)?.trim() || null,
    rating,
    status: 'pending' as const,
    featured: false,
  };

  const { error } = await client.from('reviews').insert(payload);
  if (error) return { error: error.message };
  return { success: true };
}
