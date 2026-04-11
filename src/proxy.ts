import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

  // Validate the session token
  const expectedToken = buildExpectedToken();
  if (session.value !== expectedToken) {
    const loginUrl = new URL('/admin/login', request.url);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  return NextResponse.next();
}

function buildExpectedToken(): string {
  // Deterministic token derived from env credentials.
  // Uses a multi-round mix to produce a longer, less guessable value
  // than a single djb2 pass. Node crypto is not available in the Edge
  // runtime used by proxy.ts, so we stay pure-JS but use a stronger mix.
  const raw = `${process.env.ADMIN_USERNAME ?? 'admin'}:${process.env.ADMIN_PASSWORD ?? ''}`;
  // Two independent djb2 passes with different seeds — doubles token
  // entropy and eliminates the single-hash collision surface.
  let h1 = 5381;
  let h2 = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < raw.length; i++) {
    const c = raw.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x9e3779b9) >>> 0;
    h2 = Math.imul(h2 ^ c, 0x01000193) >>> 0;
  }
  // Mix the two halves
  const part1 = (h1 ^ (h2 >>> 16)).toString(36).padStart(7, '0');
  const part2 = (h2 ^ (h1 >>> 16)).toString(36).padStart(7, '0');
  return `meprod_${part1}${part2}_v2`;
}

export const config = {
  matcher: ['/admin/:path*'],
};
