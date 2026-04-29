'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import type { DBSponsor } from '@/types/supabase';

export async function getSponsors() {
  const client = createAdminClient();
  const { data, error } = await client
    .from('sponsors')
    .select('*')
    .order('tier', { ascending: true })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}

export async function upsertSponsor(formData: FormData) {
  const client = createAdminClient();
  const id = formData.get('id') as string | null;

  const tier = (formData.get('tier') as string) || 'pink';

  const payload: Partial<DBSponsor> = {
    name: formData.get('name') as string,
    tier,
    website: (formData.get('website') as string) || null,
    description: (formData.get('description') as string) || null,
    description_en: (formData.get('description_en') as string) || null,
    logo_url: (formData.get('logo_url') as string) || null,
    active: true,
  };

  if (id) {
    const { error } = await client.from('sponsors').update(payload).eq('id', id);
    if (error) return { error: error.message };
  } else {
    // New rows go to the end of their tier
    const { data: maxRow } = await client
      .from('sponsors')
      .select('sort_order')
      .eq('tier', tier)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();
    payload.sort_order = ((maxRow?.sort_order as number | undefined) ?? -1) + 1;

    const { error } = await client.from('sponsors').insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath('/admin/sponsors');
  revalidatePath('/sponsors');
  revalidatePath('/');
  return { success: true };
}

/**
 * Rewrites sort_order for sponsors in a single tier: position 0..n.
 * Other tiers are untouched.
 */
export async function reorderSponsors(tier: string, orderedIds: string[]) {
  if (!tier || !Array.isArray(orderedIds) || orderedIds.length === 0) {
    return { error: 'No sponsors to reorder.' };
  }
  const client = createAdminClient();

  const updates = orderedIds.map((id, index) =>
    client.from('sponsors').update({ sort_order: index }).eq('id', id),
  );
  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };

  revalidatePath('/admin/sponsors');
  revalidatePath('/sponsors');
  revalidatePath('/');
  return { success: true };
}

export async function deleteSponsor(id: string) {
  const client = createAdminClient();
  const { error } = await client.from('sponsors').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/sponsors');
  revalidatePath('/sponsors');
  revalidatePath('/');
  return { success: true };
}

/**
 * Saves a sponsor inquiry to the leads table (public client, subject to RLS).
 * Returns the Stripe payment URL for the requested tier so the client can redirect.
 */
export async function submitSponsorLead(formData: FormData) {
  const { createPublicClient } = await import('@/lib/supabase/public');
  const { getLang } = await import('@/lib/i18n/getLang');
  const client = createPublicClient();
  const lang = await getLang();

  const name  = (formData.get('name')  as string)?.trim();
  const email = (formData.get('email') as string)?.trim();

  if (!name || name.length > 200) return { error: lang === 'en' ? 'Name is required.' : 'Nombre requerido.' };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: lang === 'en' ? 'Invalid email.' : 'Email inválido.' };
  }

  const tier    = (formData.get('tier')    as string)?.trim() || 'pink';
  const phone   = (formData.get('phone')   as string)?.trim() || null;
  const company = (formData.get('company') as string)?.trim() || null;
  const message = (formData.get('message') as string)?.trim() || null;

  const { error } = await client.from('leads').insert({
    name,
    email,
    phone,
    interest: `sponsor-${tier}`,
    message: [company ? `Empresa: ${company}` : null, message].filter(Boolean).join(' | ') || null,
    source: 'sponsor-page',
    status: 'new',
  });

  if (error) return { error: error.message };

  // Stripe payment links per tier — replace with real URLs from Stripe dashboard
  const STRIPE_LINKS: Record<string, string> = {
    platinum: process.env.NEXT_PUBLIC_STRIPE_PLATINUM ?? '/contact',
    silver:   process.env.NEXT_PUBLIC_STRIPE_SILVER   ?? '/contact',
    blue:     process.env.NEXT_PUBLIC_STRIPE_BLUE     ?? '/contact',
    pink:     process.env.NEXT_PUBLIC_STRIPE_PINK     ?? '/contact',
  };

  const redirectUrl = STRIPE_LINKS[tier] ?? '/contact';
  revalidatePath('/admin/leads');
  return { success: true, redirectUrl };
}
