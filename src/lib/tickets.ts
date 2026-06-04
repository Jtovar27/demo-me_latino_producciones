import type { TicketTier } from '@/types/supabase';

export type { TicketTier };

/**
 * Minimal shape the ticket resolver needs. Both the full `DBEvent` row and the
 * popup's partial event object satisfy it, so every surface resolves tiers the
 * same way.
 */
export interface ResolvableEvent {
  ticket_tiers?: TicketTier[] | null;
  price?: number | null;
  price_vip?: number | null;
  vip_benefits?: string[] | null;
}

function toBenefits(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((b) => String(b).trim()).filter(Boolean);
}

function sanitizeTier(raw: TicketTier): TicketTier | null {
  const name = String(raw?.name ?? '').trim();
  if (!name) return null;
  const priceNum = Number(raw?.price);
  const price = Number.isFinite(priceNum) && priceNum > 0 ? priceNum : 0;
  return { name, price, benefits: toBenefits(raw?.benefits) };
}

/**
 * Normalizes an arbitrary value (e.g. parsed JSON from a form) into a clean
 * `TicketTier[]`: trims names, drops empty-name rows, coerces prices to a
 * non-negative number, and trims/compacts benefits. Used on write (admin
 * action) and read (resolver) so storage and display agree.
 */
export function sanitizeTiers(raw: unknown): TicketTier[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((t) => sanitizeTier(t as TicketTier))
    .filter((t): t is TicketTier => t !== null);
}

/**
 * Returns the effective ticket tiers for an event — the single source of truth
 * used by every public and admin surface.
 *
 * - If `ticket_tiers` is a non-empty array → use it (sanitized).
 * - Otherwise derive `Regular` / `VIP` from the legacy `price` / `price_vip`
 *   columns, so events created before this feature render unchanged.
 * - Otherwise return `[]` (a free event).
 */
export function resolveTicketTiers(event: ResolvableEvent): TicketTier[] {
  const explicit = event.ticket_tiers;
  if (Array.isArray(explicit) && explicit.length > 0) {
    return sanitizeTiers(explicit);
  }

  const tiers: TicketTier[] = [];
  const price = Number(event.price ?? 0);
  const priceVip = Number(event.price_vip ?? 0);
  if (Number.isFinite(price) && price > 0) {
    tiers.push({ name: 'Regular', price, benefits: [] });
  }
  if (Number.isFinite(priceVip) && priceVip > 0) {
    tiers.push({ name: 'VIP', price: priceVip, benefits: toBenefits(event.vip_benefits) });
  }
  return tiers;
}

/** Lowest price among priced tiers, or `null` when there are no priced tiers. */
export function minTierPrice(tiers: TicketTier[]): number | null {
  const priced = tiers.map((t) => t.price).filter((p) => p > 0);
  return priced.length > 0 ? Math.min(...priced) : null;
}

/** True when there are no priced tiers — drives the "free attendance" path. */
export function isFreeTickets(tiers: TicketTier[]): boolean {
  return minTierPrice(tiers) === null;
}
