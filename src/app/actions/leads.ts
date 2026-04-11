'use server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

export async function updateLeadStatus(id: string, status: string, notes?: string) {
  const client = createAdminClient();
  const { error } = await client.from('leads').update({ status, internal_notes: notes ?? undefined, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/leads');
  return { success: true };
}

export async function getLeads() {
  const client = createAdminClient();
  const { data, error } = await client.from('leads').select('*').order('created_at', { ascending: false });
  return { data: data ?? [], error: error?.message ?? null };
}

export async function submitContact(formData: FormData) {
  const client = createAdminClient();
  const { error } = await client.from('leads').insert({
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: (formData.get('phone') as string) || null,
    interest: (formData.get('inquiryType') as string) || null,
    message: (formData.get('message') as string) || null,
    source: 'website',
    status: 'new',
  });
  if (error) return { error: error.message };
  return { success: true };
}
