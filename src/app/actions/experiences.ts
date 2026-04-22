'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

function revalidateExperiencePaths() {
  revalidatePath('/admin/experiences');
  revalidatePath('/experiences');
  revalidatePath('/');
}

export async function getExperiences() {
  const client = createAdminClient();
  const { data, error } = await client
    .from('experiences')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}

export async function getExperienceBySlug(slug: string) {
  const client = createAdminClient();
  const { data, error } = await client
    .from('experiences')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function upsertExperience(formData: FormData) {
  const client = createAdminClient();
  const id = formData.get('id') as string | null;

  const title = (formData.get('title') as string)?.trim();
  const slug = (formData.get('slug') as string)?.trim();

  if (!title) return { error: 'Título es requerido.' };
  if (!slug) return { error: 'Slug es requerido.' };

  const tagsRaw = (formData.get('tags') as string) || '';
  const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);

  const payload = {
    title,
    slug,
    category: (formData.get('category') as string) || 'flagship',
    short_desc: (formData.get('short_desc') as string)?.trim() || null,
    description: (formData.get('description') as string)?.trim() || null,
    image_url: (formData.get('image_url') as string)?.trim() || null,
    featured: formData.get('featured') === 'true',
    tags,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { error } = await client.from('experiences').update(payload).eq('id', id);
    if (error) return { error: error.message };
  } else {
    const { error } = await client.from('experiences').insert(payload);
    if (error) return { error: error.message };
  }

  revalidateExperiencePaths();
  return { success: true };
}

export async function deleteExperience(id: string) {
  const client = createAdminClient();
  const { error } = await client.from('experiences').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidateExperiencePaths();
  return { success: true };
}
