'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { buildSessionToken, getSafeRedirect } from '@/lib/auth/session';

const SESSION_COOKIE = 'me_admin_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function loginAction(formData: FormData) {
  const username = (formData.get('username') as string)?.trim();
  const password = formData.get('password') as string;

  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;

  if (!expectedUser || !expectedPass || !username || !password || username !== expectedUser || password !== expectedPass) {
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

  redirect(getSafeRedirect(formData.get('from') as string | null));
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect('/admin/login');
}
