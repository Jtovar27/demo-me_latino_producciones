'use server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

export async function upsertReview(formData: FormData) {
  const client = createAdminClient();
  const id = formData.get('id') as string | null;
  const payload = {
    name: formData.get('name') as string,
    role: (formData.get('role') as string) || null,
    company: (formData.get('company') as string) || null,
    event_name: (formData.get('eventName') as string) || null,
    text: (formData.get('quote') as string) || null,
    rating: Number(formData.get('rating') ?? 5),
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
  return { success: true };
}

export async function deleteReview(id: string) {
  const client = createAdminClient();
  const { error } = await client.from('reviews').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/reviews');
  return { success: true };
}

export async function getReviews() {
  const client = createAdminClient();
  const { data, error } = await client.from('reviews').select('*').order('submitted_at', { ascending: false });
  return { data: data ?? [], error: error?.message ?? null };
}
