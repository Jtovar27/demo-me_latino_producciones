import { describe, it, expect, beforeEach, vi } from 'vitest';

// Set env vars before importing proxy
beforeEach(() => {
  process.env.ADMIN_USERNAME = 'testadmin';
  process.env.ADMIN_PASSWORD = 'secret123';
  vi.resetModules();
});

async function getProxy() {
  return import('../src/proxy');
}

function makeRequest(pathname: string, cookieValue?: string) {
  const cookies = new Map<string, string>();
  if (cookieValue) cookies.set('me_admin_session', cookieValue);

  return {
    nextUrl: { pathname },
    url: `http://localhost${pathname}`,
    cookies: {
      get: (name: string) => cookies.has(name) ? { value: cookies.get(name)! } : undefined,
    },
  } as unknown as import('next/server').NextRequest;
}

describe('proxy — non-admin routes', () => {
  it('passes through non-admin routes without cookie check', async () => {
    const { proxy } = await getProxy();
    const req = makeRequest('/');
    const res = proxy(req);
    // NextResponse.next() — not a redirect
    expect(res.status).toBe(200);
  });

  it('passes through /api/ routes', async () => {
    const { proxy } = await getProxy();
    const res = proxy(makeRequest('/api/featured-event'));
    expect(res.status).toBe(200);
  });
});

describe('proxy — /admin/login', () => {
  it('always allows login page through', async () => {
    const { proxy } = await getProxy();
    const res = proxy(makeRequest('/admin/login'));
    expect(res.status).toBe(200);
  });
});

describe('proxy — protected /admin routes', () => {
  it('redirects to login when no cookie present', async () => {
    const { proxy } = await getProxy();
    const res = proxy(makeRequest('/admin/events'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/admin/login');
  });

  it('redirects with `from` param when no cookie', async () => {
    const { proxy } = await getProxy();
    const res = proxy(makeRequest('/admin/events'));
    expect(res.headers.get('location')).toContain('from=%2Fadmin%2Fevents');
  });

  it('redirects and clears cookie when token is invalid', async () => {
    const { proxy } = await getProxy();
    const res = proxy(makeRequest('/admin/events', 'bad-token-value'));
    expect(res.status).toBe(307);
  });

  it('allows through with a valid, freshly-issued session token', async () => {
    const { proxy } = await getProxy();
    const { issueSessionToken } = await import('../src/lib/auth/session');
    const token = issueSessionToken();
    expect(token).toBeTruthy();
    const res = proxy(makeRequest('/admin/events', token!));
    expect(res.status).toBe(200);
  });

  it('blocks /admin/settings with wrong token', async () => {
    const { proxy } = await getProxy();
    const res = proxy(makeRequest('/admin/settings', 'meprod_wrong_token'));
    expect(res.status).toBe(307);
  });

  // ── Regression: AUTH-1 — the "unconfigured" sentinel must never authenticate ──
  it('rejects the literal "unconfigured" cookie even when env vars are missing', async () => {
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD;
    vi.resetModules();
    const { proxy } = await getProxy();
    const res = proxy(makeRequest('/admin/events', 'unconfigured'));
    expect(res.status).toBe(307); // redirected to login, NOT granted
  });

  // ── Regression: a token signed with a DIFFERENT password must not verify ──
  it('rejects a token issued under a different admin password (rotation invalidates sessions)', async () => {
    const sessionMod = await import('../src/lib/auth/session');
    process.env.ADMIN_PASSWORD = 'old-password';
    vi.resetModules();
    const oldToken = (await import('../src/lib/auth/session')).issueSessionToken();
    // Rotate the password.
    process.env.ADMIN_PASSWORD = 'new-password';
    vi.resetModules();
    const { proxy } = await getProxy();
    const res = proxy(makeRequest('/admin/events', oldToken!));
    expect(res.status).toBe(307);
    void sessionMod;
  });
});
