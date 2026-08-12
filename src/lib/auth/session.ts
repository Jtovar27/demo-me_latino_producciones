import crypto from 'node:crypto';

/**
 * Admin session tokens.
 *
 * Design goals (each fixes a prior defect):
 *  - No "sentinel" value: when credentials are unconfigured, NOTHING verifies. A missing env var must
 *    never produce a token an attacker can guess. `verifySessionToken` returns false in that state.
 *  - Signed, not derived: the token is an HMAC over an expiry payload, so a stolen cookie cannot be
 *    reversed into the credentials (the previous token was a plain hash of `user:pass` — a password oracle).
 *  - Expiring: the payload carries `exp`; an old cookie stops working on its own.
 *  - Key bound to credentials: the signing key is derived from ADMIN_USERNAME/ADMIN_PASSWORD, so rotating
 *    the admin password invalidates every outstanding session (best-effort revocation without a server store).
 *
 * The token is `base64url(payload).base64url(hmac)` where payload = {"iat":<ms>,"exp":<ms>}.
 */

const TOKEN_VERSION = 'v3';
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function getSigningKey(): Buffer | null {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  // Unconfigured → no key → nothing can be issued or verified.
  if (!username || !password) return null;
  return crypto
    .createHash('sha256')
    .update(`me-admin-session:${TOKEN_VERSION}:${username}:${password}`)
    .digest();
}

function sign(payloadB64: string, key: Buffer): string {
  return crypto.createHmac('sha256', key).update(payloadB64).digest('base64url');
}

/**
 * Issues a fresh signed session token, or null when credentials are unconfigured.
 * `now` is injectable for tests.
 */
export function issueSessionToken(now: number = Date.now()): string | null {
  const key = getSigningKey();
  if (!key) return null;
  const payloadB64 = Buffer.from(JSON.stringify({ iat: now, exp: now + SESSION_TTL_MS })).toString(
    'base64url',
  );
  return `${payloadB64}.${sign(payloadB64, key)}`;
}

/**
 * Verifies a session token: correct signature (timing-safe) AND not expired AND credentials configured.
 * Returns false for anything malformed, tampered, expired, or issued before a credential change.
 */
export function verifySessionToken(
  token: string | null | undefined,
  now: number = Date.now(),
): boolean {
  if (!token || typeof token !== 'string') return false;
  const key = getSigningKey();
  if (!key) return false;

  const dot = token.indexOf('.');
  if (dot <= 0 || dot === token.length - 1) return false;
  const payloadB64 = token.slice(0, dot);
  const providedSig = token.slice(dot + 1);

  const expectedSig = sign(payloadB64, key);
  const a = Buffer.from(providedSig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (typeof payload?.exp !== 'number') return false;
    if (now > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Constant-time credential check. Avoids leaking, via response timing, how much of the
 * username/password matched. Also fails safe when either env var is unset.
 */
export function credentialsMatch(
  username: string | null | undefined,
  password: string | null | undefined,
): boolean {
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPass || !username || !password) return false;
  // Hash each side to a fixed length so timingSafeEqual never throws on length mismatch and the
  // comparison time does not depend on input length.
  const h = (s: string) => crypto.createHash('sha256').update(s).digest();
  const userOk = crypto.timingSafeEqual(h(username), h(expectedUser));
  const passOk = crypto.timingSafeEqual(h(password), h(expectedPass));
  return userOk && passOk;
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
