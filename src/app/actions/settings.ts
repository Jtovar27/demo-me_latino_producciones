'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

export async function getSiteConfig() {
  const client = createAdminClient();
  const { data, error } = await client
    .from('site_config')
    .select('*')
    .eq('id', 1)
    .single();
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function updateSiteConfig(formData: FormData) {
  const client = createAdminClient();

  const s = (key: string) => (formData.get(key) as string) || undefined;
  const payload = {
    site_name:      s('site_name'),
    site_tagline:   s('site_tagline'),
    contact_email:  s('contact_email'),
    instagram_url:  s('instagram_url'),
    linkedin_url:   s('linkedin_url'),
    facebook_url:   s('facebook_url'),
    updated_at:     new Date().toISOString(),
  };

  const { error } = await client
    .from('site_config')
    .upsert({ id: 1, ...payload });

  if (error) return { error: error.message };

  revalidatePath('/', 'layout');
  return { success: true };
}
