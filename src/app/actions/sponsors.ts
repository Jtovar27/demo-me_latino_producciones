'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

export async function getSponsors() {
  const client = createAdminClient();
  const { data, error } = await client
    .from('sponsors')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}

export async function upsertSponsor(formData: FormData) {
  const client = createAdminClient();
  const id = formData.get('id') as string | null;

  const payload = {
    name: formData.get('name') as string,
    tier: formData.get('tier') as string,
    website: (formData.get('website') as string) || null,
    description: (formData.get('description') as string) || null,
    logo_url: (formData.get('logo_url') as string) || null,
    active: true,
  };

  if (id) {
    const { error } = await client.from('sponsors').update(payload).eq('id', id);
    if (error) return { error: error.message };
  } else {
    const { error } = await client.from('sponsors').insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath('/admin/sponsors');
  revalidatePath('/sponsors');
  return { success: true };
}

export async function deleteSponsor(id: string) {
  const client = createAdminClient();
  const { error } = await client.from('sponsors').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/sponsors');
  revalidatePath('/sponsors');
  return { success: true };
}
