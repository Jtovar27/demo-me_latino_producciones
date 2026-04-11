'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

const BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET ?? 'meproducciones-media';

export async function uploadMediaFile(formData: FormData) {
  const client = createAdminClient();
  const file = formData.get('file') as File;
  if (!file) return { error: 'No file provided' };

  const isVideo = file.type.startsWith('video/');
  const folder = isVideo ? 'videos' : 'images';
  const ext = file.name.split('.').pop();
  const storagePath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const buffer = await file.arrayBuffer();
  const { error: uploadError } = await client.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: file.type, upsert: false });

  if (uploadError) return { error: uploadError.message };

  const { data: urlData } = client.storage.from(BUCKET).getPublicUrl(storagePath);

  const { data, error } = await client.from('gallery_items').insert({
    storage_path: storagePath,
    public_url: urlData.publicUrl,
    alt: formData.get('alt') as string || file.name,
    media_type: isVideo ? 'video' : 'image',
    category: (formData.get('category') as string) || null,
    featured: false,
    file_size: file.size,
    mime_type: file.type,
  }).select().single();

  if (error) return { error: error.message };

  revalidatePath('/admin/media');
  revalidatePath('/gallery');
  return { success: true, item: data };
}

export async function deleteMediaFile(id: string, storagePath: string) {
  const client = createAdminClient();

  await client.storage.from(BUCKET).remove([storagePath]);
  const { error } = await client.from('gallery_items').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/admin/media');
  revalidatePath('/gallery');
  return { success: true };
}

export async function updateGalleryItem(id: string, updates: { alt?: string; category?: string; featured?: boolean }) {
  const client = createAdminClient();
  const { error } = await client.from('gallery_items').update(updates).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/media');
  revalidatePath('/gallery');
  return { success: true };
}

export async function getGalleryItems(type?: 'image' | 'video') {
  const client = createAdminClient();
  let query = client.from('gallery_items').select('*').order('created_at', { ascending: false });
  if (type) query = query.eq('media_type', type);
  const { data, error } = await query;
  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}
