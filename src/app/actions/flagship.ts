'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import type { DBFlagshipEvent, FlagshipVenue } from '@/types/supabase';

export async function getFlagshipEvents(): Promise<{ data: DBFlagshipEvent[] | null; error: string | null }> {
  const client = createAdminClient();
  const { data, error } = await client
    .from('flagship_events')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true });
  return { data: (data as DBFlagshipEvent[]) ?? null, error: error?.message ?? null };
}

export async function getAllFlagshipEvents(): Promise<{ data: DBFlagshipEvent[] | null; error: string | null }> {
  const client = createAdminClient();
  const { data, error } = await client
    .from('flagship_events')
    .select('*')
    .order('sort_order', { ascending: true });
  return { data: (data as DBFlagshipEvent[]) ?? null, error: error?.message ?? null };
}

function parseVenues(json: string): FlagshipVenue[] {
  try { return JSON.parse(json) as FlagshipVenue[]; } catch { return []; }
}

export async function createFlagshipEvent(formData: FormData): Promise<{ error?: string }> {
  const title = (formData.get('title') as string | null)?.trim();
  if (!title) return { error: 'El título es requerido.' };

  const client = createAdminClient();
  const { error } = await client.from('flagship_events').insert({
    title,
    description_es: (formData.get('description_es') as string | null)?.trim() || null,
    description_en: (formData.get('description_en') as string | null)?.trim() || null,
    venues: parseVenues(formData.get('venues') as string),
    sort_order: Number(formData.get('sort_order') ?? 0),
    active: formData.get('active') === 'true',
    updated_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };
  revalidatePath('/', 'layout');
  return {};
}

export async function updateFlagshipEvent(id: string, formData: FormData): Promise<{ error?: string }> {
  const title = (formData.get('title') as string | null)?.trim();
  if (!title) return { error: 'El título es requerido.' };

  const client = createAdminClient();
  const { error } = await client
    .from('flagship_events')
    .update({
      title,
      description_es: (formData.get('description_es') as string | null)?.trim() || null,
      description_en: (formData.get('description_en') as string | null)?.trim() || null,
      venues: parseVenues(formData.get('venues') as string),
      sort_order: Number(formData.get('sort_order') ?? 0),
      active: formData.get('active') === 'true',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/', 'layout');
  return {};
}

export async function deleteFlagshipEvent(id: string): Promise<{ error?: string }> {
  const client = createAdminClient();
  const { error } = await client.from('flagship_events').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/', 'layout');
  return {};
}
