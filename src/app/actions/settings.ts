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

  const s  = (key: string) => (formData.get(key) as string | null)?.trim() || undefined;
  const sn = (key: string) => {
    const v = formData.get(key);
    if (v === null || (v as string).trim() === '') return undefined;
    const n = Number(v);
    return isNaN(n) ? undefined : n;
  };

  const payload = {
    // Identity
    site_name:     s('site_name'),
    site_tagline:  s('site_tagline'),
    contact_email: s('contact_email'),
    // Stats
    total_events:    sn('total_events'),
    total_attendees: sn('total_attendees'),
    total_speakers:  sn('total_speakers'),
    cities_reached:  sn('cities_reached'),
    years_active:    sn('years_active'),
    satisfaction:    sn('satisfaction'),
    // Social links
    instagram_url: s('instagram_url'),
    linkedin_url:  s('linkedin_url'),
    facebook_url:  s('facebook_url'),
    twitter_url:   s('twitter_url'),
    youtube_url:   s('youtube_url'),
    whatsapp_url:  s('whatsapp_url'),
    tiktok_url:    s('tiktok_url'),
    // Hero content (bilingual)
    hero_badge_es:               s('hero_badge_es'),
    hero_badge_en:               s('hero_badge_en'),
    hero_headline_es:            s('hero_headline_es'),
    hero_headline_en:            s('hero_headline_en'),
    hero_body_es:                s('hero_body_es'),
    hero_body_en:                s('hero_body_en'),
    hero_cta_primary_label_es:   s('hero_cta_primary_label_es'),
    hero_cta_primary_label_en:   s('hero_cta_primary_label_en'),
    hero_cta_primary_href:       s('hero_cta_primary_href'),
    hero_cta_secondary_label_es: s('hero_cta_secondary_label_es'),
    hero_cta_secondary_label_en: s('hero_cta_secondary_label_en'),
    hero_cta_secondary_href:     s('hero_cta_secondary_href'),
    // Brand statement (bilingual)
    brand_quote_es: s('brand_quote_es'),
    brand_quote_en: s('brand_quote_en'),
    brand_body_es:  s('brand_body_es'),
    brand_body_en:  s('brand_body_en'),
    updated_at: new Date().toISOString(),
  };

  // Remove undefined keys so we don't accidentally null out fields
  const clean = Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== undefined)
  );

  const { error } = await client
    .from('site_config')
    .upsert({ id: 1, ...clean });

  if (error) return { error: error.message };

  revalidatePath('/', 'layout');
  return { success: true };
}
