-- Adds Eventbrite payment link as a second checkout option alongside Zelle.
-- Null for events without an Eventbrite setup — UI falls back to Zelle only.
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS eventbrite_url text DEFAULT NULL;
