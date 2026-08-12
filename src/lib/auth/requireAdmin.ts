// This module uses next/headers (cookies()), which is server-only and throws if reached from a client
// bundle — so it never leaks the authorization logic to the browser.
import { cookies } from 'next/headers';
import { verifySessionToken } from './session';

export const SESSION_COOKIE = 'me_admin_session';

/**
 * The authoritative, server-side authorization check for admin operations.
 *
 * WHY THIS EXISTS: `proxy.ts` only guards `/admin/*` *page* paths. Server Actions are POST endpoints
 * dispatched by an action id and are reachable at ANY route the action module was compiled into —
 * including public pages the proxy never sees. Per the Next.js data-security guidance, the proxy is an
 * optimistic check only; the real authorization must live next to the data. Every mutating action and
 * every admin-only read MUST call this first.
 *
 * Returns `null` when authorized, or an error object suitable for returning directly from an action.
 * It never throws for the unauthorized case, so callers can `return unauthorized ?? await realWork()`.
 */
export async function requireAdmin(): Promise<{ error: string } | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!verifySessionToken(token)) {
    return { error: 'No autorizado.' };
  }
  return null;
}

/** Boolean form, for callers (e.g. route handlers) that build their own response. */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}
