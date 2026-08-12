-- ============================================================
--  ME Producciones — 011: Security hardening (RLS + storage)
--  Idempotent. Run in Supabase SQL Editor (or via the CLI).
--
--  Fixes (see AUDIT_STATUS.md):
--   - DB-1: storage policies named "service role" actually allowed ANY anon key
--           holder to INSERT/UPDATE/DELETE objects in the public media bucket.
--   - DB-2: `public insert reviews` used `with check (true)` — anyone could
--           self-publish and self-feature a testimonial straight onto the homepage.
--   - leads/bookings: anonymous INSERT was unbounded and could set admin-only
--           columns (status, internal_notes, follow_up, amount).
--   - reviews email column was readable by the anon key.
--
--  These policies enforce, at the data layer, exactly what the public server
--  actions already send — so legitimate contact/booking/review submissions keep
--  working while direct anon-key API abuse is blocked. The service-role admin
--  client bypasses RLS and is unaffected.
-- ============================================================

-- ── Storage: media bucket writes are service-role only ───────────────────────
-- Drop the mis-scoped policies (their names claimed "service role" but they had
-- no role clause, so anon/authenticated could write and delete).
drop policy if exists "service role upload" on storage.objects;
drop policy if exists "service role update" on storage.objects;
drop policy if exists "service role delete" on storage.objects;
-- Recreate scoped to service_role only. (The service role bypasses RLS, so these
-- are primarily explicit documentation; the security win is that no anon-writable
-- policy remains, so anon/authenticated fall through to default-deny.)
create policy "media service-role insert" on storage.objects
  for insert to service_role with check (bucket_id = 'meproducciones-media');
create policy "media service-role update" on storage.objects
  for update to service_role using (bucket_id = 'meproducciones-media');
create policy "media service-role delete" on storage.objects
  for delete to service_role using (bucket_id = 'meproducciones-media');
-- Public read of the (public) media bucket is intentional and preserved.
drop policy if exists "public read media" on storage.objects;
create policy "public read media" on storage.objects
  for select using (bucket_id = 'meproducciones-media');

-- ── reviews: bound the public insert; block self-publish / self-feature ──────
drop policy if exists "public insert reviews" on public.reviews;
create policy "public insert reviews" on public.reviews
  for insert to anon, authenticated
  with check (
    status = 'pending'
    and featured = false
    and char_length(name) between 1 and 200
    and (email is null or char_length(email) <= 320)
    and (role is null or char_length(role) <= 200)
    and (company is null or char_length(company) <= 200)
    and (event_name is null or char_length(event_name) <= 200)
    and (text is null or char_length(text) <= 5000)
    and (rating is null or rating between 1 and 5)
  );

-- ── leads: bound the public insert; force safe status; block internal columns ─
drop policy if exists "public insert leads" on public.leads;
create policy "public insert leads" on public.leads
  for insert to anon, authenticated
  with check (
    status = 'new'
    and internal_notes is null
    and char_length(name) between 1 and 200
    and char_length(email) between 3 and 320
    and (phone is null or char_length(phone) <= 40)
    and (interest is null or char_length(interest) <= 100)
    and (message is null or char_length(message) <= 5000)
    and (source is null or char_length(source) <= 50)
  );

-- ── bookings: bound the public insert; force safe status; block money columns ─
drop policy if exists "public insert bookings" on public.bookings;
create policy "public insert bookings" on public.bookings
  for insert to anon, authenticated
  with check (
    status = 'pending'
    and internal_notes is null
    and follow_up = false
    and coalesce(amount, 0) = 0
    and char_length(name) between 1 and 200
    and char_length(email) between 3 and 320
    and (phone is null or char_length(phone) <= 40)
    and (event_name is null or char_length(event_name) <= 200)
    and (notes is null or char_length(notes) <= 5000)
    and guests between 1 and 100000
  );

-- ── reviews: stop leaking reviewer email to the anon key ─────────────────────
-- Published reviews are world-readable, but the email column is PII. Revoke it
-- from anon and grant only the display columns. The public app reads an explicit
-- column list (no email); the admin path uses the service role and is unaffected.
revoke select on public.reviews from anon;
grant select (
  id, name, role, company, event_id, event_name, rating, text, status, featured, submitted_at
) on public.reviews to anon;
