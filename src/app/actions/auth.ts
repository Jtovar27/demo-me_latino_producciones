'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const SESSION_COOKIE = 'me_admin_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function buildSessionToken(): string {
  // Must stay in sync with proxy.ts buildExpectedToken()
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

export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  const expectedUser = process.env.ADMIN_USERNAME ?? 'admin';
  const expectedPass = process.env.ADMIN_PASSWORD ?? '';

  if (username !== expectedUser || password !== expectedPass) {
    return { error: 'Credenciales incorrectas.' };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, buildSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });

  // Validate the `from` redirect to prevent open-redirect attacks.
  // Only allow paths that start with /admin (never external URLs).
  const from = formData.get('from') as string | null;
  const safeDest =
    from && from.startsWith('/admin') && !from.startsWith('//') ? from : '/admin';

  redirect(safeDest);
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect('/admin/login');
}
