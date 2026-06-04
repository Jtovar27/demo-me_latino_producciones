import { describe, it, expect } from 'vitest';
import { resolveTicketTiers, minTierPrice, isFreeTickets } from '../src/lib/tickets';
import type { TicketTier } from '../src/types/supabase';

describe('resolveTicketTiers', () => {
  it('uses explicit ticket_tiers when present', () => {
    const tiers: TicketTier[] = [
      { name: 'Platinum Table', price: 1500, benefits: ['10 seats', 'Front row'] },
      { name: 'Per person', price: 150, benefits: [] },
    ];
    expect(resolveTicketTiers({ ticket_tiers: tiers })).toEqual(tiers);
  });

  it('sanitizes explicit tiers: trims name, coerces price, drops empty-name rows', () => {
    const result = resolveTicketTiers({
      ticket_tiers: [
        { name: '  Golden VIP  ', price: '1400' as unknown as number, benefits: [' meet & greet ', '', '  '] },
        { name: '   ', price: 100, benefits: [] }, // dropped: empty name
        { name: 'Free zone', price: -5 as unknown as number, benefits: [] }, // price clamped to 0
      ],
    });
    expect(result).toEqual([
      { name: 'Golden VIP', price: 1400, benefits: ['meet & greet'] },
      { name: 'Free zone', price: 0, benefits: [] },
    ]);
  });

  it('derives Regular + VIP from legacy columns when no tiers', () => {
    expect(
      resolveTicketTiers({ price: 397, price_vip: 797, vip_benefits: ['Meet & greet', 'Front row'] }),
    ).toEqual([
      { name: 'Regular', price: 397, benefits: [] },
      { name: 'VIP', price: 797, benefits: ['Meet & greet', 'Front row'] },
    ]);
  });

  it('derives Regular only when no VIP price', () => {
    expect(resolveTicketTiers({ price: 250, price_vip: null, vip_benefits: null })).toEqual([
      { name: 'Regular', price: 250, benefits: [] },
    ]);
  });

  it('derives VIP only when regular price is 0', () => {
    expect(resolveTicketTiers({ price: 0, price_vip: 500, vip_benefits: ['Lounge'] })).toEqual([
      { name: 'VIP', price: 500, benefits: ['Lounge'] },
    ]);
  });

  it('returns empty (free) when no tiers and no prices', () => {
    expect(resolveTicketTiers({ price: 0, price_vip: 0, vip_benefits: null })).toEqual([]);
    expect(resolveTicketTiers({})).toEqual([]);
  });

  it('explicit tiers take precedence over legacy columns', () => {
    const result = resolveTicketTiers({
      ticket_tiers: [{ name: 'Only tier', price: 99, benefits: [] }],
      price: 397,
      price_vip: 797,
      vip_benefits: ['ignored'],
    });
    expect(result).toEqual([{ name: 'Only tier', price: 99, benefits: [] }]);
  });

  it('treats null/empty ticket_tiers as no tiers (falls back to legacy)', () => {
    expect(resolveTicketTiers({ ticket_tiers: [], price: 100, price_vip: null })).toEqual([
      { name: 'Regular', price: 100, benefits: [] },
    ]);
    expect(
      resolveTicketTiers({ ticket_tiers: null as unknown as TicketTier[], price: 100, price_vip: null }),
    ).toEqual([{ name: 'Regular', price: 100, benefits: [] }]);
  });
});

describe('minTierPrice', () => {
  it('returns the lowest price among priced tiers', () => {
    expect(
      minTierPrice([
        { name: 'A', price: 1500, benefits: [] },
        { name: 'B', price: 140, benefits: [] },
        { name: 'C', price: 1400, benefits: [] },
      ]),
    ).toBe(140);
  });

  it('ignores $0 tiers when computing the minimum', () => {
    expect(
      minTierPrice([
        { name: 'Free', price: 0, benefits: [] },
        { name: 'Paid', price: 200, benefits: [] },
      ]),
    ).toBe(200);
  });

  it('returns null when there are no priced tiers', () => {
    expect(minTierPrice([])).toBeNull();
    expect(minTierPrice([{ name: 'Free', price: 0, benefits: [] }])).toBeNull();
  });
});

describe('isFreeTickets', () => {
  it('is true when no priced tiers', () => {
    expect(isFreeTickets([])).toBe(true);
    expect(isFreeTickets([{ name: 'Free', price: 0, benefits: [] }])).toBe(true);
  });

  it('is false when at least one tier is priced', () => {
    expect(isFreeTickets([{ name: 'Paid', price: 50, benefits: [] }])).toBe(false);
  });
});
