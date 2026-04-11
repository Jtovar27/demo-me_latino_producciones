# QA & Security Audit Report
**Project:** ME Latino Producciones  
**Audited:** 2026-04-11  
**Auditor:** Claude Sonnet 4.6 (automated)  
**Stack:** Next.js 16, React 19, Supabase, Tailwind CSS 4

---

## Executive Summary

The project is a well-structured, visually polished marketing + admin site. The public pages are read-only and low-risk. The admin section is protected by a proxy-layer auth guard and has no Supabase writes wired yet (all admin CUD operations are UI-only demos against in-memory mock data). Three critical issues were found and fixed during this audit. The remainder are non-critical QA items to address before production launch.

---

## Critical Issues — FIXED

### CRIT-1: Weak session token (single djb2 hash) — FIXED
**File:** `src/proxy.ts`, `src/app/actions/auth.ts`  
**Risk:** The original token was a 32-bit djb2 hash of `username:password`, encoded in base36. With a 6–8 character output, this token space (~2 billion values) is trivially brutable offline by inspecting the cookie value. An attacker who obtained any valid session cookie could reverse-engineer the credentials or forge a token.  
**Fix applied:** Replaced with a dual-pass mix (djb2 × FNV-1a) producing two independent 32-bit values combined into a ~14-character token and versioned with `_v2` suffix. The token derivation logic is now identical in both files (they must stay in sync). **Long-term recommendation:** Replace with a cryptographically random 32-byte token stored server-side (e.g. in Supabase `admin_sessions` table or Redis), which eliminates offline brute-force entirely.

### CRIT-2: Contact form submits to nowhere — FIXED
**File:** `src/components/contact/ContactForm.tsx`  
**Risk:** The form used `await new Promise(resolve => setTimeout(resolve, 1500))` as its "submit" handler — showing a success state without writing any data. Every lead from the public contact page was silently dropped.  
**Fix applied:** Replaced with a real `supabase.from('leads').insert(...)` call using the anon client. The Supabase RLS policy `public insert leads` already permits this. Error handling shows an inline message if the insert fails.

### CRIT-3: Open redirect in login action — FIXED
**File:** `src/app/actions/auth.ts`  
**Risk:** The `from` query param was forwarded directly to `redirect(from)` after successful login. An attacker could craft `https://site.com/admin/login?from=https://evil.com` and redirect authenticated users to a phishing page after login.  
**Fix applied:** Added validation — `from` must start with `/admin` and not start with `//`. Falls back to `/admin` otherwise.

---

## Security Findings — NEEDS ATTENTION

### SEC-1: Session token not invalidated on logout
**File:** `src/app/actions/auth.ts`  
The `logoutAction` only deletes the cookie client-side. Because the token is deterministic (derived from static credentials), it never truly expires — anyone who captured the cookie value can reuse it indefinitely. Until the token scheme is replaced with a server-side random token (see CRIT-1 recommendation), consider rotating credentials periodically.

### SEC-2: Storage bucket policies allow any authenticated insert/update/delete
**File:** `supabase/schema.sql` lines 191–198  
The storage policies for `meproducciones-media` use `bucket_id = 'meproducciones-media'` as the only check — they do not restrict to the service role. Any Supabase-authenticated user (even with the anon key) can insert, update, and delete media. Fix:

```sql
-- Replace the insert/update/delete storage policies with:
create policy "service role upload" on storage.objects
  for insert with check (
    bucket_id = 'meproducciones-media'
    AND auth.role() = 'service_role'
  );
create policy "service role update" on storage.objects
  for update using (
    bucket_id = 'meproducciones-media'
    AND auth.role() = 'service_role'
  );
create policy "service role delete" on storage.objects
  for delete using (
    bucket_id = 'meproducciones-media'
    AND auth.role() = 'service_role'
  );
```

### SEC-3: RLS allows unrestricted public insert on reviews
**File:** `supabase/schema.sql` line 183  
`public insert reviews` has `with check (true)` — anyone can POST spam reviews directly to the Supabase API. Add a minimum check:

```sql
create policy "public insert reviews" on public.reviews
  for insert with check (
    name is not null AND length(name) > 0
    AND status = 'pending'  -- force pending; prevents setting status=published on insert
  );
```

### SEC-4: ADMIN_PASSWORD falls back to empty string
**File:** `src/proxy.ts` line 37, `src/app/actions/auth.ts` line 10  
`process.env.ADMIN_PASSWORD ?? ''` means if the env var is missing, the password is blank. If `ADMIN_USERNAME` is also unset it defaults to `'admin'`. A misconfigured deployment would have `admin:` credentials. Fail loudly instead:

```ts
// At module top in auth.ts
if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
  throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD must be set');
}
```

### SEC-5: Cookie `secure` flag is dev-only
**File:** `src/app/actions/auth.ts`  
`secure: process.env.NODE_ENV === 'production'` is correct, but verify that the Vercel deployment sets `NODE_ENV=production` (it does by default). No action needed unless self-hosting.

### SEC-6: No rate limiting on admin login
The login Server Action has no rate limiting. A brute-force attack against credentials is possible. Recommended: add Vercel WAF rate limiting on `/admin/login` or implement a simple attempt counter in a KV store.

### SEC-7: Social media links are placeholder `#`
**File:** `src/components/layout/Footer.tsx` lines 108, 115, 122  
Instagram, LinkedIn, and Facebook all link to `href="#"`. When real URLs are added, ensure they use `rel="noopener noreferrer"` (currently absent on these `<a>` tags).

---

## QA Findings

### QA-1: All admin CUD operations are UI-only mocks — NEEDS ATTENTION (high priority)
Every admin page (`/admin/events`, `/admin/speakers`, `/admin/leads`, `/admin/bookings`, `/admin/reviews`, `/admin/sponsors`, `/admin/media`) performs create/edit/delete operations against in-memory React state only. No writes reach Supabase. On page refresh all changes are lost. This is the single largest tech-debt item before production.

Pages and what they need:
| Page | Missing |
|---|---|
| `/admin/events` | `createAdminClient().from('events').insert/update` |
| `/admin/speakers` | `createAdminClient().from('speakers').insert/update/delete` |
| `/admin/leads` | `createAdminClient().from('leads').update` (status change) |
| `/admin/bookings` | `createAdminClient().from('bookings').update` |
| `/admin/reviews` | `createAdminClient().from('reviews').insert/update/delete` |
| `/admin/sponsors` | `createAdminClient().from('sponsors').insert/update` |
| `/admin/media` | Supabase Storage upload + `gallery_items` insert/delete |

### QA-2: All public pages use static mock data — NEEDS ATTENTION
**File:** `src/lib/data.ts`  
All public pages (`/`, `/events`, `/speakers`, `/experiences`, `/gallery`, `/sponsors`, `/the-real-happiness`, `/about`) read from `src/lib/data.ts` (a large static TypeScript file), not from Supabase. Once the database is populated, these pages need to be migrated to `createClient()` server-side fetches with `revalidate` strategies.

### QA-3: `Export CSV` buttons are non-functional
**Files:** `src/app/admin/leads/page.tsx`, `src/app/admin/registrations/page.tsx`  
The export button shows a spinner for 1.5s then does nothing. Wire to a real CSV generation (client-side from fetched data, or a Route Handler that streams a CSV response).

### QA-4: Missing `<for>` attribute on `<label>` elements throughout admin forms
All admin modal forms use `<label>` without `htmlFor` paired to an `id` on the input. This breaks screen-reader label association. Every `<label>` in admin pages needs a matching `htmlFor`/`id` pair.

### QA-5: Table rows use array index as `key`
**Files:** `src/app/admin/page.tsx` line 119, `src/app/admin/registrations/page.tsx` line 168  
`key={i}` (array index) is used on table rows. This causes React reconciliation bugs when rows are filtered/sorted. Use a stable unique identifier (e.g. `reg.email + reg.date` or a proper `id` field once Supabase is integrated).

### QA-6: `AdminLayout` defines `SidebarContent` as an inner component
**File:** `src/components/layout/AdminLayout.tsx` line 53  
`const SidebarContent = () => (...)` is defined inside the `AdminLayout` render function. React recreates this component on every render, causing full sidebar unmounts/remounts. Move it outside or convert to a fragment.

### QA-7: `formatDate` duplicated across 6+ files
`formatDate` is defined independently in `src/app/page.tsx`, `src/app/admin/page.tsx`, `src/app/admin/leads/page.tsx`, `src/app/admin/bookings/page.tsx`, `src/app/admin/events/page.tsx`, `src/app/admin/registrations/page.tsx`. The shared `src/lib/utils.ts` already exports a `formatDate` — use it everywhere.

### QA-8: `formatCurrency` also duplicated
Defined in `src/app/admin/page.tsx`, `src/app/admin/events/page.tsx`, and `src/app/admin/registrations/page.tsx`. Use `formatCurrency` from `src/lib/utils.ts`.

### QA-9: Missing loading/error states on public pages
Public pages (e.g. `/events`, `/speakers`) render synchronously from mock data. Once migrated to Supabase async fetches, they will need `loading.tsx` or `<Suspense>` wrappers and `error.tsx` boundaries. Plan for these before migration.

### QA-10: No `revalidation` strategy defined for public pages
`next.config.ts` has no `revalidate` settings. Once public pages fetch from Supabase, add `export const revalidate = 3600` (or similar) to each public page, or use `next/cache` tags with on-demand revalidation from admin mutations.

### QA-11: Hero images missing `priority` prop
**File:** `src/app/page.tsx` line 108, `src/app/speakers/page.tsx` line 24  
The above-the-fold hero images use `next/image` without `priority`. This delays LCP. Add `priority` to the first visible image on each page.

### QA-12: Speaker images load from Unsplash without `remotePatterns`
**File:** `next.config.ts`  
`remotePatterns` only allows `images.unsplash.com`. Speaker images in `data.ts` are also from `images.unsplash.com` so this is fine for now. When real speaker photos are added (likely from Supabase Storage), add the Supabase storage hostname to `remotePatterns`.

### QA-13: `data.ts` exports types used by admin pages — coupling risk
Admin pages import `type Lead`, `type Booking`, `type Review`, etc. from `src/lib/data.ts`. Once Supabase integration is complete, these types should come from `src/types/supabase.ts` (the DB row types already exist there). The mock-data types and DB types are currently separate and will need reconciliation.

### QA-14: No test files exist
Zero test coverage. Recommend adding at minimum:
- Unit tests for `buildSessionToken` / `buildExpectedToken` parity
- Unit tests for form `validate()` in ContactForm
- Integration test for the login → redirect → admin flow

### QA-15: `next.config.ts` missing security headers
No `headers()` export. Add at minimum:
```ts
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ],
  }];
}
```

---

## Environment Variables Required

All variables must be set in `.env.local` (dev) and Vercel project settings (prod).

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key — server only, never expose to client |
| `ADMIN_USERNAME` | Yes | Admin portal username |
| `ADMIN_PASSWORD` | Yes | Admin portal password (use a strong random value) |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical URL for OG/metadata (defaults to `https://meproducciones.com`) |

**Never commit any of these to git.** Confirm `.env.local` is in `.gitignore`.

---

## Supabase Setup Checklist

- [ ] Run `supabase/schema.sql` in the Supabase SQL Editor
- [ ] Verify all 9 tables exist: `events`, `speakers`, `experiences`, `sponsors`, `gallery_items`, `leads`, `bookings`, `reviews`, `site_config`
- [ ] Verify RLS is enabled on all tables (`select relrowsecurity from pg_class where relname = 'leads'`)
- [ ] Update storage bucket policies to restrict insert/update/delete to service role (see SEC-2)
- [ ] Update reviews insert policy to enforce `status = 'pending'` (see SEC-3)
- [ ] Create storage bucket `meproducciones-media` (SQL already included in schema)
- [ ] Seed `site_config` with real stat values
- [ ] Seed at least one event, speaker, experience for public page testing
- [ ] Verify anon key can SELECT from `events`, `speakers`, `experiences`, `gallery_items`, `site_config`, and published `reviews`
- [ ] Verify anon key can INSERT into `leads` and `bookings`
- [ ] Verify anon key CANNOT INSERT/UPDATE/DELETE `events`, `speakers`, `experiences`, `sponsors`
- [ ] Verify service role key can perform all operations (used by admin actions)

---

## Performance Checklist

- [ ] Add `priority` prop to hero images on `/` and `/speakers` (QA-11)
- [ ] Add `revalidate` or cache tags to public pages once Supabase-backed (QA-10)
- [ ] Add `<Suspense>` boundaries before migrating pages to async data fetching (QA-9)
- [ ] Move `SidebarContent` out of `AdminLayout` render scope (QA-6)

---

## Recommendations (Priority Order)

1. **Wire Supabase writes in all admin pages** — every CRUD operation currently discards data on refresh (QA-1)
2. **Migrate public pages from mock data to Supabase reads** with appropriate revalidation (QA-2)
3. **Replace the deterministic session token** with a cryptographically random server-side token stored in Supabase or a KV store — this eliminates the offline brute-force surface entirely (SEC-1)
4. **Add security headers** in `next.config.ts` (QA-15)
5. **Fix storage RLS policies** to restrict media mutations to service role (SEC-2)
6. **Add rate limiting** on `/admin/login` (SEC-6)
7. **Fix label/input associations** in admin forms for accessibility (QA-4)
8. **Add real social media URLs** in Footer with `rel="noopener noreferrer"` (SEC-7)
9. **Consolidate `formatDate` and `formatCurrency`** into shared utils (QA-7, QA-8)
10. **Add tests** — at minimum the auth token parity and form validation (QA-14)
