# Configurable Named Ticket Tiers per Event — Design

**Date:** 2026-06-04
**Project:** ME Producciones / ME Latino Producciones
**Status:** Approved by owner (2026-06-04)
**Stack:** Next.js 16.2.2 (App Router) · React 19 · Tailwind 4 · Supabase · TypeScript

---

## 1. Problem

Today each event has exactly two fixed prices: `price` (shown as **"Regular"**) and `price_vip`
(shown as **"VIP"**), plus a single `vip_benefits` list that only applies to VIP. The labels
"Regular"/"VIP" are hardcoded in the admin form, the purchase modal, the homepage popup, the
event detail page, the listing, and the home cards.

The owner needs to define **arbitrary, named ticket types per event** — e.g. "Platinum Experience
Table (10 seats)", "Golden VIP Table", "Early Bird · Platinum", "Per person" — each with its own
price and benefits, editable per event from the admin panel, flowing to every public surface
without breaking existing events.

## 2. Decisions (locked with owner)

| # | Decision | Choice |
|---|----------|--------|
| 1 | Tier shape | Simple named tier: `{ name, price, benefits[] }`, unlimited per event |
| 2 | Language | Single text (matches today's `vip_benefits`), **not** bilingual |
| 3 | Purchase flow | Buyer picks **one tier + quantity** (same UX as today's Regular/VIP toggle) |
| 4 | Compact price display | `"Desde $<lowest tier price>"` (ignoring $0 tiers) |
| 5 | Existing events | **Automatic / non-breaking** — events with no explicit tiers fall back to derived Regular/VIP from legacy columns |
| 6 | Storage | JSONB column `events.ticket_tiers` (mirrors the existing `flagship_events.venues` JSONB pattern) |

## 3. Data model

Migration `supabase/migrations/008_event_ticket_tiers.sql` (additive, idempotent):

```sql
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS ticket_tiers jsonb NOT NULL DEFAULT '[]'::jsonb;
```

Each element: `{ "name": string, "price": number, "benefits": string[] }`.

Legacy columns `price`, `price_vip`, `vip_benefits` are **kept** as a fallback for events never
edited after this ships. `ticket_tiers` is the source of truth whenever it is non-empty.

TypeScript (`src/types/supabase.ts`):
- New exported type `TicketTier = { name: string; price: number; benefits: string[] }`
  (placed next to `FlagshipVenue`).
- `EventRow.ticket_tiers: TicketTier[]`.

## 4. Single source of truth — `src/lib/tickets.ts` (new, pure, no deps)

This is the key anti-breakage piece. Every consumer (server and client) resolves tiers through
one pure function, so old events keep rendering identically and new events use their tiers.

```ts
export type { TicketTier } from '@/types/supabase';

// Returns the effective tiers for an event.
// - If event.ticket_tiers is non-empty → use it (sanitized).
// - Else derive from legacy: price>0 → {name:'Regular', price, benefits:[]};
//   price_vip>0 → {name:'VIP', price:price_vip, benefits:vip_benefits ?? []}.
// - Else → [] (free event).
export function resolveTicketTiers(event): TicketTier[];

// Lowest price among tiers with price > 0, or null if none (free / no priced tiers).
export function minTierPrice(tiers: TicketTier[]): number | null;

// True when there are no priced tiers (drives the "free attendance" path).
export function isFreeTickets(tiers: TicketTier[]): boolean;
```

Accepts a structurally-typed event (only the fields it needs: `ticket_tiers?`, `price?`,
`price_vip?`, `vip_benefits?`) so both the full `DBEvent` and the popup's partial event object work.

## 5. Admin (`/admin/events`)

Replace the three fixed fields (Price / VIP Price / VIP Benefits) with a **repeatable tier editor**:

- A list of tier rows. Each row: **Name** (text), **Price** (number), **Benefits** (textarea,
  one per line), a **remove** button, and **↑ / ↓** to reorder (array order = display order).
- A **"+ Add tier"** button.
- Stored in form state as `TicketTier[]`; serialized to the FormData field `ticket_tiers` as JSON.
- When editing an existing event with no explicit `ticket_tiers`, the editor is **pre-filled** by
  running `resolveTicketTiers` (so the admin sees "Regular"/"VIP" rows derived from legacy data and
  can edit them).
- Admin list price column shows `minTierPrice` via the resolver (so it keeps working).

## 6. Public surfaces — all route through the resolver

- **`TicketPurchaseModal`**: prop changes from `eventPrice/eventPriceVip/vipBenefits` to
  `tiers: TicketTier[]`. Renders an **N-tier selector** (cards) instead of the Regular/VIP toggle.
  Selecting a tier drives price, total (`tier.price × qty`), and the benefits list. Single priced
  tier → no selector, just show it. No priced tiers → "free attendance" path (unchanged).
  Booking message includes the chosen tier name, e.g. `"3 × Golden VIP Table · Total: $4,200"`.
  **No change to the `bookings` schema or `submitBooking`.**
- **`PromoPopup`** + **`/api/featured-event`**: the route's `select` adds `ticket_tiers` (and keeps
  legacy columns). Popup computes tiers via the resolver, shows `"Desde $min"`, and passes `tiers`
  to the modal.
- **`EventTicketButtons`** (detail) and **`EventsFilter`** (listing): compute resolved tiers from
  the event and pass `tiers` to the modal.
- **Event detail page** (`/events/[slug]`): renders the resolved tier list (name · price · benefits)
  instead of the fixed Regular/VIP blocks.
- **Home page** (`/`) cards: show `"Desde $min"` via `minTierPrice`; free when none priced.

## 7. Server action (`upsertEvent`)

- Parse `ticket_tiers` from FormData (JSON string) → validate: array of objects; trim `name`,
  drop rows with empty name; coerce `price` to a number `>= 0`; `benefits` = array of trimmed
  non-empty strings.
- Write `events.ticket_tiers`.
- To keep the row coherent for any not-yet-migrated reader, mirror `price = minTierPrice ?? 0` and
  set `price_vip = null`, `vip_benefits = null` when explicit tiers are saved. When no tiers are
  provided, preserve today's behavior (legacy price/price_vip/vip_benefits parsing).
- `getEvents` / detail `select('*')` already return the new column.

## 8. i18n (`src/lib/i18n/translations.ts`)

Add admin strings under `adminEvents`: `ticketTiersLbl`, `ticketTiersHint`, `tierNameLbl`,
`tierPriceLbl`, `tierBenefitsLbl`, `tierBenefitsHint`, `addTier`, `removeTier`, `noTiers`,
`moveUp`, `moveDown`. Add a modal label `chooseTier` under `ticketModal`. Tier content itself is
single-language (entered by the admin).

## 9. Testing

- New `__tests__/tickets.test.ts`: `resolveTicketTiers` (explicit tiers / legacy regular only /
  legacy vip only / legacy both / free) · `minTierPrice` (mixed, all-zero, empty) · `isFreeTickets`.
- Extend `__tests__/actions.events.test.ts`: `upsertEvent` parses `ticket_tiers` JSON, sanitizes,
  mirrors `price`, nulls VIP columns; ignores malformed JSON gracefully.
- All 64 existing tests must stay green. `npm run lint` and `npm run build` must pass.

## 10. Files

**New:**
- `supabase/migrations/008_event_ticket_tiers.sql`
- `src/lib/tickets.ts`
- `__tests__/tickets.test.ts`

**Modified:**
- `src/types/supabase.ts` (TicketTier + `EventRow.ticket_tiers`)
- `src/app/actions/events.ts` (parse/store tiers; mirror price)
- `src/app/api/featured-event/route.ts` (select `ticket_tiers`)
- `src/components/ui/TicketPurchaseModal.tsx` (N-tier selector)
- `src/components/ui/PromoPopup.tsx` (resolve tiers; "Desde $min")
- `src/components/events/EventTicketButtons.tsx` (pass tiers)
- `src/components/events/EventsFilter.tsx` (pass tiers)
- `src/app/events/[slug]/page.tsx` (render tier list)
- `src/app/page.tsx` (home cards "Desde $min")
- `src/app/admin/events/page.tsx` (tier editor)
- `src/lib/i18n/translations.ts` (new strings)
- `__tests__/actions.events.test.ts` (new cases)

## 11. Risks / non-goals

- **Non-goal:** multi-tier cart in one purchase, bilingual tier content, time-gated early-bird
  automation (early bird = just another named tier the admin adds/removes).
- **Risk:** events edited after ship lose legacy `price_vip/vip_benefits` (nulled in favor of tiers).
  Acceptable — resolver makes tiers authoritative; legacy remains only for untouched events.
- **Migration must be run in Supabase** before the admin can save tiers (additive; safe to run anytime).
