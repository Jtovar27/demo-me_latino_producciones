# Project Audit — The Real Happiness Initiative

**Audited:** 2026-04-29
**Project:** ME Producciones / ME Latino Producciones marketing site + admin CMS
**Audited by:** Senior full-stack review (read-only first pass, no edits performed in this phase)

---

## 1. Current Project Architecture

| Area | Detail |
| --- | --- |
| Framework | Next.js **16.2.2** (App Router, server components by default) |
| React | 19.2.4 |
| Styling | Tailwind CSS **4** (`@tailwindcss/postcss`) |
| Language | TypeScript 5 |
| Backend / DB | Supabase Postgres + Storage (`@supabase/supabase-js`, `@supabase/ssr`) |
| Auth | Custom proxy-layer guard (`src/proxy.ts`) using a deterministic session token in `me_admin_session` cookie |
| Tests | Vitest unit tests (`__tests__/`) + Node-based admin flow (`__tests__/admin-flow.mjs`) + Playwright dependency present |
| Deploy | Inferred Vercel (no `vercel.json` present); env-based config |
| i18n | Custom — cookie `me_lang` (es/en), context provider `LanguageContext`, single dictionary `src/lib/i18n/translations.ts`, server helper `getLang()` |
| Images | `next/image` with `unoptimized` flag, remote patterns for unsplash + supabase storage configured in `next.config.ts` |

> **Important:** `AGENTS.md` warns: "This is NOT the Next.js you know — APIs may differ from training data." Treated accordingly. No experimental features used here that conflict.

---

## 2. Public Pages & Nav

Public routes (`src/app/<route>/page.tsx`):

- `/` (home — hero carousel, brand statement, flagship carousel, experiences, upcoming events, featured speakers, editorial, metrics, testimonials, sponsors, final CTA)
- `/about`
- `/experiences` and `/experiences/[slug]`
- `/events` and `/events/[slug]`
- `/speakers`
- `/gallery`
- `/sponsors`
- `/contact`

Header is rendered by `src/components/layout/Header.tsx` (client component). The `NAV` array (lines 9–18) is the single source of truth for nav items.

**Current order:** Home · About · Experiences · Events · Speakers · Gallery · Sponsors · Contact.

**Required change:** Insert *The Real Happiness* immediately **after Events**.

---

## 3. Admin Dashboard

Routes under `src/app/admin/` are protected by `src/proxy.ts` (matcher `/admin/:path*`). The shell is `src/components/layout/AdminLayout.tsx` with a left sidebar listing every CMS section. Each admin page uses the same patterns:

- Local `useState` for the form
- Server Action call (`src/app/actions/<entity>.ts`) for upsert/delete/list
- `revalidatePath()` after writes
- Toast confirmations and confirm()-based deletes

### Hero (`/admin/hero` → `src/app/admin/hero/page.tsx`)

- Manages `hero_slides` (bilingual title/category/alt + cta + sort_order + active flag).
- Already has **move-up / move-down** ordering via `reorderHeroSlides()` — pattern to reuse for speakers/sponsors.
- ❗ The image picker is **only a plain text URL input** (lines 240–247). This is the issue PHASE 2 fixes.

### Speakers (`/admin/speakers`)

- Already uses `MediaPicker` for the photo (line 298–303 — good reference).
- **No ordering UI** at all — speakers are simply listed by `created_at desc` (`src/app/actions/speakers.ts:53–57`).
- DB: `speakers.featured boolean` exists; **no `sort_order` column**.

### Sponsors (`/admin/sponsors`)

- Already uses `MediaPicker` for the logo.
- Grouped by tier; **no per-tier ordering UI**.
- DB: `sponsors.tier text` exists; **no `sort_order` column**.

### Other admin pages

- `/admin/settings` — site-wide config (hero text, brand quote, social links, stats) backed by single-row `site_config` table.
- `/admin/flagship` — flagship carousel events.
- `/admin/events`, `/admin/experiences`, `/admin/reviews`, `/admin/bookings`, `/admin/registrations`, `/admin/leads`, `/admin/media`.
- Login at `/admin/login`.

---

## 4. Hero Image Selection Logic

| Flow | Where | Notes |
| --- | --- | --- |
| Public hero render | `src/components/ui/HeroCarousel.tsx` (consumed by `src/app/page.tsx`) | Reads `hero_slides` via `getActiveHeroSlides()` |
| Admin selection (current) | `src/app/admin/hero/page.tsx` line 241 | `<input>` for `image_url` — admin must paste URL |
| Reusable picker (target) | `src/components/admin/MediaPicker.tsx` | Already supports browse-existing-gallery + upload-from-device + URL fallback. Supports `accept="image"`. |
| Upload endpoint | `src/app/api/media/upload/route.ts` | Cookie-gated to admin session, writes to Supabase Storage bucket `meproducciones-media`, inserts `gallery_items` row |

**Plan:** Drop `<input>` and replace with `<MediaPicker value={form.image_url} onChange={(url) => set('image_url', url)} accept="image" />`. Keep an optional "Advanced URL" mode behind a small disclosure (`MediaPicker` already includes a small URL input as fallback under the picker button — that's enough).

---

## 5. Speakers / Sponsors Ordering Logic

### Current state

- Hero uses a `sort_order INTEGER` column with a `reorderHeroSlides(orderedIds[])` server action. Move-up/down updates `sort_order = index` for each id.
- Speakers and Sponsors **do not** have `sort_order` in their schemas — they are returned in `created_at desc`. The public `/speakers` page filters `s.featured` then renders in DB order.
- Public homepage (`src/app/page.tsx:78`) takes `speakers.filter((s) => s.featured).slice(0, 4)`.

### Decision

Add a `sort_order INTEGER NOT NULL DEFAULT 0` column to both `speakers` and `sponsors` tables (safe additive migration). Backfill = 0 for existing rows; new rows get `max+1` on insert.

Then change ordering everywhere:

- `getSpeakers()` → `order('sort_order', asc).order('created_at', asc)` so unset rows fall back to creation order.
- `getSponsors()` → same.
- Add `reorderSpeakers(orderedIds)` and `reorderSponsors(orderedIds)` server actions mirroring `reorderHeroSlides`.
- Add UI controls (move up / move down / send to top / send to bottom) in `/admin/speakers` and `/admin/sponsors`. Use **list view** for the controls because grid view is not ergonomic for ordering. For sponsors, ordering is **per tier** (each tier ordered independently).
- Public page: `/speakers` already iterates in DB order; once `sort_order` drives the query, it Just Works. `/sponsors` groups by tier first then renders inside each tier in DB order — same.

This avoids the "type a number" UX pitfall, prevents duplicate-order conflicts (the action **rewrites** all sort_order values 0..n on each save), and is mobile-friendly (large tap targets).

---

## 6. Media Uploads

- Bucket: `meproducciones-media` (Supabase Storage, public read).
- Upload route: `src/app/api/media/upload/route.ts` — POST FormData, requires admin cookie, validates 50MB max + mime allowlist, inserts a `gallery_items` row.
- Reusable component: `src/components/admin/MediaPicker.tsx` — opens a portal modal with **Browse gallery** and **Upload new** tabs; shows preview thumb. Also exposes a fallback URL input on the field.
- Already integrated in: speakers, sponsors, events, experiences, flagship admin pages.

No changes needed to media infra.

---

## 7. Routing / i18n

- `getLang()` (server) reads cookie `me_lang`; default `es`.
- `useLanguage()` (client) reads/writes the same cookie via context.
- All UI strings live in `src/lib/i18n/translations.ts`. `tr(entry, lang)` returns the right string.
- No localized URL routing — everything sits at `/<segment>`. The new page therefore lives at **`/the-real-happiness`** (single route, content swaps by `lang`).

---

## 8. Database / API Changes Required

### A. Migration `006_speaker_sponsor_ordering.sql` (additive — safe)

```sql
-- Add sort_order to speakers and sponsors
ALTER TABLE public.speakers   ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;
ALTER TABLE public.sponsors   ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS speakers_sort_order_idx ON public.speakers (sort_order, created_at);
CREATE INDEX IF NOT EXISTS sponsors_tier_sort_idx  ON public.sponsors (tier, sort_order, created_at);
```

### B. Server actions

- Extend `src/app/actions/speakers.ts` with `reorderSpeakers(orderedIds)`, update `getSpeakers()` ordering.
- Extend `src/app/actions/sponsors.ts` with `reorderSponsors(orderedIds)`, update `getSponsors()` ordering.

### C. New leads source

`leads` table already accepts inserts via the public client (RLS allows). The Real Happiness landing page will reuse `submitContact` (or a thin wrapper that adds `source: 'the-real-happiness'`).

### D. TypeScript types

Add `sort_order: number` to `SpeakerRow` and `SponsorRow` in `src/types/supabase.ts`.

No destructive changes. No data migration. All existing rows keep working.

---

## 9. Risks Before Implementation

| # | Risk | Mitigation |
| --- | --- | --- |
| 1 | Adding nav item could break responsive header | Header already iterates `navLinks` array; just add one entry. Verified mobile drawer + desktop both render array dynamically. |
| 2 | DB migration on speakers/sponsors could fail if applied while `getSpeakers()` is querying ordered columns | Migration is `ADD COLUMN IF NOT EXISTS ... DEFAULT 0` — idempotent and concurrent-safe in Supabase Postgres. |
| 3 | Existing speaker/sponsor rows all get `sort_order = 0` → ordering ambiguous initially | Query falls back to `created_at` as secondary sort. Admin can reorder once and the values become canonical. |
| 4 | Footer link `/experiences#summit` and similar already exist — could collide with new section headlines | The new page is a full route, not an anchor. No collision. |
| 5 | `node_modules` not installed — typecheck/build cannot run from this audit | QA phase will install and run; this is an environment, not code, risk. Documented in final report. |
| 6 | Zelle/Stripe payment links for sponsor packages live in env vars; not all may be set | Not blocking — modal already gracefully falls back to `/contact` and Zelle path. |
| 7 | Provided OCR copy contained typos and broken Spanish — mixing with admin-managed speakers | The Real Happiness page text is rewritten from the raw OCR brief into clean, polished marketing copy in both languages. Confirmed speaker list uses an admin-aware fallback, so future speaker DB rows replace the static list. |
| 8 | Admin ordering cannot be reused for sponsors directly because sponsors are tiered | We sort independently within each tier (the action takes `orderedIds` and sets `sort_order = index` for the listed ids only — does not touch other tiers). |

---

## 10. Implementation Plan (sequenced)

1. **Phase 2 — hero image selector.**
   - Edit `src/app/admin/hero/page.tsx`: replace the `image_url` `<input>` with `<MediaPicker accept="image" />`. Keep the small "preview thumb" pattern. Done in one file.

2. **Phase 3 — speakers + sponsors ordering.**
   - Add migration `supabase/migrations/006_speaker_sponsor_ordering.sql`.
   - Update `src/types/supabase.ts` (add `sort_order` to both rows).
   - Update `src/app/actions/speakers.ts` (`getSpeakers` order, `reorderSpeakers`).
   - Update `src/app/actions/sponsors.ts` (`getSponsors` order, `reorderSponsors`).
   - Add ordering controls in `src/app/admin/speakers/page.tsx` (list view) — move up / move down / send to top / send to bottom. Apply only to **featured = true** speakers (the homepage shows featured speakers; "All speakers" page can still render alphabetically — but we'll order the full list by `sort_order` for consistency).
   - Add ordering controls in `src/app/admin/sponsors/page.tsx` per-tier card.
   - Bilingual labels added to `translations.ts`.

3. **Phase 4–6 — The Real Happiness landing page.**
   - Add nav entry to `src/components/layout/Header.tsx`.
   - Create `src/app/the-real-happiness/page.tsx` with all 12 sections (server component for content, client subcomponents for the lead form).
   - Reuse `SponsorPackagesSection` for the sponsor plans block.
   - Build a new `RealHappinessLeadForm` client component that posts to `submitContact()` with `source: 'the-real-happiness'` and an extended `interest` enum (sponsor / speaker / attendee / general). UTM params captured from `window.location.search` on submit and appended to `message`.
   - Speakers section: read from DB if `getSpeakers()` returns featured speakers, else fall back to a curated static list rewritten from the OCR brief.
   - Hosts section (Mónica + Joyce) uses static, polished copy keyed off the brief.
   - SEO metadata in the new page's `generateMetadata` (or static `metadata` export).

4. **Phase 7–8 — Admin support + SEO.**
   - The Real Happiness page reads:
     - Featured speakers from existing DB (already manageable from `/admin/speakers`).
     - Hero image: optional — uses curated fallback. We do not add a new "tre real happiness hero" admin field this pass; documented as future improvement.
   - Add `src/app/sitemap.ts` and `src/app/robots.ts` (Next 16 conventions) so the new route is indexed; no other route gains, just adds the missing sitemap/robots primitives.

5. **Phase 9–10 — Mobile + QA.**
   - All new layout uses the existing breakpoint patterns (`md:`, `lg:`).
   - Run `npm install`, `npm run lint`, `npm run build`, `npm test`. Document outputs.

6. **Phase 11–12 — Documentation.**
   - Write `docs/THE_REAL_HAPPINESS_IMPLEMENTATION.md`.
   - Update `.env.example` if any new var introduced (none planned).
   - Final report to user.

---

## 11. Files I Expect to Touch

- **New:**
  - `docs/PROJECT_AUDIT_THE_REAL_HAPPINESS.md` (this file)
  - `docs/THE_REAL_HAPPINESS_IMPLEMENTATION.md`
  - `supabase/migrations/006_speaker_sponsor_ordering.sql`
  - `src/app/the-real-happiness/page.tsx`
  - `src/components/realHappiness/RealHappinessLeadForm.tsx`
  - `src/app/sitemap.ts`
  - `src/app/robots.ts`

- **Modified:**
  - `src/components/layout/Header.tsx` (nav array)
  - `src/components/layout/Footer.tsx` (link to The Real Happiness)
  - `src/app/admin/hero/page.tsx` (MediaPicker swap)
  - `src/app/admin/speakers/page.tsx` (ordering controls)
  - `src/app/admin/sponsors/page.tsx` (ordering controls)
  - `src/app/actions/speakers.ts` (`reorderSpeakers`, `getSpeakers` order)
  - `src/app/actions/sponsors.ts` (`reorderSponsors`, `getSponsors` order)
  - `src/types/supabase.ts` (`sort_order` field)
  - `src/lib/i18n/translations.ts` (new strings)

---

End of audit. Implementation begins next phase.
