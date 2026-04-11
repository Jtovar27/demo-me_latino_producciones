'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

export async function upsertSpeaker(formData: FormData) {
  const client = createAdminClient();
  const id = formData.get('id') as string | null;

  const expertiseRaw = (formData.get('expertise') as string) || '';
  const expertise = expertiseRaw.split(',').map((t) => t.trim()).filter(Boolean);

  const payload = {
    name: formData.get('name') as string,
    title: (formData.get('title') as string) || null,
    organization: (formData.get('organization') as string) || null,
    bio: (formData.get('bio') as string) || null,
    image_url: (formData.get('image_url') as string) || null,
    expertise,
    featured: formData.get('featured') === 'true',
    instagram: (formData.get('instagram') as string) || null,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { error } = await client.from('speakers').update(payload).eq('id', id);
    if (error) return { error: error.message };
  } else {
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
    .order('created_at', { ascending: false });
  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}
