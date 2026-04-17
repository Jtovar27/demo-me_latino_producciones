-- ── Flagship Events ──────────────────────────────────────────
-- Stores carousel items for the "Evento Insignia" homepage section.
-- Each row = one complete flagship event with bilingual content
-- and a JSONB array of venue stops.
--
-- Run this in: Supabase Dashboard → SQL Editor

create table if not exists public.flagship_events (
  id          uuid        default gen_random_uuid() primary key,
  title       text        not null,
  description_es text,
  description_en text,
  venues      jsonb       not null default '[]'::jsonb,
  sort_order  integer     not null default 0,
  active      boolean     not null default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Row Level Security
alter table public.flagship_events enable row level security;

create policy "public read active flagship_events"
  on public.flagship_events for select
  using (active = true);

-- Service role key bypasses RLS; no write policy needed for admin client.

-- Seed: migrate the current hardcoded event into the table
insert into public.flagship_events (title, description_es, description_en, venues, sort_order)
values (
  'The Real Happiness MasterClass Summit III',
  'Nuestro evento insignia llega a tres sedes en 2026 — Miami, Samborondón y Orlando. Un día de experiencia, herramientas y comunidad que te cambia para siempre.',
  'Our flagship event comes to three venues in 2026 — Miami, Samborondón, and Orlando. One day of experience, tools, and community that changes you forever.',
  '[
    {"city":"Miami","region":"Florida, USA","date_es":"Agosto 29, 2026","date_en":"August 29, 2026","tag_es":"Primera sede","tag_en":"1st venue"},
    {"city":"Samborondón","region":"Ecuador","date_es":"Septiembre 2026","date_en":"September 2026","tag_es":"Segunda sede","tag_en":"2nd venue"},
    {"city":"Orlando","region":"Florida, USA","date_es":"Octubre 11, 2026","date_en":"October 11, 2026","tag_es":"Tercera sede","tag_en":"3rd venue"}
  ]'::jsonb,
  0
)
on conflict do nothing;
