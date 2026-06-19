-- Adds a TicketPlate checkout link as another payment option alongside
-- Eventbrite and Zelle. Null for events without a TicketPlate setup —
-- the UI simply omits the button.
--
-- Run this in: Supabase Dashboard → SQL Editor
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS ticketplate_url text DEFAULT NULL;
