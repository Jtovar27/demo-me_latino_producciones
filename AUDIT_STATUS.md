# ME Producciones — Production Reliability & Security Audit

**Target:** https://www.meproducciones.com
**Repository:** `demo-me_latino_producciones`
**Audit started:** 2026-08-11
**Status:** IN PROGRESS

This file is the persistent working memory for the audit. It records architecture discovered,
problems found, severity, root cause, fix implemented, verification evidence, and remaining work.

---

## 1. Architecture Discovered

Determined by inspection, not assumption.

| Aspect | Finding | Source of truth |
|---|---|---|
| Framework | Next.js **16.2.2**, App Router | `package.json` |
| UI runtime | React **19.2.4** / react-dom 19.2.4 | `package.json` |
| Language | TypeScript 5.x | `tsconfig.json` |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) | `postcss.config.mjs`, `tailwind.config.ts` |
| Package manager | **npm** (npm 11.9.0, `package-lock.json`) | lockfile present, no yarn/pnpm/bun lock |
| Node runtime (local) | v24.14.0 | `node -v` |
| Hosting | Vercel (inferred — no `vercel.json`/`vercel.ts` in repo) | absence of platform config |
| Database / BaaS | Supabase (`@supabase/ssr` 0.10.x, `@supabase/supabase-js` 2.103.x) | `package.json`, `src/lib/supabase/*` |
| Routing guard | `src/proxy.ts` — Next.js 16 renamed `middleware.ts` → `proxy.ts`, export is `proxy()` | `src/proxy.ts` |
| Test runner | Vitest 4.x + a bespoke Node script (`__tests__/admin-flow.mjs`) | `package.json`, `vitest.config.ts` |
| Browser automation | `playwright` (bare library, dev dep) | `package.json` |
| Icons | `lucide-react` | `package.json` |

### Supabase client topology

Four distinct clients exist, with different trust levels:

| File | Key used | Intended use |
|---|---|---|
| `src/lib/supabase/client.ts` | anon (browser) | client components |
| `src/lib/supabase/server.ts` | anon + cookie bridge (`@supabase/ssr`) | server components |
| `src/lib/supabase/public.ts` | anon (no session) | public reads/writes subject to RLS |
| `src/lib/supabase/admin.ts` | **service role** | privileged server-only operations |

### Route inventory

**Public:** `/`, `/about`, `/contact`, `/events`, `/events/[slug]`, `/experiences`,
`/experiences/[slug]`, `/gallery`, `/speakers`, `/sponsors`, `/the-real-happiness`

**Admin:** `/admin`, `/admin/login`, `/admin/bookings`, `/admin/events`, `/admin/experiences`,
`/admin/flagship`, `/admin/hero`, `/admin/leads`, `/admin/media`, `/admin/real-happiness`,
`/admin/registrations`, `/admin/reviews`, `/admin/settings`, `/admin/speakers`, `/admin/sponsors`

**API route handlers:** `GET /api/featured-event`, `POST /api/media/upload`

**Metadata routes:** `src/app/robots.ts`, `src/app/sitemap.ts`

**Server Actions:** 13 modules under `src/app/actions/` — auth, bookings, events, experiences,
flagship, gallery, hero, leads, realHappiness, reviews, settings, speakers, sponsors

### Database migrations

`supabase/schema.sql` plus 10 ordered migrations (`001_cms_expansion` → `010_ticketplate`).

---

## 2. Environment Variables Required

Server-only (must never reach the browser):
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

Public (inlined into the client bundle at build time):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STORAGE_BUCKET` (optional, defaults to `meproducciones-media`)
- `NEXT_PUBLIC_SITE_URL` (used for canonical metadata)

**Observed:** no `.env`, `.env.local`, or `.env.example` exists in the working tree, and none is
tracked in git (correctly excluded by `.gitignore`). There is therefore **no documented contract**
for what a fresh deployment requires. See finding REL-ENV.

---

## 3. Prior Audit Context

`QA_REPORT.md` (dated 2026-04-11) documents an earlier automated audit. It is **historical context,
not evidence of current state** — several items it marks "FIXED" have since regressed or were fixed
in a way that introduced new defects. Every claim in it is being re-verified rather than trusted.

Specifically notable: QA_REPORT SEC-4 recommended failing loudly when `ADMIN_USERNAME`/`ADMIN_PASSWORD`
are unset. The change actually made instead returns a constant sentinel string, which created a new
authentication bypass (see AUTH-1 below).

---

## 4. Findings

Severity scale: **CRITICAL** (exploitable now / site-breaking) · **HIGH** · **MEDIUM** · **LOW** · **INFO**

### Confirmed by direct inspection (pre-workflow)

#### AUTH-1 — Admin authentication bypass when admin env vars are unset — CRITICAL
- **Files:** `src/lib/auth/session.ts:10`, `src/proxy.ts:25`, `src/app/api/media/upload/route.ts:10`
- **Evidence:** `buildSessionToken()` returns the literal string `'unconfigured'` when
  `ADMIN_USERNAME` or `ADMIN_PASSWORD` is missing. Both the proxy guard and the upload route
  authorize a request by testing `cookie === buildSessionToken()`.
- **Failure scenario:** If either env var is absent or empty in a deployment, an unauthenticated
  attacker sets the cookie `me_admin_session=unconfigured` and is granted the full admin portal
  plus the service-role-backed media upload endpoint. The sentinel is a *known constant*, so this
  requires no guessing. The `httpOnly` flag does not help — the attacker sets the cookie on their
  own client.
- **Root cause:** A failure-mode sentinel was used as an authorization value. The comparison has no
  notion of "no valid token can exist"; it only compares two strings.
- **Status:** CONFIRMED — fix pending.

#### AUTH-2 — Session token is static, unsigned, and non-expiring — HIGH
- **File:** `src/lib/auth/session.ts:6-22`
- **Evidence:** The token is a deterministic non-cryptographic mix (djb2 × FNV-1a) of
  `ADMIN_USERNAME:ADMIN_PASSWORD`. It is identical for every session and every device, forever.
- **Failure scenario:** The token cannot be revoked. `logoutAction` deletes the cookie on one
  browser, but the same value remains valid everywhere else indefinitely. Any single disclosure
  (shared machine, proxy log, browser extension, backup) grants permanent admin access until the
  credentials themselves are changed. There is no expiry inside the token — only a 7-day cookie
  `maxAge`, which is client-controlled and trivially ignored by a non-browser client.
- **Root cause:** Session identity is derived from the credential rather than issued per login.
- **Status:** CONFIRMED — fix pending.

#### AUTH-3 — Credential comparison is not timing-safe; no rate limiting — MEDIUM
- **File:** `src/app/actions/auth.ts:17`
- **Evidence:** `username !== expectedUser || password !== expectedPass` uses short-circuiting
  string equality. No attempt counter, lockout, or delay exists anywhere in the login path.
- **Failure scenario:** The login Server Action can be invoked programmatically at high rate against
  production with no throttle, enabling unbounded credential brute force.
- **Status:** CONFIRMED — fix pending.

#### DATA-1 — Service-role client serves anonymous public traffic — HIGH
- **File:** `src/app/api/featured-event/route.ts:6`
- **Evidence:** `GET /api/featured-event` (unauthenticated, publicly reachable) calls
  `createAdminClient()`, which uses `SUPABASE_SERVICE_ROLE_KEY` and therefore **bypasses RLS entirely**.
- **Failure scenario:** The endpoint's safety depends solely on the hardcoded column list and
  `.eq()` filters in this one function. Any future edit that widens the select, or any RLS policy
  intended to hide unpublished events, is silently bypassed. It also means a public request path
  holds a service-role credential, so an SSRF or injection defect anywhere in this handler
  escalates directly to full database compromise.
- **Status:** CONFIRMED — fix pending.

#### AUTH-4 — Unauthenticated authorization bypass on ALL admin Server Actions — CRITICAL (LIVE-PROVEN)
- **Files:** every mutation in `src/app/actions/*.ts` (49 mutation call sites); `src/proxy.ts:11,36`
- **Root cause:** Authorization is enforced **only** by `proxy.ts`, whose matcher is `['/admin/:path*']`.
  No server action verifies the session itself. In Next.js 16, a Server Action is a global POST endpoint
  addressed by an action id in the `Next-Action` header; the request path is the page the action is
  *dispatched from*, not where it is defined. Because public pages (`/`, `/contact`, `/events`, …) import
  read helpers (e.g. `getEvents`) from the same `'use server'` module as the mutations (`upsertEvent`,
  `deleteEvent`, `setFeaturedForPopup`), **the mutations are registered as dispatchable from those public
  paths** — which the proxy never guards.
- **Evidence (build manifest):** `.next/server/app/*/server-reference-manifest.json` lists action
  `00095c79…` and siblings under workers `app/admin/events/page, app/contact/page, app/events/page, app/page`.
  The public homepage `app/page` is a valid dispatch worker for admin-event mutations.
- **Live reproduction (local prod server, no cookie):**
  - CONTROL: `POST /admin/events` with the action id → **307 → /admin/login** (proxy blocks).
  - EXPLOIT: `POST /` with the *same* action id → **200, executed.** Response bodies show the handlers ran:
    `getEvents` returned `{"data":[],"error":"TypeError: fetch failed"}` and two **mutation** actions
    returned `{"error":"TypeError: fetch failed"}` — i.e. they passed all internal validation and reached
    `client.from('events').insert/update/delete(...)`, failing only because the audit env points Supabase at
    an unreachable host. On a correctly configured production deployment these writes SUCCEED.
- **Failure scenario:** An anonymous internet user extracts an action id from the public JS bundle and POSTs
  to `https://www.meproducciones.com/` to delete all events, overwrite content, toggle featured/publish flags,
  create spam reviews, and read admin-only data — **without any credential and regardless of how strong the
  admin password is.** This is independent of AUTH-1.
- **Framework confirmation:** Next.js 16 docs `02-guides/authentication.md:1119` — "Proxy … should not be
  your only line of defense"; `:299` — "Before mutating data, you should always ensure a user is also
  authorized." The app violates both. Recommended fix: a Data Access Layer `verifySession()` called at the
  top of every mutating/admin action (defense in depth), not proxy-only.
- **Status:** CONFIRMED (live) — fix pending. **This is the top-priority fix.**

### Reliability reproductions (LIVE, local prod build)

- **REL-1 (CRITICAL):** With admin/Supabase env vars **unset**, every public route returns **HTTP 500**
  (`Error: supabaseUrl is required.` thrown at `createAdminClient()`), and because **no `error.tsx`,
  `global-error.tsx`, or `not-found.tsx` exists anywhere**, the visitor gets a bare error page. Reproduced:
  `/ /about /experiences /events /the-real-happiness /speakers /gallery /sponsors /contact` all 500.
- **REL-2 (HIGH):** With env vars set but Supabase **unreachable/slow**, public pages take **7–21 seconds**
  to render (queries have no timeout/fast-fail and retry) before degrading to empty content at 200.
  `/admin/login` (no DB) is instant, isolating the cause to the un-timed Supabase calls. This is the
  "infinite loading / sometimes doesn't work" complaint. Risk of Vercel function gateway timeout under a
  real Supabase incident.
- **REL-3 (positive):** Empty-data rendering is **safe** — the homepage renders 77 KB of real content with
  all queries returning `[]`; no crash on empty arrays. Graceful-degradation-on-empty is already correct.
- **REL-4 (MEDIUM):** Query failures are **silently swallowed** (actions return `{data:[], error}` and the
  pages ignore `error`); the server log recorded **zero** errors during the multi-second failures. There is
  no error monitoring — production failures are invisible.
- **AUTH-1 confirmed live:** with admin env vars unset, `GET /admin/events` with forged cookie
  `me_admin_session=unconfigured` returned **200** (full admin page) while no-cookie/wrong-cookie returned 307.

### Consolidated from parallel specialist audit (57 agents, adversarially verified: 64 survived, 3 refuted)

**Refuted (cleared — important):** No real admin credentials are committed to HEAD or git history
(`public-repo-hardcoded-admin-credentials` REFUTED); no payment/Zelle secret is retrievable from history
(`zelle-payment-identifier-in-history` REFUTED); the MobileCarousel spacer-index bug was REFUTED. The
supply-chain agent confirmed the lockfile is clean, no `.env` was ever committed, and install scripts are
limited to two known-legitimate packages. **→ No secret rotation is required.**

**CRITICAL (fix first):**
- **AUTH-4 / server-actions-no-authz** — all 40 mutating service-role actions + admin reads have zero
  authorization; reachable unauthenticated via POST to public paths. (LIVE-PROVEN above.)
- **DB-1 / storage-objects-anon-write-delete** (`supabase/schema.sql:197`) — storage policies named
  "service role" have no role clause; **anon can INSERT/UPDATE/DELETE any object** in the public media
  bucket (deface images, stored-file injection, storage flooding).
- **DEP-1 / next@16.2.2** — `npm audit` shows `next` fixable at **16.3.0 (non-major)**, patching multiple
  Middleware/Proxy-bypass advisories, Server Action DoS, Image-Optimization DoS, SSRF, and CSP-nonce XSS.

**HIGH:**
- **AUTH-2/oracle** — session cookie is an unsalted 64-bit hash of `user:pass` → offline password oracle.
- **DATA-1 / unauthenticated-pii-exfiltration** — `getLeads`, `getBookings`, `getReviews` return full
  `leads`/`bookings` PII and reviewer emails to any unauthenticated caller (via AUTH-4).
- **DB-2 / reviews anon-insert** (`schema.sql:183`, `with check (true)`) — anon can self-publish and
  self-feature testimonials straight onto the homepage.
- **AUTH-3 / login-no-rate-limiting**; **gallery getSignedUploadUrl** mints upload tokens unauthenticated;
  **updateSiteConfig defacement**; **sitemap/robots baked with apex host** while prod serves `www`.

**MEDIUM (reliability + config):** no error boundaries anywhere (REL-1); silent DB-error empty shell (REL-4);
event-detail transient DB error → hard 404; root layout `getLang()` (cookies) forces every route dynamic,
killing all caching and adding a service-role query per render; public site reads bypass RLS via service
role (DATA-1 architecture); unvalidated DB URLs rendered into `href` (javascript: DOM-XSS, plantable via
AUTH-4); build succeeds with zero env vars (all config failures deferred to runtime 500s); no observability.

**Confirmed positives (already correct):** empty-data rendering is crash-safe; i18n first-render is
hydration-safe; `submitContact`/`submitBooking` use the public client with server validation, explicit
fields, and forced status (no mass-assignment); no `dangerouslySetInnerHTML`/`eval` anywhere; Next 16.2.2
is patched against CVE-2025-29927 specifically; all public-read tables have public-read RLS policies.

---

## 7. Fix Plan (execution order)

- **A. Auth core:** signed/expiring/timing-safe session token (kills sentinel + oracle + no-expiry);
  `requireAdmin()` DAL; update proxy, loginAction (timing-safe + rate limit), upload route.
- **B. Guard every admin action** with `requireAdmin()`; move public reads to the anon client (DATA-1).
- **C. DB migration `011_security_hardening.sql`:** service-role-only storage writes; bounded review/lead/
  booking inserts (force status, block moderation columns, length caps).
- **D. Reliability:** `global-error.tsx` + root `error.tsx` + `not-found.tsx` + `loading.tsx`; Supabase
  query timeout wrapper (fast-fail + graceful empty); event-detail 404-vs-error fix; featured-event → public
  client + cache header.
- **E. HTTP/config:** security headers + CSP in `next.config.ts`; `safeExternalUrl()` on every DB-sourced
  href; robots/sitemap canonical host; tighten image remotePatterns.
- **F. Dependencies:** `next@16.3.0` + non-breaking `npm audit fix`; rebuild/retest.
- **G. Env/CI/observability:** `.env.example`, `.nvmrc`, `engines`, README env section, GitHub Actions CI
  (lint+typecheck+test+build), minimal server error logging.
- **H. Regression tests** for every fix + full verification loop + browser smoke + production passive check.

---

## 5. Verification Log

| Check | Command | Result |
|---|---|---|
| Clean dependency install | `npm ci` | ✅ PASS (node_modules was absent at start → cold install) |
| Production build | `npm run build` | ✅ PASS (Next 16.3.0; one transient gstatic font 404 → clean rebuild OK) |
| Lint | `npm run lint` | ✅ PASS (0 errors, 7 pre-existing warnings) |
| Typecheck | `tsc --noEmit` | ✅ PASS (0 errors) |
| Unit tests | `npm test` | ✅ PASS (112/112, up from 79) |
| Dependency vulnerability audit | `npm audit` | ✅ PASS (0 vulnerabilities, was 9) |
| Secret scan (working tree + full git history) | delegated | ✅ CLEAN — no secrets committed; nothing to rotate |
| Auth bypass (AUTH-4) live re-test | curl POST admin actions → `/` | ✅ CLOSED (all return `No autorizado.`; authed passes) |
| Sentinel bypass (AUTH-1) live re-test | forged `unconfigured` cookie | ✅ CLOSED (307) |
| Security headers | curl -D | ✅ PRESENT (CSP, HSTS, XFO, nosniff, referrer, permissions, admin no-store) |
| Browser smoke tests (Playwright) | pending | ⛔ NOT DONE — see AUDIT_HANDOFF.md #2 |
| Migration 011 applied to prod Supabase | Supabase SQL Editor | ⛔ NOT DONE — BLOCKING, see AUDIT_HANDOFF.md #1 |
| Production smoke test | pending | ⛔ NOT DONE — needs deploy, see AUDIT_HANDOFF.md #5 |

See **AUDIT_HANDOFF.md** for the full done/remaining breakdown to resume from.

**Note on the clean-environment test:** `node_modules/` was **absent** at audit start, so the very
first action was a cold `npm ci` from the committed lockfile. This is the clean-environment
reproducibility check and its outcome is recorded above.

---

## 6. Remaining Work

- [ ] Merge and triage parallel audit findings
- [ ] Fix confirmed critical/high findings
- [ ] Establish local runnable environment and reproduce reported user-facing failures
- [ ] Browser smoke tests across mobile / tablet / desktop, both languages
- [ ] Regression tests for every fix
- [ ] Full verification loop (install, lint, typecheck, test, build, browser)
- [ ] Production (passive, non-destructive) smoke test
- [ ] Final adversarial review
