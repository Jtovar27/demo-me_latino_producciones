import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSupabaseClient } from './helpers/supabase-mock';

const mockClient = mockSupabaseClient();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mockClient,
}));

async function getActions() {
  return import('../src/app/actions/settings');
}

describe('getSiteConfig', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns config data on success', async () => {
    const fakeConfig = { id: 1, site_name: 'ME Producciones', contact_email: 'hola@me.com' };
    mockClient._fromFn.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: fakeConfig, error: null }),
    });
    const { getSiteConfig } = await getActions();
    const result = await getSiteConfig();
    expect(result.data).toEqual(fakeConfig);
    expect(result.error).toBeNull();
  });

  it('returns null data and error message on DB failure', async () => {
    mockClient._fromFn.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'No rows found' } }),
    });
    const { getSiteConfig } = await getActions();
    const result = await getSiteConfig();
    expect(result.data).toBeNull();
    expect(result.error).toBe('No rows found');
  });
});

describe('updateSiteConfig', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates site config successfully', async () => {
    mockClient._fromFn.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    const { updateSiteConfig } = await getActions();
    const fd = new FormData();
    fd.append('site_name', 'ME Producciones');
    fd.append('contact_email', 'nuevo@me.com');
    const result = await updateSiteConfig(fd);
    expect(result).toEqual({ success: true });
  });

  it('always targets id=1 (single-row config)', async () => {
    const eqFn = vi.fn().mockResolvedValue({ error: null });
    mockClient._fromFn.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: eqFn,
    });
    const { updateSiteConfig } = await getActions();
    await updateSiteConfig(new FormData());
    expect(eqFn).toHaveBeenCalledWith('id', 1);
  });

  it('skips empty fields (undefined not sent to DB)', async () => {
    const updateFn = vi.fn().mockReturnThis();
    mockClient._fromFn.mockReturnValue({
      update: updateFn,
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    const { updateSiteConfig } = await getActions();
    const fd = new FormData();
    // Only site_name provided — others should be undefined
    fd.append('site_name', 'Test Name');
    await updateSiteConfig(fd);
    const payload = updateFn.mock.calls[0][0];
    expect(payload.site_name).toBe('Test Name');
    expect(payload.contact_email).toBeUndefined();
    expect(payload.instagram_url).toBeUndefined();
  });

  it('returns error on DB failure', async () => {
    mockClient._fromFn.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: { message: 'Update failed' } }),
    });
    const { updateSiteConfig } = await getActions();
    const result = await updateSiteConfig(new FormData());
    expect(result).toEqual({ error: 'Update failed' });
  });
});
