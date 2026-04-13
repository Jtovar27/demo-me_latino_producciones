import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { buildSessionToken } from '@/lib/auth/session';

const SESSION_COOKIE = 'me_admin_session';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (!pathname.startsWith('/admin')) return NextResponse.next();

  // Allow the login page through
  if (pathname === '/admin/login') return NextResponse.next();

  // Check session cookie
  const session = request.cookies.get(SESSION_COOKIE);
  if (!session?.value) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate the session token against the shared builder (single source of truth)
  if (session.value !== buildSessionToken()) {
    const loginUrl = new URL('/admin/login', request.url);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
