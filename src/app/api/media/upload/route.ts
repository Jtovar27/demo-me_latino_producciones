import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET ?? 'meproducciones-media';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const maxSize = 50 * 1024 * 1024; // 50 MB
  if (file.size > maxSize) return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 400 });

  const allowed = ['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime'];
  if (!allowed.includes(file.type)) return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });

  const isVideo = file.type.startsWith('video/');
  const folder = isVideo ? 'videos' : 'images';
  const ext = file.name.split('.').pop();
  const storagePath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const client = createAdminClient();
  const buffer = await file.arrayBuffer();

  const { error: uploadError } = await client.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: file.type, upsert: false });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: urlData } = client.storage.from(BUCKET).getPublicUrl(storagePath);

  const { data, error } = await client.from('gallery_items').insert({
    storage_path: storagePath,
    public_url: urlData.publicUrl,
    alt: (formData.get('alt') as string) || file.name,
    media_type: isVideo ? 'video' : 'image',
    category: (formData.get('category') as string) || null,
    featured: false,
    file_size: file.size,
    mime_type: file.type,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, item: data });
}
