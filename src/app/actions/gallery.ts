'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

const BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET ?? 'meproducciones-media';

const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
  'video/mp4', 'video/quicktime', 'video/webm',
];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

function revalidateGalleryPaths() {
  revalidatePath('/admin/media');
  revalidatePath('/gallery');
}

export async function uploadMediaFile(formData: FormData) {
  const client = createAdminClient();
  const file = formData.get('file') as File;
  if (!file) return { error: 'No file provided' };

  // Validate MIME type and file size
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { error: `Tipo de archivo no permitido: ${file.type}` };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { error: 'Archivo demasiado grande (máx 100 MB).' };
  }

  const isVideo = file.type.startsWith('video/');
  const folder = isVideo ? 'videos' : 'images';
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const storagePath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const buffer = await file.arrayBuffer();
  const { error: uploadError } = await client.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: file.type, upsert: false });

  if (uploadError) return { error: uploadError.message };

  const { data: urlData } = client.storage.from(BUCKET).getPublicUrl(storagePath);

  const { data, error } = await client.from('gallery_items').insert({
    storage_path: storagePath,
    public_url:   urlData.publicUrl,
    alt:          (formData.get('alt') as string)?.trim() || file.name,
    media_type:   isVideo ? 'video' : 'image',
    category:     (formData.get('category') as string)?.trim() || null,
    featured:     false,
  }).select().single();

  if (error) {
    // DB insert failed — clean up the uploaded file to avoid orphaned storage objects
    await client.storage.from(BUCKET).remove([storagePath]);
    return { error: error.message };
  }

  revalidateGalleryPaths();
  return { success: true, item: data };
}

export async function deleteMediaFile(id: string, storagePath: string) {
  const client = createAdminClient();

  // Delete DB record FIRST — if storage removal fails, we can retry.
  // Reverse order would leave a row pointing to a dead URL.
  const { error: dbError } = await client.from('gallery_items').delete().eq('id', id);
  if (dbError) return { error: dbError.message };

  const { error: storageError } = await client.storage.from(BUCKET).remove([storagePath]);
  if (storageError) {
    // Log but don't fail — DB row is gone, file can be cleaned up manually
    console.error('[deleteMediaFile] Storage removal failed:', storageError.message);
  }

  revalidateGalleryPaths();
  return { success: true };
}

export async function getSignedUploadUrl(filename: string, contentType: string) {
  const client = createAdminClient();
  const isVideo = contentType.startsWith('video/');
  const folder = isVideo ? 'videos' : 'images';
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'bin';
  const storagePath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await client.storage
    .from(BUCKET)
    .createSignedUploadUrl(storagePath);

  if (error) return { error: error.message };
  return { signedUrl: data.signedUrl, storagePath, token: data.token };
}

export async function createGalleryItem(payload: {
  storage_path: string;
  alt:          string;
  media_type:   'image' | 'video';
  category:     string;
}) {
  const client = createAdminClient();

  // Generate public URL server-side using the SDK (most reliable format)
  const { data: urlData } = client.storage
    .from(BUCKET)
    .getPublicUrl(payload.storage_path);

  const { data, error } = await client
    .from('gallery_items')
    .insert({
      storage_path: payload.storage_path,
      public_url:   urlData.publicUrl,
      alt:          payload.alt,
      media_type:   payload.media_type,
      category:     payload.category,
      featured:     false,
    })
    .select()
    .single();
  if (error) return { error: error.message };
  revalidateGalleryPaths();
  return { success: true, item: data };
}

export async function updateGalleryItem(
  id: string,
  updates: { alt?: string; category?: string; featured?: boolean }
) {
  const client = createAdminClient();
  const { error } = await client.from('gallery_items').update(updates).eq('id', id);
  if (error) return { error: error.message };
  revalidateGalleryPaths();
  return { success: true };
}

export async function getGalleryItems(type?: 'image' | 'video') {
  const client = createAdminClient();
  let query = client
    .from('gallery_items')
    .select('*')
    .order('created_at', { ascending: false });
  if (type) query = query.eq('media_type', type);
  const { data, error } = await query;
  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}

// Public-only gallery fetch. Hard-filters to the 5 real gallery categories so
// speaker / sponsor / uncategorized items never reach the public /gallery page,
// even if they end up in the gallery_items table.
const PUBLIC_GALLERY_CATEGORIES = ['backstage', 'moments', 'audience', 'stage', 'details'] as const;

export async function getPublicGalleryItems() {
  const client = createAdminClient();

  // The admin MediaPicker uploads speaker/sponsor photos into gallery_items
  // with a default category of "moments", so a category filter alone isn't
  // enough. Fetch every URL currently in use as a speaker photo or sponsor
  // logo and exclude them from the public gallery.
  const [speakersRes, sponsorsRes] = await Promise.all([
    client.from('speakers').select('image_url'),
    client.from('sponsors').select('logo_url'),
  ]);

  const excludedUrls = new Set<string>();
  for (const row of speakersRes.data ?? []) {
    if (row.image_url) excludedUrls.add(row.image_url);
  }
  for (const row of sponsorsRes.data ?? []) {
    if (row.logo_url) excludedUrls.add(row.logo_url);
  }

  const { data, error } = await client
    .from('gallery_items')
    .select('*')
    .in('category', PUBLIC_GALLERY_CATEGORIES as unknown as string[])
    .order('created_at', { ascending: false });
  if (error) return { data: [], error: error.message };

  const filtered = (data ?? []).filter((item) => !excludedUrls.has(item.public_url));
  return { data: filtered, error: null };
}
