-- ── Real Happiness — Confirmed Speakers ─────────────────────
-- Stores the list of confirmed speakers shown in the
-- "Speakers Confirmados" section of /the-real-happiness.
-- Replaces the hardcoded CONFIRMED_SPEAKERS array in code so
-- admins can add/edit/delete speakers from /admin/real-happiness.
--
-- Run this in: Supabase Dashboard → SQL Editor

create table if not exists public.real_happiness_speakers (
  id          uuid        default gen_random_uuid() primary key,
  name        text        not null,
  topic_es    text        not null default '',
  topic_en    text        not null default '',
  image_url   text,
  sort_order  integer     not null default 0,
  active      boolean     not null default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Row Level Security
alter table public.real_happiness_speakers enable row level security;

create policy "public read active real_happiness_speakers"
  on public.real_happiness_speakers for select
  using (active = true);

-- Service role key bypasses RLS; no write policy needed for admin client.

-- Seed with the current hardcoded speakers (preserve current ordering)
insert into public.real_happiness_speakers (name, topic_es, topic_en, sort_order) values
  ('María Alejandra Celis', 'El ritmo de la felicidad: pausa, siente, avanza.',                                            'The rhythm of happiness: pause, feel, move forward.',                                       0),
  ('Antonella Baricelli',   'Liderazgo consciente y comunicación con propósito.',                                          'Conscious leadership and purposeful communication.',                                        1),
  ('Alexandra Ramírez',     'Cómo la felicidad libera emociones y nos protege de la enfermedad.',                          'How happiness unlocks emotions and frees us from disease.',                                 2),
  ('Yordamis Megret',       'Felicidad financiera: salud, libertad y decisiones.',                                         'Financial happiness: health, freedom, and decisions.',                                      3),
  ('Carlos Calderón',       'Soy feliz: relaciones significativas y una sana relación con uno mismo.',                     'I am happy: meaningful relationships and a healthy relationship with yourself.',            4),
  ('Jesmig Hernández',      'Cómo construir una relación sana. Los 7 pilares de una relación consciente.',                 'How to build a healthy relationship. The 7 pillars of a conscious relationship.',           5),
  ('Jhonny Aponza',         'Felicidad: entrenando la mente más allá del éxito.',                                          'Happiness: training the mind beyond success.',                                              6),
  ('César Jaime',           'Cómo construir una relación sana. Los 7 pilares de una relación consciente.',                 'How to build a healthy relationship. The 7 pillars of a conscious relationship.',           7),
  ('Eliecer Marte',         'Gratitud: la práctica que transforma vidas.',                                                 'Thankfulness: the practice that transforms lives.',                                         8),
  ('Jimmy Arenas',          'Tu conocimiento es tu mayor activo.',                                                         'Your knowledge is your greatest asset.',                                                    9),
  ('Silvia Cobos',          'Invierte en ti: convierte los miedos que te paralizan en tu mayor punto de venta.',           'Invest in yourself: turn the fears that paralyze you into your greatest selling point.',   10)
on conflict do nothing;
