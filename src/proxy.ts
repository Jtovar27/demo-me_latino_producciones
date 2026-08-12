import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/auth/session';

const SESSION_COOKIE = 'me_admin_session';

/**
 * Optimistic edge guard for /admin *page* navigations. This is NOT the authorization boundary —
 * it only improves UX by redirecting unauthenticated browsers to the login page. The real
 * authorization is enforced inside each Server Action / route handler via requireAdmin(), because
 * Server Actions are reachable at route paths this matcher does not cover.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (!pathname.startsWith('/admin')) return NextResponse.next();

  // Allow the login page through
  if (pathname === '/admin/login') return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!verifySessionToken(token)) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    const res = NextResponse.redirect(loginUrl);
    // Clear any stale/invalid cookie so the browser stops resending it.
    if (token) res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
