-- Adds English translation columns to events, experiences, speakers, and sponsors.
-- Existing rows keep NULL for _en fields; the app falls back to the Spanish field when NULL.

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS title_en       TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT;

ALTER TABLE experiences
  ADD COLUMN IF NOT EXISTS title_en       TEXT,
  ADD COLUMN IF NOT EXISTS short_desc_en  TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT;

ALTER TABLE speakers
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS bio_en   TEXT;

ALTER TABLE sponsors
  ADD COLUMN IF NOT EXISTS description_en TEXT;
