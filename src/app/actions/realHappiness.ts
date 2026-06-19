'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import type { DBRealHappinessSpeaker, DBRealHappinessHost } from '@/types/supabase';

/**
 * Static fallback used when the `real_happiness_speakers` table doesn't exist
 * yet (i.e. before migration 007 has been run in Supabase). Keeps the public
 * page rendering the previous hardcoded list instead of going blank.
 *
 * Once the migration runs and the table is seeded, the DB rows take over.
 */
const FALLBACK_SPEAKERS: DBRealHappinessSpeaker[] = [
  ['María Alejandra Celis', 'El ritmo de la felicidad: pausa, siente, avanza.',                                            'The rhythm of happiness: pause, feel, move forward.'],
  ['Antonella Baricelli',   'Liderazgo consciente y comunicación con propósito.',                                          'Conscious leadership and purposeful communication.'],
  ['Alexandra Ramírez',     'Cómo la felicidad libera emociones y nos protege de la enfermedad.',                          'How happiness unlocks emotions and frees us from disease.'],
  ['Yordamis Megret',       'Felicidad financiera: salud, libertad y decisiones.',                                         'Financial happiness: health, freedom, and decisions.'],
  ['Carlos Calderón',       'Soy feliz: relaciones significativas y una sana relación con uno mismo.',                     'I am happy: meaningful relationships and a healthy relationship with yourself.'],
  ['Jesmig Hernández',      'Cómo construir una relación sana. Los 7 pilares de una relación consciente.',                 'How to build a healthy relationship. The 7 pillars of a conscious relationship.'],
  ['Jhonny Aponza',         'Felicidad: entrenando la mente más allá del éxito.',                                          'Happiness: training the mind beyond success.'],
  ['César Jaime',           'Cómo construir una relación sana. Los 7 pilares de una relación consciente.',                 'How to build a healthy relationship. The 7 pillars of a conscious relationship.'],
  ['Eliecer Marte',         'Gratitud: la práctica que transforma vidas.',                                                 'Thankfulness: the practice that transforms lives.'],
  ['Jimmy Arenas',          'Tu conocimiento es tu mayor activo.',                                                         'Your knowledge is your greatest asset.'],
  ['Silvia Cobos',          'Invierte en ti: convierte los miedos que te paralizan en tu mayor punto de venta.',           'Invest in yourself: turn the fears that paralyze you into your greatest selling point.'],
].map(([name, topic_es, topic_en], i) => ({
  id:         `fallback-${i}`,
  name,
  topic_es,
  topic_en,
  image_url:  null,
  sort_order: i,
  active:     true,
  created_at: '1970-01-01T00:00:00.000Z',
  updated_at: '1970-01-01T00:00:00.000Z',
}));

function isMissingTable(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  // Postgres "undefined_table" code = 42P01
  return error.code === '42P01' || /relation .* does not exist/i.test(error.message ?? '');
}

/**
 * Public-facing fetch — only active rows, ordered for display on /the-real-happiness.
 * Falls back to the static list if the table hasn't been migrated yet.
 */
export async function getRealHappinessSpeakers(): Promise<{
  data: DBRealHappinessSpeaker[];
  error: string | null;
}> {
  const client = createAdminClient();
  const { data, error } = await client
    .from('real_happiness_speakers')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) {
    if (isMissingTable(error)) {
      return { data: FALLBACK_SPEAKERS, error: null };
    }
    return { data: [], error: error.message };
  }
  return { data: (data as DBRealHappinessSpeaker[]) ?? [], error: null };
}

/**
 * Admin-facing fetch — includes inactive rows.
 */
export async function getAllRealHappinessSpeakers(): Promise<{
  data: DBRealHappinessSpeaker[];
  error: string | null;
}> {
  const client = createAdminClient();
  const { data, error } = await client
    .from('real_happiness_speakers')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) return { data: [], error: error.message };
  return { data: (data as DBRealHappinessSpeaker[]) ?? [], error: null };
}

export async function upsertRealHappinessSpeaker(formData: FormData) {
  const client = createAdminClient();
  const id = formData.get('id') as string | null;

  const name = (formData.get('name') as string | null)?.trim();
  if (!name) return { error: 'El nombre es requerido.' };

  const payload: Partial<DBRealHappinessSpeaker> = {
    name,
    topic_es:  ((formData.get('topic_es')  as string | null) ?? '').trim(),
    topic_en:  ((formData.get('topic_en')  as string | null) ?? '').trim(),
    image_url: ((formData.get('image_url') as string | null) ?? '').trim() || null,
    active:    formData.get('active') === 'true',
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { error } = await client
      .from('real_happiness_speakers')
      .update(payload)
      .eq('id', id);
    if (error) return { error: error.message };
  } else {
    // New rows go to the end of the list
    const { data: maxRow } = await client
      .from('real_happiness_speakers')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();
    payload.sort_order = ((maxRow?.sort_order as number | undefined) ?? -1) + 1;

    const { error } = await client.from('real_happiness_speakers').insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath('/admin/real-happiness');
  revalidatePath('/the-real-happiness');
  return { success: true };
}

export async function deleteRealHappinessSpeaker(id: string) {
  const client = createAdminClient();
  const { error } = await client
    .from('real_happiness_speakers')
    .delete()
    .eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/admin/real-happiness');
  revalidatePath('/the-real-happiness');
  return { success: true };
}

/**
 * Rewrites sort_order for the given speaker ids: position 0..n.
 * Admin always sends the full list, so this is conflict-free.
 */
export async function reorderRealHappinessSpeakers(orderedIds: string[]) {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return { error: 'No speakers to reorder.' };
  }
  const client = createAdminClient();
  const stamp = new Date().toISOString();

  const updates = orderedIds.map((id, index) =>
    client
      .from('real_happiness_speakers')
      .update({ sort_order: index, updated_at: stamp })
      .eq('id', id),
  );
  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };

  revalidatePath('/admin/real-happiness');
  revalidatePath('/the-real-happiness');
  return { success: true };
}

// ── Hosts (Conducción) ───────────────────────────────────────────────────────

/**
 * Static fallback used when the `real_happiness_hosts` table doesn't exist yet
 * (i.e. before migration 009 has been run in Supabase). Keeps the public page
 * rendering the previous hardcoded hosts instead of going blank.
 *
 * Once the migration runs and the table is seeded, the DB rows take over.
 */
const FALLBACK_HOSTS: DBRealHappinessHost[] = [
  {
    name:    'Mónica Espinoza',
    role_es: 'CEO & Fundadora · ME Producciones',
    role_en: 'CEO & Founder · ME Producciones',
    bio_es:  'Líder en entretenimiento y producción de eventos corporativos, Mónica es reconocida por crear experiencias con propósito en Estados Unidos y Ecuador. ME Producciones se especializa en eventos que inspiran y entretienen — incluyendo el Stand Up Latin Tour en Ecuador y activaciones de marca a gran escala reconocidas por su mérito cultural.',
    bio_en:  'A leader in entertainment and corporate event production, Mónica is known for creating purposeful experiences across the United States and Ecuador. ME Producciones specializes in events that inspire and entertain — including the Stand Up Latin Tour in Ecuador and large-scale brand activations recognized for their cultural merit.',
    image_url: '/MEspinoza.jpg.png',
  },
  {
    name:    'Joyce Urdaneta',
    role_es: 'Host · El Sol Network TV Orlando',
    role_en: 'Host · El Sol Network TV Orlando',
    bio_es:  'Comunicadora, escritora y coach, Joyce promueve la felicidad, el bienestar y el desarrollo personal en cada plataforma donde participa. Conductora de "De Noche y Sin Sueño con Joy", aporta calidez, profundidad y presencia — y será la host de The Real Happiness Experience en escena.',
    bio_en:  'Communicator, writer, and coach, Joyce promotes happiness, well-being, and personal development through every platform she touches. Host of "De Noche y Sin Sueño con Joy", she brings warmth, depth, and presence — and will host The Real Happiness Experience on stage.',
    image_url: null,
  },
].map((h, i) => ({
  id:         `fallback-host-${i}`,
  sort_order: i,
  active:     true,
  created_at: '1970-01-01T00:00:00.000Z',
  updated_at: '1970-01-01T00:00:00.000Z',
  ...h,
}));

/**
 * Public-facing fetch — only active rows, ordered for display on
 * /the-real-happiness. Falls back to the static hosts if the table hasn't been
 * migrated yet.
 */
export async function getRealHappinessHosts(): Promise<{
  data: DBRealHappinessHost[];
  error: string | null;
}> {
  const client = createAdminClient();
  const { data, error } = await client
    .from('real_happiness_hosts')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) {
    if (isMissingTable(error)) {
      return { data: FALLBACK_HOSTS, error: null };
    }
    return { data: [], error: error.message };
  }
  return { data: (data as DBRealHappinessHost[]) ?? [], error: null };
}

/**
 * Admin-facing fetch — includes inactive rows.
 */
export async function getAllRealHappinessHosts(): Promise<{
  data: DBRealHappinessHost[];
  error: string | null;
}> {
  const client = createAdminClient();
  const { data, error } = await client
    .from('real_happiness_hosts')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) return { data: [], error: error.message };
  return { data: (data as DBRealHappinessHost[]) ?? [], error: null };
}

export async function upsertRealHappinessHost(formData: FormData) {
  const client = createAdminClient();
  const id = formData.get('id') as string | null;

  const name = (formData.get('name') as string | null)?.trim();
  if (!name) return { error: 'El nombre es requerido.' };

  const payload: Partial<DBRealHappinessHost> = {
    name,
    role_es:   ((formData.get('role_es')   as string | null) ?? '').trim(),
    role_en:   ((formData.get('role_en')   as string | null) ?? '').trim(),
    bio_es:    ((formData.get('bio_es')    as string | null) ?? '').trim(),
    bio_en:    ((formData.get('bio_en')    as string | null) ?? '').trim(),
    image_url: ((formData.get('image_url') as string | null) ?? '').trim() || null,
    active:    formData.get('active') === 'true',
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { error } = await client
      .from('real_happiness_hosts')
      .update(payload)
      .eq('id', id);
    if (error) return { error: error.message };
  } else {
    // New rows go to the end of the list
    const { data: maxRow } = await client
      .from('real_happiness_hosts')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();
    payload.sort_order = ((maxRow?.sort_order as number | undefined) ?? -1) + 1;

    const { error } = await client.from('real_happiness_hosts').insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath('/admin/real-happiness');
  revalidatePath('/the-real-happiness');
  return { success: true };
}

export async function deleteRealHappinessHost(id: string) {
  const client = createAdminClient();
  const { error } = await client
    .from('real_happiness_hosts')
    .delete()
    .eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/admin/real-happiness');
  revalidatePath('/the-real-happiness');
  return { success: true };
}

/**
 * Rewrites sort_order for the given host ids: position 0..n.
 * Admin always sends the full list, so this is conflict-free.
 */
export async function reorderRealHappinessHosts(orderedIds: string[]) {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return { error: 'No hosts to reorder.' };
  }
  const client = createAdminClient();
  const stamp = new Date().toISOString();

  const updates = orderedIds.map((id, index) =>
    client
      .from('real_happiness_hosts')
      .update({ sort_order: index, updated_at: stamp })
      .eq('id', id),
  );
  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };

  revalidatePath('/admin/real-happiness');
  revalidatePath('/the-real-happiness');
  return { success: true };
}
