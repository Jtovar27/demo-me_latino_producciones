-- ============================================================
--  ME Producciones — Speaker / Sponsor display ordering
--  Run in: Supabase Dashboard → SQL Editor
--  Date: 2026-04-29
--
--  Adds a `sort_order` integer to both `speakers` and `sponsors`
--  so the admin can control the display order from the dashboard.
--
--  Safe / additive: defaults to 0 for existing rows. The app falls
--  back to `created_at` as a secondary sort, so behavior is
--  unchanged until an admin reorders.
-- ============================================================

-- Speakers — global display order
ALTER TABLE public.speakers
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS speakers_sort_order_idx
  ON public.speakers (sort_order, created_at DESC);

-- Sponsors — display order is per-tier (admin reorders within each tier)
ALTER TABLE public.sponsors
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS sponsors_tier_sort_idx
  ON public.sponsors (tier, sort_order, created_at DESC);
