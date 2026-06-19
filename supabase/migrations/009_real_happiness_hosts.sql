-- ── Real Happiness — Hosts (Conducción) ─────────────────────
-- Stores the hosts shown in the "Hosted by / Conducción" section
-- of /the-real-happiness. Replaces the hardcoded host1/host2 copy
-- in code so admins can change the image, name, subtitle (role)
-- and description of each host from /admin/real-happiness.
--
-- Subtitle (role) and description are bilingual to keep the public
-- page rendering the right language per visitor.
--
-- Run this in: Supabase Dashboard → SQL Editor

create table if not exists public.real_happiness_hosts (
  id          uuid        default gen_random_uuid() primary key,
  name        text        not null,
  role_es     text        not null default '',
  role_en     text        not null default '',
  bio_es      text        not null default '',
  bio_en      text        not null default '',
  image_url   text,
  sort_order  integer     not null default 0,
  active      boolean     not null default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Row Level Security
alter table public.real_happiness_hosts enable row level security;

create policy "public read active real_happiness_hosts"
  on public.real_happiness_hosts for select
  using (active = true);

-- Service role key bypasses RLS; no write policy needed for admin client.

-- Seed with the current hardcoded hosts (preserve current ordering + copy).
-- Mónica keeps her existing static photo; Joyce starts with no photo so the
-- admin can upload one (the public page still falls back to the speakers table
-- match until then).
insert into public.real_happiness_hosts (name, role_es, role_en, bio_es, bio_en, image_url, sort_order) values
  (
    'Mónica Espinoza',
    'CEO & Fundadora · ME Producciones',
    'CEO & Founder · ME Producciones',
    'Líder en entretenimiento y producción de eventos corporativos, Mónica es reconocida por crear experiencias con propósito en Estados Unidos y Ecuador. ME Producciones se especializa en eventos que inspiran y entretienen — incluyendo el Stand Up Latin Tour en Ecuador y activaciones de marca a gran escala reconocidas por su mérito cultural.',
    'A leader in entertainment and corporate event production, Mónica is known for creating purposeful experiences across the United States and Ecuador. ME Producciones specializes in events that inspire and entertain — including the Stand Up Latin Tour in Ecuador and large-scale brand activations recognized for their cultural merit.',
    '/MEspinoza.jpg.png',
    0
  ),
  (
    'Joyce Urdaneta',
    'Host · El Sol Network TV Orlando',
    'Host · El Sol Network TV Orlando',
    'Comunicadora, escritora y coach, Joyce promueve la felicidad, el bienestar y el desarrollo personal en cada plataforma donde participa. Conductora de "De Noche y Sin Sueño con Joy", aporta calidez, profundidad y presencia — y será la host de The Real Happiness Experience en escena.',
    'Communicator, writer, and coach, Joyce promotes happiness, well-being, and personal development through every platform she touches. Host of "De Noche y Sin Sueño con Joy", she brings warmth, depth, and presence — and will host The Real Happiness Experience on stage.',
    null,
    1
  )
on conflict do nothing;
