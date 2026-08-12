import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSupabaseClient } from './helpers/supabase-mock';

/**
 * AUTH-4 regression: every admin/mutating server action MUST verify authorization itself,
 * because Server Actions are reachable at public route paths the proxy never guards.
 *
 * Here isAdmin() is forced false (unauthenticated). Each guarded action must:
 *   1) return { error: 'No autorizado.' } (or the {data, error} equivalent), and
 *   2) NEVER touch the database — i.e. never call the Supabase client's .from()/.storage.
 */

const mockAdminClient = mockSupabaseClient();
const mockPublicClient = mockSupabaseClient();

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => mockAdminClient }));
vi.mock('@/lib/supabase/public', () => ({ createPublicClient: () => mockPublicClient }));
vi.mock('@/lib/auth/requireAdmin', () => ({
  isAdmin: vi.fn(async () => false),
  requireAdmin: vi.fn(async () => ({ error: 'No autorizado.' })),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

function noDbTouched() {
  expect(mockAdminClient.from).not.toHaveBeenCalled();
  expect(mockAdminClient.storage.from).not.toHaveBeenCalled();
}

beforeEach(() => vi.clearAllMocks());

describe('unauthenticated callers are rejected before any DB access', () => {
  it('events: upsertEvent / deleteEvent / setFeaturedForPopup', async () => {
    const m = await import('../src/app/actions/events');
    expect(await m.upsertEvent(new FormData())).toEqual({ error: 'No autorizado.' });
    expect(await m.deleteEvent('any-id')).toEqual({ error: 'No autorizado.' });
    expect(await m.setFeaturedForPopup('any-id')).toEqual({ error: 'No autorizado.' });
    noDbTouched();
  });

  it('settings: updateSiteConfig', async () => {
    const m = await import('../src/app/actions/settings');
    expect(await m.updateSiteConfig(new FormData())).toEqual({ error: 'No autorizado.' });
    noDbTouched();
  });

  it('reviews: mutations + admin read', async () => {
    const m = await import('../src/app/actions/reviews');
    expect(await m.upsertReview(new FormData())).toEqual({ error: 'No autorizado.' });
    expect(await m.setReviewStatus('id', 'published')).toEqual({ error: 'No autorizado.' });
    expect(await m.setReviewFeatured('id', true)).toEqual({ error: 'No autorizado.' });
    expect(await m.deleteReview('id')).toEqual({ error: 'No autorizado.' });
    expect(await m.getReviews()).toEqual({ data: [], error: 'No autorizado.' });
    noDbTouched();
  });

  it('leads: updateLeadStatus + getLeads (PII)', async () => {
    const m = await import('../src/app/actions/leads');
    expect(await m.updateLeadStatus('id', 'contacted')).toEqual({ error: 'No autorizado.' });
    expect(await m.getLeads()).toEqual({ data: [], error: 'No autorizado.' });
    noDbTouched();
  });

  it('bookings: updateBooking + getBookings (PII)', async () => {
    const m = await import('../src/app/actions/bookings');
    expect(await m.updateBooking('id', { status: 'confirmed' })).toEqual({ error: 'No autorizado.' });
    expect(await m.getBookings()).toEqual({ data: [], error: 'No autorizado.' });
    noDbTouched();
  });

  it('experiences: upsertExperience / deleteExperience', async () => {
    const m = await import('../src/app/actions/experiences');
    expect(await m.upsertExperience(new FormData())).toEqual({ error: 'No autorizado.' });
    expect(await m.deleteExperience('id')).toEqual({ error: 'No autorizado.' });
    noDbTouched();
  });

  it('speakers: upsertSpeaker / deleteSpeaker / reorderSpeakers', async () => {
    const m = await import('../src/app/actions/speakers');
    expect(await m.upsertSpeaker(new FormData())).toEqual({ error: 'No autorizado.' });
    expect(await m.deleteSpeaker('id')).toEqual({ error: 'No autorizado.' });
    expect(await m.reorderSpeakers(['a', 'b'])).toEqual({ error: 'No autorizado.' });
    noDbTouched();
  });

  it('sponsors: upsertSponsor / reorderSponsors / deleteSponsor', async () => {
    const m = await import('../src/app/actions/sponsors');
    expect(await m.upsertSponsor(new FormData())).toEqual({ error: 'No autorizado.' });
    expect(await m.reorderSponsors('gold', ['a'])).toEqual({ error: 'No autorizado.' });
    expect(await m.deleteSponsor('id')).toEqual({ error: 'No autorizado.' });
    noDbTouched();
  });

  it('hero: mutations + admin read', async () => {
    const m = await import('../src/app/actions/hero');
    expect(await m.upsertHeroSlide(new FormData())).toEqual({ error: 'No autorizado.' });
    expect(await m.deleteHeroSlide('id')).toEqual({ error: 'No autorizado.' });
    expect(await m.reorderHeroSlides(['a'])).toEqual({ error: 'No autorizado.' });
    expect(await m.toggleHeroSlide('id', true)).toEqual({ error: 'No autorizado.' });
    expect(await m.getHeroSlides()).toEqual({ data: [], error: 'No autorizado.' });
    noDbTouched();
  });

  it('flagship: mutations + admin read', async () => {
    const m = await import('../src/app/actions/flagship');
    expect(await m.createFlagshipEvent(new FormData())).toEqual({ error: 'No autorizado.' });
    expect(await m.updateFlagshipEvent('id', new FormData())).toEqual({ error: 'No autorizado.' });
    expect(await m.deleteFlagshipEvent('id')).toEqual({ error: 'No autorizado.' });
    expect(await m.getAllFlagshipEvents()).toEqual({ data: null, error: 'No autorizado.' });
    noDbTouched();
  });

  it('gallery: mutations + admin read + signed-url minting', async () => {
    const m = await import('../src/app/actions/gallery');
    const file = new File(['x'], 'a.png', { type: 'image/png' });
    const fd = new FormData();
    fd.append('file', file);
    expect(await m.uploadMediaFile(fd)).toEqual({ error: 'No autorizado.' });
    expect(await m.deleteMediaFile('id', 'images/x.png')).toEqual({ error: 'No autorizado.' });
    expect(await m.getSignedUploadUrl('a.png', 'image/png')).toEqual({ error: 'No autorizado.' });
    expect(await m.createGalleryItem({ storage_path: 'x', alt: 'a', media_type: 'image', category: 'c' })).toEqual({ error: 'No autorizado.' });
    expect(await m.updateGalleryItem('id', { alt: 'z' })).toEqual({ error: 'No autorizado.' });
    expect(await m.getGalleryItems()).toEqual({ data: [], error: 'No autorizado.' });
    noDbTouched();
  });

  it('realHappiness: speaker + host mutations and admin reads', async () => {
    const m = await import('../src/app/actions/realHappiness');
    expect(await m.upsertRealHappinessSpeaker(new FormData())).toEqual({ error: 'No autorizado.' });
    expect(await m.deleteRealHappinessSpeaker('id')).toEqual({ error: 'No autorizado.' });
    expect(await m.reorderRealHappinessSpeakers(['a'])).toEqual({ error: 'No autorizado.' });
    expect(await m.upsertRealHappinessHost(new FormData())).toEqual({ error: 'No autorizado.' });
    expect(await m.deleteRealHappinessHost('id')).toEqual({ error: 'No autorizado.' });
    expect(await m.reorderRealHappinessHosts(['a'])).toEqual({ error: 'No autorizado.' });
    expect(await m.getAllRealHappinessSpeakers()).toEqual({ data: [], error: 'No autorizado.' });
    expect(await m.getAllRealHappinessHosts()).toEqual({ data: [], error: 'No autorizado.' });
    noDbTouched();
  });
});
