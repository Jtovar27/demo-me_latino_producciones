import { vi } from 'vitest';

// ── next/cache ───────────────────────────────────────────────────────────────
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// ── next/navigation ──────────────────────────────────────────────────────────
// redirect() throws a special Next.js error — simulate that so tests can catch it
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw Object.assign(new Error(`NEXT_REDIRECT:${url}`), { digest: `NEXT_REDIRECT:${url}` });
  }),
}));

// ── next/headers ─────────────────────────────────────────────────────────────
const mockCookieStore = {
  set: vi.fn(),
  delete: vi.fn(),
  get: vi.fn(),
  getAll: vi.fn(() => []),
};
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => mockCookieStore),
}));

export { mockCookieStore };
