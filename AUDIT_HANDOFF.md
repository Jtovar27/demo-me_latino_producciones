# ME Producciones Audit — Handoff / Continue Here

**Session paused:** 2026-08-11. Resume from this file. Full evidence is in `AUDIT_STATUS.md`.

Branch for this work: see `git log` / the pushed branch. Local verification at pause:
`npm ci` ✓ · `tsc --noEmit` ✓ (0 errors) · `npm run lint` ✓ (0 errors, 7 pre-existing warnings) ·
`npm test` ✓ (112/112) · `npm run build` ✓ · `npm audit` ✓ (0 vulnerabilities).

---

## ✅ DONE THIS SESSION (fixed + verified in code/tests; most also verified live)

1. **AUTH-4 — unauthenticated admin Server Action bypass (CRITICAL).** Every mutating action and
   admin-only read now calls `isAdmin()` (`src/lib/auth/requireAdmin.ts`) as its first statement.
   44 guards across 12 `src/app/actions/*.ts` files. **Live-proven closed**: POSTing every admin
   action to the public `/` with no cookie now returns `No autorizado.` and never touches the DB; an
   authenticated cookie still passes. Regression: `__tests__/actions.authz.test.ts` (12 cases).
2. **AUTH-1 — `unconfigured` sentinel bypass (CRITICAL).** Rewrote `src/lib/auth/session.ts`: signed
   (HMAC), expiring, timing-safe token; unconfigured env → nothing verifies. Live-proven: cookie
   `me_admin_session=unconfigured` → 307; valid token → 200.
3. **AUTH-2/AUTH-3 — static token + no rate limit.** Token now expires (7d) and its signing key is
   derived from the admin password (rotating the password invalidates sessions). Login uses a
   constant-time credential check + in-memory per-IP throttle (`src/app/actions/auth.ts`).
4. **DATA-1 — service role on public request paths.** All public-page reads switched to the anon
   client (RLS-scoped); `/api/featured-event` → anon client + `Cache-Control`. Admin reads keep the
   service role behind `isAdmin()`.
5. **Reliability.** Added `error.tsx`, `global-error.tsx`, `not-found.tsx` (no route can show a blank
   500 now). Supabase clients wrapped with `fetchWithTimeout`. Event-detail page distinguishes a real
   404 (`.maybeSingle()`) from a transient DB error (→ retryable error boundary).
6. **HTTP security.** `next.config.ts` now sets CSP, HSTS, X-Frame-Options DENY, nosniff,
   Referrer-Policy, Permissions-Policy, and `no-store` on `/admin`. **Live-verified present.**
7. **XSS via href.** `safeExternalUrl()` (`src/lib/utils.ts`) blocks `javascript:`/`data:` URLs;
   applied to EventbriteButton, TicketPlateButton, TicketPurchaseModal, HeroCarousel. Test:
   `__tests__/lib.utils.test.ts`.
8. **SEO host.** robots/sitemap/layout canonical default → `https://www.meproducciones.com`.
9. **Dependencies.** `next` upgraded 16.2.2 → **16.3.0** (patches Middleware/Proxy-bypass + DoS + SSRF
   advisories). `npm audit fix` cleared the transitive highs. **0 vulnerabilities.**
10. **Reproducibility.** Added `.env.example`, `.nvmrc` (24), `engines` in package.json.
11. **DB migration authored:** `supabase/migrations/011_security_hardening.sql` (see REMAINING #1).

---

## ⛔ REMAINING — DO THESE NEXT (in priority order)

### 1. APPLY migration `011_security_hardening.sql` to the PRODUCTION Supabase — CRITICAL, BLOCKING
The RLS/storage fixes live in the repo but **have no effect until the SQL is run** against the real
Supabase project. Until then, in production: anon can still upload/overwrite/delete media, publish
reviews to the homepage, and write unbounded leads/bookings. **Run it** via the Supabase SQL Editor
or `supabase db push`. Requires project access we did not have this session. After applying, verify
with the checklist at the bottom of `AUDIT_STATUS.md` (anon cannot write storage; anon review insert
forced to `status='pending'`; anon cannot set `featured`).

### 2. Browser smoke tests (Playwright) — REQUIRED, NOT DONE
`playwright` (bare lib) is installed but browser binaries likely are not. Do:
`npx playwright install chromium`, then write a smoke script (or use `__tests__/admin-flow.mjs` as a
base) that, against `npm run build && npx next start`, checks each public route + `/admin/login` at
mobile/tablet/desktop viewports, in **both** ES and EN, asserting: HTTP ok, primary content present,
no uncaught JS exception, no console errors, images load, nav works, language switch works.
**Also confirm the new CSP does not break hydration/forms/video embeds in a real browser** — the CSP
was verified present via headers but NOT yet verified non-breaking in a rendered page.

### 3. Bound total query time during a Supabase outage — LOW (graceful today, just slow)
Root cause pinned: supabase-js makes **4 retry attempts with backoff sleeps (~7s total)**; a
fetch-level `AbortController` can't interrupt the sleeps (confirmed: 4 fetch calls, 7/1/1/2 ms each,
7042 ms total). `fetchWithTimeout` still caps a genuine network *hang* (proven: 3s abort on a
non-routable host). Current outage behavior is **graceful** (HTTP 200 + empty content, bounded
~7–21s, never infinite, never a crash). To tighten: wrap public-page reads in a query-level
`Promise.race([query, timeout])` (a `withQueryTimeout()` helper), or find a supabase-js
retry-disable option. Not blocking.

### 4. CI workflow — NOT DONE (Phase G partial)
Add `.github/workflows/ci.yml` running `npm ci && npm run lint && tsc --noEmit && npm test &&
npm run build` on PRs so this class of regression can't return silently.

### 5. Deploy + production smoke test — NOT DONE
After #1 and #2, deploy and run a **passive** production smoke test (canonical https, all routes,
admin auth boundary, headers, console/network) per `AUDIT_STATUS.md` Production Validation section.

### 6. Secondary LOW findings not yet addressed (from the 64-finding audit)
Optimize the 18.6 MB hero PNG (`public/1-100.jpg.png`); add DB indexes on public read/sort columns;
`sponsors.updated_at`; `getLang` needlessly exported as a Server Action; zero-width `next/image`
CLS on the homepage; language-toggle split-state flash; delete dead `tailwind.config.ts` (Tailwind v4
ignores it); consider `noUncheckedIndexedAccess` in tsconfig. None are blocking.

### 7. Housekeeping
`requireAdmin` in `src/lib/auth/requireAdmin.ts` is now unused (only `isAdmin` is) — keep or remove.
`admin/page.tsx` still reads via the service role — acceptable (proxy-gated page, admin data), but
could move behind `isAdmin()` for symmetry. Consider self-hosting Google Fonts to remove the
build-time gstatic dependency (a transient gstatic 404 failed one build this session; a clean rebuild
succeeded).

---

## Nothing to rotate
The adversarial audit REFUTED the scary possibilities: **no real admin credentials and no payment
secrets are in git history**; lockfile integrity is clean; no `.env` was ever committed. No secret
rotation is required.

## Local test env note
`.env.local` (gitignored) holds **dummy** values for local testing: a strong dummy admin password and
a Supabase URL pointed at an unreachable host to exercise the outage paths. Not real credentials.
