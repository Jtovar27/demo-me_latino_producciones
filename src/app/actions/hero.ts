'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import type { DBHeroSlide } from '@/types/supabase';

// ── Read ──────────────────────────────────────────────────────

export async function getHeroSlides(): Promise<{ data: DBHeroSlide[]; error: string | null }> {
  const client = createAdminClient();
  const { data, error } = await client
    .from('hero_slides')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}

export async function getActiveHeroSlides(): Promise<{ data: DBHeroSlide[]; error: string | null }> {
  const client = createAdminClient();
  const { data, error } = await client
    .from('hero_slides')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true });
  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}

// ── Write ─────────────────────────────────────────────────────

export async function upsertHeroSlide(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const client = createAdminClient();

  const s  = (key: string) => (formData.get(key) as string | null)?.trim() || null;
  const sb = (key: string) => formData.get(key) === 'true';
  const sn = (key: string) => {
    const v = formData.get(key);
    return v !== null && v !== '' ? Number(v) : 0;
  };

  const id = s('id');

  // Validation — required fields
  const imageUrl = s('image_url');
  if (!imageUrl) return { error: 'La URL de imagen es obligatoria.' };
  const titleEs = s('title_es');
  if (!titleEs) return { error: 'El título en español es obligatorio.' };

  const payload = {
    image_url:    imageUrl,
    alt_es:       s('alt_es')       ?? '',
    alt_en:       s('alt_en')       ?? '',
    category_es:  s('category_es')  ?? '',
    category_en:  s('category_en')  ?? '',
    title_es:     titleEs,
    title_en:     s('title_en')     ?? titleEs,
    location:     s('location')     ?? '',
    cta_label_es: s('cta_label_es'),
    cta_label_en: s('cta_label_en'),
    cta_href:     s('cta_href'),
    sort_order:   sn('sort_order'),
    active:       sb('active'),
    updated_at:   new Date().toISOString(),
  };

  let error;
  if (id) {
    ({ error } = await client.from('hero_slides').update(payload).eq('id', id));
  } else {
    ({ error } = await client.from('hero_slides').insert(payload));
  }

  if (error) return { error: error.message };

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function deleteHeroSlide(id: string): Promise<{ error?: string; success?: boolean }> {
  if (!id) return { error: 'ID requerido.' };
  const client = createAdminClient();
  const { error } = await client.from('hero_slides').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function reorderHeroSlides(
  orderedIds: string[]
): Promise<{ error?: string; success?: boolean }> {
  const client = createAdminClient();
  const updates = orderedIds.map((id, index) =>
    client.from('hero_slides').update({ sort_order: index, updated_at: new Date().toISOString() }).eq('id', id)
  );
  const results = await Promise.all(updates);
  const first = results.find((r) => r.error);
  if (first?.error) return { error: first.error.message };
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function toggleHeroSlide(
  id: string,
  active: boolean
): Promise<{ error?: string; success?: boolean }> {
  const client = createAdminClient();
  const { error } = await client
    .from('hero_slides')
    .update({ active, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/', 'layout');
  return { success: true };
}
