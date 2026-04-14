'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

export async function getSponsors() {
  const client = createAdminClient();
  const { data, error } = await client
    .from('sponsors')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}

export async function upsertSponsor(formData: FormData) {
  const client = createAdminClient();
  const id = formData.get('id') as string | null;

  const payload = {
    name: formData.get('name') as string,
    tier: formData.get('tier') as string,
    website: (formData.get('website') as string) || null,
    description: (formData.get('description') as string) || null,
    logo_url: (formData.get('logo_url') as string) || null,
    active: true,
  };

  if (id) {
    const { error } = await client.from('sponsors').update(payload).eq('id', id);
    if (error) return { error: error.message };
  } else {
    const { error } = await client.from('sponsors').insert(payload);
    if (error) return { error: error.message };
  }

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
  const client = createPublicClient();

  const name  = (formData.get('name')  as string)?.trim();
  const email = (formData.get('email') as string)?.trim();

  if (!name || name.length > 200) return { error: 'Nombre requerido.' };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Email inválido.' };
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
