import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSupabaseClient } from './helpers/supabase-mock';

const mockAdminClient = mockSupabaseClient();
const mockPublicClient = mockSupabaseClient();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mockAdminClient,
}));
vi.mock('@/lib/supabase/public', () => ({
  createPublicClient: () => mockPublicClient,
}));

async function getActions() {
  return import('../src/app/actions/reviews');
}

describe('submitPublicReview', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns error when name is missing', async () => {
    const { submitPublicReview } = await getActions();
    const fd = new FormData();
    fd.append('rating', '5');
    const result = await submitPublicReview(fd);
    expect(result).toEqual({ error: 'El nombre es requerido.' });
  });

  it('returns error when name is too long', async () => {
    const { submitPublicReview } = await getActions();
    const fd = new FormData();
    fd.append('name', 'A'.repeat(201));
    const result = await submitPublicReview(fd);
    expect(result).toEqual({ error: 'El nombre es requerido.' });
  });

  it('returns error when email is invalid', async () => {
    const { submitPublicReview } = await getActions();
    const fd = new FormData();
    fd.append('name', 'Juan');
    fd.append('email', 'not-an-email');
    const result = await submitPublicReview(fd);
    expect(result).toEqual({ error: 'Email inválido.' });
  });

  it('accepts valid email', async () => {
    mockPublicClient._fromFn.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    });
    const { submitPublicReview } = await getActions();
    const fd = new FormData();
    fd.append('name', 'Juan');
    fd.append('email', 'juan@example.com');
    fd.append('rating', '4');
    const result = await submitPublicReview(fd);
    expect(result).toEqual({ success: true });
  });

  it('defaults rating to 5 when missing', async () => {
    const insertFn = vi.fn().mockResolvedValue({ error: null });
    mockPublicClient._fromFn.mockReturnValue({ insert: insertFn });
    const { submitPublicReview } = await getActions();
    const fd = new FormData();
    fd.append('name', 'Maria');
    await submitPublicReview(fd);
    expect(insertFn).toHaveBeenCalledWith(expect.objectContaining({ rating: 5 }));
  });

  it('clamps invalid rating to 5', async () => {
    const insertFn = vi.fn().mockResolvedValue({ error: null });
    mockPublicClient._fromFn.mockReturnValue({ insert: insertFn });
    const { submitPublicReview } = await getActions();
    const fd = new FormData();
    fd.append('name', 'Maria');
    fd.append('rating', '99');
    await submitPublicReview(fd);
    expect(insertFn).toHaveBeenCalledWith(expect.objectContaining({ rating: 5 }));
  });

  it('always sets status to pending', async () => {
    const insertFn = vi.fn().mockResolvedValue({ error: null });
    mockPublicClient._fromFn.mockReturnValue({ insert: insertFn });
    const { submitPublicReview } = await getActions();
    const fd = new FormData();
    fd.append('name', 'Test User');
    await submitPublicReview(fd);
    expect(insertFn).toHaveBeenCalledWith(expect.objectContaining({ status: 'pending', featured: false }));
  });

  it('returns DB error message on failure', async () => {
    mockPublicClient._fromFn.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: { message: 'unique violation' } }),
    });
    const { submitPublicReview } = await getActions();
    const fd = new FormData();
    fd.append('name', 'Test');
    const result = await submitPublicReview(fd);
    expect(result).toEqual({ error: 'unique violation' });
  });
});

describe('deleteReview', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns success on valid delete', async () => {
    mockAdminClient._fromFn.mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    const { deleteReview } = await getActions();
    const result = await deleteReview('review-id');
    expect(result).toEqual({ success: true });
  });

  it('returns error on DB failure', async () => {
    mockAdminClient._fromFn.mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: { message: 'not found' } }),
    });
    const { deleteReview } = await getActions();
    const result = await deleteReview('review-id');
    expect(result).toEqual({ error: 'not found' });
  });
});

describe('getPublishedReviews', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses public client (not admin)', async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    mockPublicClient._fromFn.mockReturnValue(chain);
    const { getPublishedReviews } = await getActions();
    await getPublishedReviews();
    expect(mockPublicClient._fromFn).toHaveBeenCalledWith('reviews');
    expect(mockAdminClient._fromFn).not.toHaveBeenCalled();
  });
});
