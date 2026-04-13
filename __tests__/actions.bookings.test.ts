import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSupabaseClient } from './helpers/supabase-mock';

const mockClient = mockSupabaseClient();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mockClient,
}));

async function getActions() {
  return import('../src/app/actions/bookings');
}

describe('getBookings', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns bookings on success', async () => {
    const fakeBookings = [{ id: '1', name: 'Ana López', status: 'pending' }];
    mockClient._fromFn.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: fakeBookings, error: null }),
    });
    const { getBookings } = await getActions();
    const result = await getBookings();
    expect(result.data).toEqual(fakeBookings);
    expect(result.error).toBeNull();
  });

  it('returns empty array and error on DB failure', async () => {
    mockClient._fromFn.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: { message: 'timeout' } }),
    });
    const { getBookings } = await getActions();
    const result = await getBookings();
    expect(result.data).toEqual([]);
    expect(result.error).toBe('timeout');
  });
});

describe('updateBooking', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates booking status successfully', async () => {
    mockClient._fromFn.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    const { updateBooking } = await getActions();
    const result = await updateBooking('booking-id', { status: 'confirmed' });
    expect(result).toEqual({ success: true });
  });

  it('updates follow_up flag', async () => {
    const updateFn = vi.fn().mockReturnThis();
    mockClient._fromFn.mockReturnValue({
      update: updateFn,
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    const { updateBooking } = await getActions();
    await updateBooking('booking-id', { follow_up: true });
    expect(updateFn).toHaveBeenCalledWith(
      expect.objectContaining({ follow_up: true })
    );
  });

  it('always includes updated_at in the update payload', async () => {
    const updateFn = vi.fn().mockReturnThis();
    mockClient._fromFn.mockReturnValue({
      update: updateFn,
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    const { updateBooking } = await getActions();
    await updateBooking('booking-id', { status: 'cancelled' });
    expect(updateFn).toHaveBeenCalledWith(
      expect.objectContaining({ updated_at: expect.any(String) })
    );
  });

  it('returns error on DB failure', async () => {
    mockClient._fromFn.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: { message: 'Row not found' } }),
    });
    const { updateBooking } = await getActions();
    const result = await updateBooking('bad-id', { status: 'confirmed' });
    expect(result).toEqual({ error: 'Row not found' });
  });
});
