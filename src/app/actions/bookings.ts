'use server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { createPublicClient } from '@/lib/supabase/public';

export async function submitBooking(formData: FormData) {
  const client = createPublicClient();

  const name  = (formData.get('name')  as string)?.trim();
  const email = (formData.get('email') as string)?.trim();

  if (!name || name.length > 200) return { error: 'Nombre requerido.' };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Email inválido.' };
  }

  const guests = parseInt((formData.get('guests') as string) ?? '1', 10);

  const { error } = await client.from('bookings').insert({
    name,
    email,
    phone:        (formData.get('phone')      as string)?.trim() || null,
    event_name:   (formData.get('event_name') as string)?.trim() || null,
    booking_type: 'website',
    guests:       isNaN(guests) || guests < 1 ? 1 : guests,
    notes:        (formData.get('message')    as string)?.trim() || null,
    source:       'website',
    status:       'pending',
    submitted_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };
  return { success: true };
}

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
