-- ============================================================
--  ME Producciones — Supabase Schema
--  Ejecuta esto en: Supabase Dashboard → SQL Editor
-- ============================================================

-- EVENTS
create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  date date not null,
  end_date date,
  city text not null default '',
  state text not null default '',
  venue text not null default '',
  category text not null default 'community',
  status text not null default 'upcoming',
  description text,
  image_url text,
  video_url text,
  capacity integer default 0,
  registered integer default 0,
  price numeric(10,2) default 0,
  featured boolean default false,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- SPEAKERS
create table if not exists public.speakers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  title text,
  organization text,
  bio text,
  image_url text,
  expertise text[] default '{}',
  featured boolean default false,
  instagram text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- EXPERIENCES
create table if not exists public.experiences (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  category text not null default 'community',
  short_desc text,
  description text,
  image_url text,
  video_url text,
  featured boolean default false,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- SPONSORS
create table if not exists public.sponsors (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  tier text not null default 'partner',
  website text,
  logo_url text,
  description text,
  active boolean default true,
  created_at timestamptz default now()
);

-- GALLERY ITEMS (images + videos in storage)
create table if not exists public.gallery_items (
  id uuid default gen_random_uuid() primary key,
  storage_path text not null,
  public_url text not null,
  alt text,
  media_type text not null default 'image',
  category text,
  featured boolean default false,
  thumbnail_url text,
  duration integer,
  file_size bigint,
  mime_type text,
  created_at timestamptz default now()
);

-- LEADS (contact form + manual)
create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text,
  interest text,
  message text,
  status text not null default 'new',
  source text default 'website',
  internal_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- BOOKINGS
create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text,
  event_id uuid references public.events(id) on delete set null,
  event_name text,
  booking_type text,
  guests integer default 1,
  source text,
  status text not null default 'pending',
  notes text,
  internal_notes text,
  follow_up boolean default false,
  amount numeric(10,2) default 0,
  submitted_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- REVIEWS / TESTIMONIALS
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text,
  role text,
  company text,
  event_id uuid references public.events(id) on delete set null,
  event_name text,
  rating integer check (rating >= 1 and rating <= 5),
  text text,
  status text not null default 'pending',
  featured boolean default false,
  submitted_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- SITE CONFIG (single row)
create table if not exists public.site_config (
  id integer primary key default 1 check (id = 1),
  total_events integer default 45,
  total_attendees integer default 18500,
  total_speakers integer default 72,
  cities_reached integer default 8,
  years_active integer default 4,
  satisfaction integer default 97,
  site_name text default 'ME Producciones',
  site_tagline text default 'Experiencias que transforman.',
  contact_email text default 'hola@melatinopr.com',
  instagram_url text,
  linkedin_url text,
  facebook_url text,
  updated_at timestamptz default now()
);
insert into public.site_config (id) values (1) on conflict (id) do nothing;

-- ── Row Level Security ───────────────────────────────────────
alter table public.events enable row level security;
alter table public.speakers enable row level security;
alter table public.experiences enable row level security;
alter table public.sponsors enable row level security;
alter table public.gallery_items enable row level security;
alter table public.leads enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.site_config enable row level security;

-- Public reads
create policy "public read events" on public.events for select using (true);
create policy "public read speakers" on public.speakers for select using (true);
create policy "public read experiences" on public.experiences for select using (true);
create policy "public read sponsors" on public.sponsors for select using (active = true);
create policy "public read gallery" on public.gallery_items for select using (true);
create policy "public read site_config" on public.site_config for select using (true);
create policy "public read published reviews" on public.reviews for select using (status = 'published');

-- Public insert for leads/bookings (contact form, booking form)
create policy "public insert leads" on public.leads for insert with check (true);
create policy "public insert bookings" on public.bookings for insert with check (true);
create policy "public insert reviews" on public.reviews for insert with check (true);

-- ── Storage Bucket ───────────────────────────────────────────
-- Run this in Supabase SQL editor (Storage section):
insert into storage.buckets (id, name, public)
values ('meproducciones-media', 'meproducciones-media', true)
on conflict (id) do nothing;

create policy "public read media" on storage.objects
  for select using (bucket_id = 'meproducciones-media');
create policy "service role upload" on storage.objects
  for insert with check (bucket_id = 'meproducciones-media');
create policy "service role update" on storage.objects
  for update using (bucket_id = 'meproducciones-media');
create policy "service role delete" on storage.objects
  for delete using (bucket_id = 'meproducciones-media');
