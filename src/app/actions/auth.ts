'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { issueSessionToken, credentialsMatch, getSafeRedirect, SESSION_TTL_MS } from '@/lib/auth/session';

const SESSION_COOKIE = 'me_admin_session';

// ── Simple in-memory brute-force throttle ────────────────────────────────────
// Per-IP fixed window. In-memory is per-instance (fine as a first line on a small deployment);
// document a shared store (KV/Upstash) as the durable upgrade. This exists because the login had
// NO throttle at all, allowing unbounded credential guessing.
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const attempts = new Map<string, { count: number; resetAt: number }>();

function rateLimit(key: string): { limited: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { limited: false, retryAfterMs: 0 };
  }
  entry.count += 1;
  if (entry.count > MAX_ATTEMPTS) {
    return { limited: true, retryAfterMs: entry.resetAt - now };
  }
  return { limited: false, retryAfterMs: 0 };
}

function clearAttempts(key: string) {
  attempts.delete(key);
}

async function clientKey(): Promise<string> {
  const h = await headers();
  // Vercel/most proxies set x-forwarded-for; fall back to a constant so the limiter still bounds total.
  const fwd = h.get('x-forwarded-for');
  return (fwd?.split(',')[0]?.trim()) || h.get('x-real-ip') || 'unknown';
}

export async function loginAction(formData: FormData) {
  const key = await clientKey();
  const { limited } = rateLimit(key);
  if (limited) {
    return { error: 'Demasiados intentos. Inténtalo de nuevo en unos minutos.' };
  }

  const username = (formData.get('username') as string)?.trim();
  const password = formData.get('password') as string;

  // Constant-time credential check; fails safe when env vars are unset.
  if (!credentialsMatch(username, password)) {
    // Generic message — no user enumeration, no disclosure of which field was wrong.
    return { error: 'Credenciales incorrectas.' };
  }

  const token = issueSessionToken();
  if (!token) {
    // Credentials matched but signing key could not be derived — misconfiguration. Fail closed.
    return { error: 'Credenciales incorrectas.' };
  }

  clearAttempts(key);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
    path: '/',
  });

  redirect(getSafeRedirect(formData.get('from') as string | null));
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect('/admin/login');
}
