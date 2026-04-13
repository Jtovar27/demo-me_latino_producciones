import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSupabaseClient } from './helpers/supabase-mock';

const mockClient = mockSupabaseClient();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mockClient,
}));

async function getActions() {
  return import('../src/app/actions/gallery');
}

function makeFile(name: string, type: string, size = 1024): File {
  const blob = new Blob(['x'.repeat(size)], { type });
  return new File([blob], name, { type });
}

describe('uploadMediaFile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns error when no file is provided', async () => {
    const { uploadMediaFile } = await getActions();
    const fd = new FormData();
    const result = await uploadMediaFile(fd);
    expect(result).toEqual({ error: 'No file provided' });
  });

  it('rejects disallowed MIME types', async () => {
    const { uploadMediaFile } = await getActions();
    const fd = new FormData();
    fd.append('file', makeFile('doc.pdf', 'application/pdf'));
    const result = await uploadMediaFile(fd);
    expect(result).toEqual({ error: expect.stringContaining('no permitido') });
  });

  it('rejects files over 100 MB', async () => {
    const { uploadMediaFile } = await getActions();
    const fd = new FormData();
    const bigFile = makeFile('huge.jpg', 'image/jpeg', 101 * 1024 * 1024);
    fd.append('file', bigFile);
    const result = await uploadMediaFile(fd);
    expect(result).toEqual({ error: 'Archivo demasiado grande (máx 100 MB).' });
  });

  it('cleans up storage on DB insert failure', async () => {
    const removeFn = vi.fn().mockResolvedValue({ error: null });
    mockClient.storage.from = vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://cdn.example.com/img.jpg' } }),
      remove: removeFn,
    });
    mockClient._fromFn.mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB insert failed' } }),
    });
    const { uploadMediaFile } = await getActions();
    const fd = new FormData();
    fd.append('file', makeFile('photo.jpg', 'image/jpeg'));
    const result = await uploadMediaFile(fd);
    expect(result).toEqual({ error: 'DB insert failed' });
    expect(removeFn).toHaveBeenCalled(); // Storage cleaned up
  });
});

describe('deleteMediaFile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deletes DB record BEFORE storage (safe order)', async () => {
    const callOrder: string[] = [];
    const eqFn = vi.fn().mockImplementation(() => {
      callOrder.push('db-delete');
      return Promise.resolve({ error: null });
    });
    const removeFn = vi.fn().mockImplementation(() => {
      callOrder.push('storage-remove');
      return Promise.resolve({ error: null });
    });
    mockClient._fromFn.mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: eqFn,
    });
    mockClient.storage.from = vi.fn().mockReturnValue({ remove: removeFn });

    const { deleteMediaFile } = await getActions();
    await deleteMediaFile('item-id', 'images/test.jpg');
    expect(callOrder[0]).toBe('db-delete');
    expect(callOrder[1]).toBe('storage-remove');
  });

  it('returns error if DB delete fails (does not touch storage)', async () => {
    mockClient._fromFn.mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: { message: 'FK constraint' } }),
    });
    const removeFn = vi.fn();
    mockClient.storage.from = vi.fn().mockReturnValue({ remove: removeFn });

    const { deleteMediaFile } = await getActions();
    const result = await deleteMediaFile('item-id', 'images/test.jpg');
    expect(result).toEqual({ error: 'FK constraint' });
    expect(removeFn).not.toHaveBeenCalled();
  });

  it('returns success even if storage removal fails (logs only)', async () => {
    mockClient._fromFn.mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    mockClient.storage.from = vi.fn().mockReturnValue({
      remove: vi.fn().mockResolvedValue({ error: { message: 'Storage error' } }),
    });
    const { deleteMediaFile } = await getActions();
    const result = await deleteMediaFile('item-id', 'images/test.jpg');
    expect(result).toEqual({ success: true });
  });
});
