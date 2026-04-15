-- ============================================================
--  ME Producciones — CMS Expansion Migration
--  Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. HERO SLIDES ────────────────────────────────────────────
create table if not exists public.hero_slides (
  id           uuid default gen_random_uuid() primary key,
  image_url    text not null,
  alt_es       text not null default '',
  alt_en       text not null default '',
  category_es  text not null default '',
  category_en  text not null default '',
  title_es     text not null default '',
  title_en     text not null default '',
  location     text not null default '',
  cta_label_es text,
  cta_label_en text,
  cta_href     text,
  sort_order   integer not null default 0,
  active       boolean not null default true,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Seed with current hardcoded slides so there is always content
insert into public.hero_slides (image_url, alt_es, alt_en, category_es, category_en, title_es, title_en, location, sort_order, active)
values
  (
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80',
    'The Real Happiness MasterClass en Miami',
    'The Real Happiness MasterClass in Miami',
    'Evento Insignia', 'Flagship Event',
    'The Real Happiness', 'The Real Happiness',
    'Miami, FL · 2026', 0, true
  ),
  (
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1400&q=80',
    'Raíces Summit en New York',
    'Raíces Summit in New York',
    'Summit', 'Summit',
    'Raíces Summit', 'Raíces Summit',
    'New York, NY · 2025', 1, true
  ),
  (
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1400&q=80',
    'Speaker en escenario durante evento de ME Producciones',
    'Speaker on stage at a ME Producciones event',
    'Speakers', 'Speakers',
    'Speakers Internacionales', 'International Speakers',
    'Los Angeles, CA · 2024', 2, true
  ),
  (
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1400&q=80',
    'Bienestar Wellness Retreat',
    'Wellness Retreat',
    'Bienestar', 'Wellness',
    'Bienestar Retreat', 'Wellness Retreat',
    'Los Angeles, CA · 2025', 3, true
  ),
  (
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=80',
    'Comunidad en Acción en Houston',
    'Community in Action in Houston',
    'Comunidad', 'Community',
    'Comunidad en Acción', 'Community in Action',
    'Houston, TX · 2025', 4, true
  )
on conflict do nothing;

-- RLS for hero_slides
alter table public.hero_slides enable row level security;
create policy "public read active hero slides"
  on public.hero_slides for select using (active = true);

-- ── 2. EXPAND SITE_CONFIG ─────────────────────────────────────
-- Hero text (bilingual)
alter table public.site_config
  add column if not exists hero_badge_es    text default 'Productora de experiencias · Desde 2019',
  add column if not exists hero_badge_en    text default 'Experience producer · Since 2019',
  add column if not exists hero_headline_es text default 'Producimos experiencias que transforman.',
  add column if not exists hero_headline_en text default 'We produce experiences that transform.',
  add column if not exists hero_body_es     text default 'Somos ME Producciones — la empresa detrás de los eventos que mueven comunidades. Speakers internacionales, herramientas reales y escenarios diseñados para transformar tu vida y tu negocio.',
  add column if not exists hero_body_en     text default 'We are ME Producciones — the company behind events that move communities. International speakers, real tools, and stages designed to transform your life and business.',
  add column if not exists hero_cta_primary_label_es   text default 'Ver experiencias',
  add column if not exists hero_cta_primary_label_en   text default 'View experiences',
  add column if not exists hero_cta_primary_href       text default '/experiences',
  add column if not exists hero_cta_secondary_label_es text default 'Próximos eventos',
  add column if not exists hero_cta_secondary_label_en text default 'Upcoming events',
  add column if not exists hero_cta_secondary_href     text default '/events',
  -- Brand statement (bilingual)
  add column if not exists brand_quote_es text default 'No producimos eventos. Producimos posibilidad.',
  add column if not exists brand_quote_en text default 'We don''t produce events. We produce possibility.',
  add column if not exists brand_body_es  text default 'ME Producciones nació para crear los escenarios donde ocurre la transformación — summits, masterclasses y experiencias de crecimiento personal y empresarial que conectan líderes, emprendedores y visionarios de toda la región.',
  add column if not exists brand_body_en  text default 'ME Producciones was born to create the stages where transformation happens — summits, masterclasses, and personal and business growth experiences that connect leaders, entrepreneurs, and visionaries across the region.',
  -- Extra social links
  add column if not exists twitter_url   text,
  add column if not exists youtube_url   text,
  add column if not exists whatsapp_url  text,
  add column if not exists tiktok_url    text;

-- Back-fill the new columns for the existing row
update public.site_config set updated_at = now() where id = 1;
