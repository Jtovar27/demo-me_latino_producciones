import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSupabaseClient } from './helpers/supabase-mock';

const mockClient = mockSupabaseClient();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mockClient,
}));

async function getActions() {
  return import('../src/app/actions/events');
}

describe('getEvents', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns data on success', async () => {
    const fakeEvents = [{ id: '1', title: 'Test Event' }];
    mockClient._fromFn.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: fakeEvents, error: null }),
    });
    const { getEvents } = await getActions();
    const result = await getEvents();
    expect(result.data).toEqual(fakeEvents);
    expect(result.error).toBeNull();
  });

  it('returns empty array and error message on DB failure', async () => {
    mockClient._fromFn.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
    });
    const { getEvents } = await getActions();
    const result = await getEvents();
    expect(result.data).toEqual([]);
    expect(result.error).toBe('DB error');
  });
});

describe('upsertEvent — validation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns error when title is missing', async () => {
    const { upsertEvent } = await getActions();
    const fd = new FormData();
    fd.append('slug', 'test-slug');
    fd.append('date', '2026-06-01');
    fd.append('city', 'Miami');
    fd.append('venue', 'Some Venue');
    const result = await upsertEvent(fd);
    expect(result).toEqual({ error: 'Título es requerido.' });
  });

  it('returns error when slug is missing', async () => {
    const { upsertEvent } = await getActions();
    const fd = new FormData();
    fd.append('title', 'Event Title');
    fd.append('date', '2026-06-01');
    fd.append('city', 'Miami');
    fd.append('venue', 'Some Venue');
    const result = await upsertEvent(fd);
    expect(result).toEqual({ error: 'Slug es requerido.' });
  });

  it('coerces non-numeric capacity to 0 (no NaN)', async () => {
    const chain = {
      insert: vi.fn().mockResolvedValue({ error: null }),
    };
    mockClient._fromFn.mockReturnValue(chain);
    const { upsertEvent } = await getActions();
    const fd = new FormData();
    fd.append('title', 'Test');
    fd.append('slug', 'test');
    fd.append('date', '2026-06-01');
    fd.append('city', 'Miami');
    fd.append('venue', 'Venue');
    fd.append('capacity', 'abc'); // non-numeric
    fd.append('price', 'xyz');    // non-numeric
    await upsertEvent(fd);
    const insertCall = chain.insert.mock.calls[0][0];
    expect(insertCall.capacity).toBe(0);
    expect(insertCall.price).toBe(0);
    expect(Number.isNaN(insertCall.capacity)).toBe(false);
    expect(Number.isNaN(insertCall.price)).toBe(false);
  });
});

describe('upsertEvent — ticket tiers', () => {
  beforeEach(() => vi.clearAllMocks());

  function baseForm() {
    const fd = new FormData();
    fd.append('title', 'Tier Event');
    fd.append('slug', 'tier-event');
    fd.append('date', '2026-08-29');
    fd.append('city', 'Miami');
    fd.append('venue', 'Venue');
    return fd;
  }

  it('stores sanitized tiers and mirrors the lowest price; nulls legacy VIP columns', async () => {
    const chain = { insert: vi.fn().mockResolvedValue({ error: null }) };
    mockClient._fromFn.mockReturnValue(chain);
    const { upsertEvent } = await getActions();

    const fd = baseForm();
    fd.append('ticket_tiers', JSON.stringify([
      { name: '  Platinum Table  ', price: '1500', benefits: [' 10 seats ', ''] },
      { name: 'Per person', price: 140, benefits: [] },
      { name: '   ', price: 99, benefits: [] }, // dropped (empty name)
    ]));
    await upsertEvent(fd);

    const insertCall = chain.insert.mock.calls[0][0];
    expect(insertCall.ticket_tiers).toEqual([
      { name: 'Platinum Table', price: 1500, benefits: ['10 seats'] },
      { name: 'Per person', price: 140, benefits: [] },
    ]);
    expect(insertCall.price).toBe(140);       // mirror = lowest priced tier
    expect(insertCall.price_vip).toBeNull();
    expect(insertCall.vip_benefits).toBeNull();
  });

  it('treats malformed tiers JSON as no tiers and keeps legacy price', async () => {
    const chain = { insert: vi.fn().mockResolvedValue({ error: null }) };
    mockClient._fromFn.mockReturnValue(chain);
    const { upsertEvent } = await getActions();

    const fd = baseForm();
    fd.append('ticket_tiers', 'not-json');
    fd.append('price', '200');
    await upsertEvent(fd);

    const insertCall = chain.insert.mock.calls[0][0];
    expect(insertCall.ticket_tiers).toEqual([]);
    expect(insertCall.price).toBe(200);
  });
});

describe('deleteEvent', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns success on valid delete', async () => {
    mockClient._fromFn.mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    const { deleteEvent } = await getActions();
    const result = await deleteEvent('abc-123');
    expect(result).toEqual({ success: true });
  });

  it('returns error on DB failure', async () => {
    mockClient._fromFn.mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: { message: 'Foreign key violation' } }),
    });
    const { deleteEvent } = await getActions();
    const result = await deleteEvent('abc-123');
    expect(result).toEqual({ error: 'Foreign key violation' });
  });
});

describe('setFeaturedForPopup', () => {
  beforeEach(() => vi.clearAllMocks());

  it('stops if clear-all step fails', async () => {
    const eqFn = vi.fn().mockResolvedValue({ error: { message: 'clear failed' } });
    mockClient._fromFn.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      eq: eqFn,
      then: (r: (v: unknown) => void) => Promise.resolve({ error: { message: 'clear failed' } }).then(r),
    });
    const { setFeaturedForPopup } = await getActions();
    // The clear step uses .not() which returns the chain — we need it to resolve with error
    // Simulate by making the chain resolve to error
    const chain = {
      update: vi.fn().mockReturnThis(),
      not: vi.fn().mockResolvedValue({ error: { message: 'clear failed' } }),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    mockClient._fromFn.mockReturnValue(chain);
    const result = await setFeaturedForPopup('event-id');
    expect(result).toEqual({ error: 'clear failed' });
    // The second eq (set featured) should NOT be called
    expect(chain.eq).not.toHaveBeenCalled();
  });

  it('returns success when both steps succeed', async () => {
    let callCount = 0;
    mockClient._fromFn.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // First call: clear all
        return {
          update: vi.fn().mockReturnThis(),
          not: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      // Second call: set featured
      return {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
    });
    const { setFeaturedForPopup } = await getActions();
    const result = await setFeaturedForPopup('event-id');
    expect(result).toEqual({ success: true });
  });
});
