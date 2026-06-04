-- ============================================================
--  ME Producciones — Configurable named ticket tiers per event
--  Run in: Supabase Dashboard → SQL Editor
--  Date: 2026-06-04
--
--  Adds a `ticket_tiers` JSONB array to `events` so the admin can
--  define unlimited named ticket types per event, each with its own
--  price and benefits — e.g.
--    [
--      {"name":"Platinum Experience Table (10 seats)","price":1500,"benefits":["..."]},
--      {"name":"Golden VIP Table (10 seats)","price":1400,"benefits":["..."]},
--      {"name":"Per person","price":150,"benefits":[]}
--    ]
--
--  Safe / additive: defaults to '[]'. The app keeps the legacy
--  price / price_vip / vip_benefits columns and derives "Regular"/"VIP"
--  tiers from them whenever ticket_tiers is empty, so existing events
--  render unchanged until an admin defines explicit tiers.
-- ============================================================

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS ticket_tiers jsonb NOT NULL DEFAULT '[]'::jsonb;
