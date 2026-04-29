'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import type { DBSpeaker } from '@/types/supabase';

export async function upsertSpeaker(formData: FormData) {
  const client = createAdminClient();
  const id = formData.get('id') as string | null;

  const expertiseRaw = (formData.get('expertise') as string) || '';
  const expertise = expertiseRaw.split(',').map((t) => t.trim()).filter(Boolean);

  const payload: Partial<DBSpeaker> = {
    name: formData.get('name') as string,
    title: (formData.get('title') as string) || null,
    organization: (formData.get('organization') as string) || null,
    bio: (formData.get('bio') as string) || null,
    image_url: (formData.get('image_url') as string) || null,
    expertise,
    featured: formData.get('featured') === 'true',
    instagram: (formData.get('instagram') as string) || null,
    title_en: (formData.get('title_en') as string) || null,
    bio_en: (formData.get('bio_en') as string) || null,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { error } = await client.from('speakers').update(payload).eq('id', id);
    if (error) return { error: error.message };
  } else {
    // New rows go to the end of the list
    const { data: maxRow } = await client
      .from('speakers')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();
    payload.sort_order = ((maxRow?.sort_order as number | undefined) ?? -1) + 1;

    const { error } = await client.from('speakers').insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath('/admin/speakers');
  revalidatePath('/speakers');
  revalidatePath('/');
  return { success: true };
}

export async function deleteSpeaker(id: string) {
  const client = createAdminClient();
  const { error } = await client.from('speakers').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/speakers');
  revalidatePath('/speakers');
  revalidatePath('/');
  return { success: true };
}

export async function getSpeakers() {
  const client = createAdminClient();
  const { data, error } = await client
    .from('speakers')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}

/**
 * Rewrites sort_order for the given speaker ids: position 0..n.
 * The admin always sends the full list, so this is conflict-free.
 */
export async function reorderSpeakers(orderedIds: string[]) {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return { error: 'No speakers to reorder.' };
  }
  const client = createAdminClient();
  const stamp = new Date().toISOString();

  const updates = orderedIds.map((id, index) =>
    client.from('speakers').update({ sort_order: index, updated_at: stamp }).eq('id', id),
  );
  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };

  revalidatePath('/admin/speakers');
  revalidatePath('/speakers');
  revalidatePath('/');
  return { success: true };
}
