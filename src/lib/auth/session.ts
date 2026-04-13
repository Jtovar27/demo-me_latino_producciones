/**
 * Shared session-token builder.
 * Single source of truth used by both proxy.ts and auth actions.
 * Keeps the two in sync — a divergence would lock all users out.
 */
export function buildSessionToken(): string {
  const raw = `${process.env.ADMIN_USERNAME ?? 'admin'}:${process.env.ADMIN_PASSWORD ?? ''}`;
  let h1 = 5381;
  let h2 = 0x811c9dc5;
  for (let i = 0; i < raw.length; i++) {
    const c = raw.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x9e3779b9) >>> 0;
    h2 = Math.imul(h2 ^ c, 0x01000193) >>> 0;
  }
  const part1 = (h1 ^ (h2 >>> 16)).toString(36).padStart(7, '0');
  const part2 = (h2 ^ (h1 >>> 16)).toString(36).padStart(7, '0');
  return `meprod_${part1}${part2}_v2`;
}

/**
 * Validates and sanitizes the `from` redirect parameter to prevent open-redirect attacks.
 * Only allows same-origin paths that start with /admin.
 */
export function getSafeRedirect(from: string | null | undefined): string {
  if (!from) return '/admin';
  try {
    const url = new URL(from, 'http://localhost');
    // Reject any non-localhost origin (catches \, %2F%2F, and external URLs)
    if (url.hostname !== 'localhost') return '/admin';
    // Only allow /admin paths
    if (!url.pathname.startsWith('/admin')) return '/admin';
    return url.pathname + url.search;
  } catch {
    return '/admin';
  }
}
