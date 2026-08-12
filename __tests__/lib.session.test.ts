import { describe, it, expect, beforeEach } from 'vitest';
import {
  issueSessionToken,
  verifySessionToken,
  credentialsMatch,
  getSafeRedirect,
  SESSION_TTL_MS,
} from '../src/lib/auth/session';

describe('session token', () => {
  beforeEach(() => {
    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_PASSWORD = 'p@ssw0rd';
  });

  it('issues a token that verifies', () => {
    const t = issueSessionToken();
    expect(t).toBeTruthy();
    expect(verifySessionToken(t)).toBe(true);
  });

  it('rejects a tampered payload', () => {
    const t = issueSessionToken()!;
    const [, sig] = t.split('.');
    const forgedPayload = Buffer.from(JSON.stringify({ iat: 0, exp: Date.now() + 1e9 })).toString('base64url');
    expect(verifySessionToken(`${forgedPayload}.${sig}`)).toBe(false);
  });

  it('rejects an expired token', () => {
    const past = Date.now() - SESSION_TTL_MS - 1000;
    const t = issueSessionToken(past)!;
    expect(verifySessionToken(t)).toBe(false);
  });

  it('rejects garbage and empty values', () => {
    expect(verifySessionToken(undefined)).toBe(false);
    expect(verifySessionToken(null)).toBe(false);
    expect(verifySessionToken('')).toBe(false);
    expect(verifySessionToken('not-a-token')).toBe(false);
    expect(verifySessionToken('a.b')).toBe(false);
  });

  it('AUTH-1 regression: unconfigured env yields no valid token and the "unconfigured" sentinel never verifies', () => {
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD;
    expect(issueSessionToken()).toBeNull();
    expect(verifySessionToken('unconfigured')).toBe(false);
    expect(verifySessionToken('meprod_anything_v2')).toBe(false);
  });

  it('a token stops verifying after the admin password changes (best-effort revocation)', () => {
    const t = issueSessionToken()!;
    process.env.ADMIN_PASSWORD = 'a-different-password';
    expect(verifySessionToken(t)).toBe(false);
  });
});

describe('credentialsMatch (timing-safe)', () => {
  beforeEach(() => {
    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_PASSWORD = 'p@ssw0rd';
  });

  it('accepts exact match', () => {
    expect(credentialsMatch('admin', 'p@ssw0rd')).toBe(true);
  });
  it('rejects wrong username or password', () => {
    expect(credentialsMatch('admin', 'nope')).toBe(false);
    expect(credentialsMatch('root', 'p@ssw0rd')).toBe(false);
  });
  it('rejects empty and unconfigured', () => {
    expect(credentialsMatch('', '')).toBe(false);
    delete process.env.ADMIN_PASSWORD;
    expect(credentialsMatch('admin', 'p@ssw0rd')).toBe(false);
  });
});

describe('getSafeRedirect', () => {
  it('defaults to /admin', () => {
    expect(getSafeRedirect(null)).toBe('/admin');
    expect(getSafeRedirect(undefined)).toBe('/admin');
  });
  it('allows same-origin /admin paths', () => {
    expect(getSafeRedirect('/admin/events')).toBe('/admin/events');
  });
  it('blocks open-redirect payloads', () => {
    expect(getSafeRedirect('https://evil.com')).toBe('/admin');
    expect(getSafeRedirect('//evil.com')).toBe('/admin');
    expect(getSafeRedirect('/evil')).toBe('/admin');
    expect(getSafeRedirect('\\evil.com')).toBe('/admin');
  });
});
