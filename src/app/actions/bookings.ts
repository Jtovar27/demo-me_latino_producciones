'use server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

export async function updateBooking(id: string, updates: { status?: string; internal_notes?: string; follow_up?: boolean }) {
  const client = createAdminClient();
  const { error } = await client.from('bookings').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/bookings');
  return { success: true };
}

export async function getBookings() {
  const client = createAdminClient();
  const { data, error } = await client.from('bookings').select('*').order('submitted_at', { ascending: false });
  return { data: data ?? [], error: error?.message ?? null };
}
