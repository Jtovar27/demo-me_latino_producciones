'use server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { createPublicClient } from '@/lib/supabase/public';

const VALID_LEAD_STATUSES = ['new', 'contacted', 'qualified', 'converted', 'closed'] as const;
type LeadStatus = typeof VALID_LEAD_STATUSES[number];

export async function updateLeadStatus(id: string, status: string, notes?: string) {
  if (!VALID_LEAD_STATUSES.includes(status as LeadStatus)) {
    return { error: `Estado inválido: ${status}` };
  }
  const client = createAdminClient();
  const { error } = await client
    .from('leads')
    .update({
      status,
      internal_notes: notes ?? undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/leads');
  return { success: true };
}

export async function getLeads() {
  const client = createAdminClient();
  const { data, error } = await client
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });
  return { data: data ?? [], error: error?.message ?? null };
}

export async function submitContact(formData: FormData) {
  // Use public client — subject to RLS, not service-role
  const client = createPublicClient();

  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim();

  if (!name || name.length > 200) return { error: 'Nombre requerido.' };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Email inválido.' };
  }

  const { error } = await client.from('leads').insert({
    name,
    email,
    phone: (formData.get('phone') as string)?.trim() || null,
    interest: (formData.get('inquiryType') as string)?.trim() || null,
    message: (formData.get('message') as string)?.trim() || null,
    source: 'website',
    status: 'new',
  });
  if (error) return { error: error.message };
  return { success: true };
}
