import { describe, it, expect } from 'vitest';
import { safeExternalUrl } from '../src/lib/utils';

describe('safeExternalUrl', () => {
  it('allows http(s) absolute URLs', () => {
    expect(safeExternalUrl('https://eventbrite.com/e/123')).toBe('https://eventbrite.com/e/123');
    expect(safeExternalUrl('http://example.com/')).toBe('http://example.com/');
  });

  it('allows site-relative paths', () => {
    expect(safeExternalUrl('/events')).toBe('/events');
    expect(safeExternalUrl('/contact?x=1')).toBe('/contact?x=1');
  });

  it('allows mailto and tel', () => {
    expect(safeExternalUrl('mailto:hola@meproducciones.com')).toBe('mailto:hola@meproducciones.com');
    expect(safeExternalUrl('tel:+13055252555')).toBe('tel:+13055252555');
  });

  it('blocks javascript: and other dangerous schemes (XSS)', () => {
    expect(safeExternalUrl('javascript:alert(1)')).toBeNull();
    expect(safeExternalUrl('JavaScript:alert(1)')).toBeNull();
    expect(safeExternalUrl('  javascript:alert(document.cookie)  ')).toBeNull();
    expect(safeExternalUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
    expect(safeExternalUrl('vbscript:msgbox(1)')).toBeNull();
  });

  it('blocks protocol-relative //host (treated as external/ambiguous)', () => {
    expect(safeExternalUrl('//evil.com')).toBeNull();
  });

  it('returns null for empty / nullish / malformed', () => {
    expect(safeExternalUrl(null)).toBeNull();
    expect(safeExternalUrl(undefined)).toBeNull();
    expect(safeExternalUrl('')).toBeNull();
    expect(safeExternalUrl('   ')).toBeNull();
    expect(safeExternalUrl('not a url')).toBeNull();
  });
});
