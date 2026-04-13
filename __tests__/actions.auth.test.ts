import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockCookieStore } from './setup';

// Must be imported AFTER mocks are set up
async function getActions() {
  const mod = await import('../src/app/actions/auth');
  return mod;
}

describe('loginAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_USERNAME = 'testadmin';
    process.env.ADMIN_PASSWORD = 'testpass123';
  });

  it('returns error on wrong username', async () => {
    const { loginAction } = await getActions();
    const fd = new FormData();
    fd.append('username', 'wronguser');
    fd.append('password', 'testpass123');
    const result = await loginAction(fd);
    expect(result).toEqual({ error: 'Credenciales incorrectas.' });
  });

  it('returns error on wrong password', async () => {
    const { loginAction } = await getActions();
    const fd = new FormData();
    fd.append('username', 'testadmin');
    fd.append('password', 'wrongpassword');
    const result = await loginAction(fd);
    expect(result).toEqual({ error: 'Credenciales incorrectas.' });
  });

  it('returns error on empty credentials', async () => {
    const { loginAction } = await getActions();
    const fd = new FormData();
    fd.append('username', '');
    fd.append('password', '');
    const result = await loginAction(fd);
    expect(result).toEqual({ error: 'Credenciales incorrectas.' });
  });

  it('sets session cookie and redirects to /admin on correct credentials', async () => {
    const { loginAction } = await getActions();
    const fd = new FormData();
    fd.append('username', 'testadmin');
    fd.append('password', 'testpass123');
    await expect(loginAction(fd)).rejects.toThrow('NEXT_REDIRECT:/admin');
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      'me_admin_session',
      expect.stringMatching(/^meprod_/),
      expect.objectContaining({ httpOnly: true, sameSite: 'lax' })
    );
  });

  it('redirects to safe `from` param when it starts with /admin', async () => {
    const { loginAction } = await getActions();
    const fd = new FormData();
    fd.append('username', 'testadmin');
    fd.append('password', 'testpass123');
    fd.append('from', '/admin/events');
    await expect(loginAction(fd)).rejects.toThrow('NEXT_REDIRECT:/admin/events');
  });

  it('rejects open-redirect via external URL in `from`', async () => {
    const { loginAction } = await getActions();
    const fd = new FormData();
    fd.append('username', 'testadmin');
    fd.append('password', 'testpass123');
    fd.append('from', 'https://evil.com');
    await expect(loginAction(fd)).rejects.toThrow('NEXT_REDIRECT:/admin');
  });

  it('rejects open-redirect via double-slash bypass', async () => {
    const { loginAction } = await getActions();
    const fd = new FormData();
    fd.append('username', 'testadmin');
    fd.append('password', 'testpass123');
    fd.append('from', '//evil.com');
    await expect(loginAction(fd)).rejects.toThrow('NEXT_REDIRECT:/admin');
  });
});

describe('logoutAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deletes the session cookie and redirects to login', async () => {
    const { logoutAction } = await getActions();
    await expect(logoutAction()).rejects.toThrow('NEXT_REDIRECT:/admin/login');
    expect(mockCookieStore.delete).toHaveBeenCalledWith('me_admin_session');
  });
});
