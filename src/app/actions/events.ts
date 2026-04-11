'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

export async function upsertEvent(formData: FormData) {
  const client = createAdminClient();
  const id = formData.get('id') as string | null;

  const tagsRaw = (formData.get('tags') as string) || '';
  const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);

  const payload = {
    title: formData.get('title') as string,
    slug: formData.get('slug') as string,
    date: formData.get('date') as string,
    end_date: (formData.get('end_date') as string) || null,
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    venue: formData.get('venue') as string,
    category: formData.get('category') as string,
    status: formData.get('status') as string,
    description: (formData.get('description') as string) || null,
    image_url: (formData.get('image_url') as string) || null,
    video_url: (formData.get('video_url') as string) || null,
    capacity: Number(formData.get('capacity') ?? 0),
    price: Number(formData.get('price') ?? 0),
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

  revalidatePath('/admin/events');
  revalidatePath('/events');
  revalidatePath('/');
  return { success: true };
}

export async function deleteEvent(id: string) {
  const client = createAdminClient();
  const { error } = await client.from('events').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/events');
  revalidatePath('/events');
  revalidatePath('/');
  return { success: true };
}

export async function getEvents() {
  const client = createAdminClient();
  const { data, error } = await client
    .from('events')
    .select('*')
    .order('date', { ascending: false });
  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}

/**
 * Marca UN evento como destacado para el popup de inicio.
 * Quita el destacado de todos los demás eventos primero.
 */
export async function setFeaturedForPopup(id: string) {
  const client = createAdminClient();

  // Quitar destacado de todos los eventos
  const { error: clearError } = await client
    .from('events')
    .update({ featured: false })
    .not('id', 'is', null);

  if (clearError) return { error: clearError.message };

  // Destacar solo el evento seleccionado
  const { error } = await client
    .from('events')
    .update({ featured: true })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/events');
  revalidatePath('/events');
  revalidatePath('/');
  return { success: true };
}
