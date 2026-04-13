import { vi } from 'vitest';

/**
 * Creates a fluent Supabase query builder mock.
 * Each chainable method returns `this`. The chain resolves when awaited.
 */
export function createChain(resolvedValue: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  const methods = [
    'select', 'insert', 'update', 'delete', 'upsert',
    'eq', 'neq', 'not', 'is', 'in',
    'order', 'limit', 'single', 'maybeSingle',
  ];

  // Make the chain awaitable by adding then/catch/finally
  Object.assign(chain, {
    then: (resolve: (v: unknown) => void) => Promise.resolve(resolvedValue).then(resolve),
    catch: (reject: (e: unknown) => void) => Promise.resolve(resolvedValue).catch(reject),
    finally: (fn: () => void) => Promise.resolve(resolvedValue).finally(fn),
  });

  for (const method of methods) {
    chain[method] = vi.fn().mockReturnValue(chain);
  }

  return chain;
}

/**
 * Creates a full mock of createAdminClient() / createPublicClient().
 * Pass `overrides` to customize per-table or per-method behavior.
 */
export function mockSupabaseClient(defaultResult = { data: [], error: null }) {
  const storageChain = {
    upload: vi.fn().mockResolvedValue({ error: null }),
    remove: vi.fn().mockResolvedValue({ error: null }),
    getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://cdn.example.com/test.jpg' } }),
    from: vi.fn(),
  };
  storageChain.from = vi.fn().mockReturnValue(storageChain);

  const fromFn = vi.fn().mockImplementation(() => createChain(defaultResult));

  return {
    from: fromFn,
    storage: { from: vi.fn().mockReturnValue(storageChain) },
    rpc: vi.fn().mockResolvedValue({ error: null }),
    _storageChain: storageChain,
    _fromFn: fromFn,
  };
}
