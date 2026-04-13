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
  return import('../src/app/actions/leads');
}

describe('submitContact', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns error when name is missing', async () => {
    const { submitContact } = await getActions();
    const fd = new FormData();
    fd.append('email', 'user@example.com');
    const result = await submitContact(fd);
    expect(result).toEqual({ error: 'Nombre requerido.' });
  });

  it('returns error when email is missing', async () => {
    const { submitContact } = await getActions();
    const fd = new FormData();
    fd.append('name', 'Juan');
    const result = await submitContact(fd);
    expect(result).toEqual({ error: 'Email inválido.' });
  });

  it('returns error when email format is invalid', async () => {
    const { submitContact } = await getActions();
    const fd = new FormData();
    fd.append('name', 'Juan');
    fd.append('email', 'not-an-email');
    const result = await submitContact(fd);
    expect(result).toEqual({ error: 'Email inválido.' });
  });

  it('submits successfully with valid name and email', async () => {
    mockPublicClient._fromFn.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    });
    const { submitContact } = await getActions();
    const fd = new FormData();
    fd.append('name', 'Juan Pérez');
    fd.append('email', 'juan@example.com');
    fd.append('message', 'Hola!');
    const result = await submitContact(fd);
    expect(result).toEqual({ success: true });
  });

  it('always sets source=website and status=new', async () => {
    const insertFn = vi.fn().mockResolvedValue({ error: null });
    mockPublicClient._fromFn.mockReturnValue({ insert: insertFn });
    const { submitContact } = await getActions();
    const fd = new FormData();
    fd.append('name', 'Test');
    fd.append('email', 'test@example.com');
    await submitContact(fd);
    expect(insertFn).toHaveBeenCalledWith(
      expect.objectContaining({ source: 'website', status: 'new' })
    );
  });

  it('uses public client not admin client', async () => {
    mockPublicClient._fromFn.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    });
    const { submitContact } = await getActions();
    const fd = new FormData();
    fd.append('name', 'Test');
    fd.append('email', 'test@example.com');
    await submitContact(fd);
    expect(mockPublicClient._fromFn).toHaveBeenCalledWith('leads');
    expect(mockAdminClient._fromFn).not.toHaveBeenCalled();
  });
});

describe('updateLeadStatus', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects invalid status values', async () => {
    const { updateLeadStatus } = await getActions();
    const result = await updateLeadStatus('id-123', 'hacked');
    expect(result).toEqual({ error: 'Estado inválido: hacked' });
  });

  it('accepts valid status values', async () => {
    mockAdminClient._fromFn.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    const { updateLeadStatus } = await getActions();
    for (const status of ['new', 'contacted', 'qualified', 'converted', 'closed']) {
      const result = await updateLeadStatus('id-123', status);
      expect(result).toEqual({ success: true });
    }
  });

  it('returns DB error when update fails', async () => {
    mockAdminClient._fromFn.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: { message: 'Connection timeout' } }),
    });
    const { updateLeadStatus } = await getActions();
    const result = await updateLeadStatus('id-123', 'contacted');
    expect(result).toEqual({ error: 'Connection timeout' });
  });
});
