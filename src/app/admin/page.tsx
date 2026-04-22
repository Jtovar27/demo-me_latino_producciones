import AdminLayout from '@/components/layout/AdminLayout';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { getLang } from '@/lib/i18n/getLang';
import { t, tr } from '@/lib/i18n/translations';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const lang = await getLang();
  const ad = t.adminDashboard;
  const client = createAdminClient();

  // Compute the 12-month window starting from 11 months ago (inclusive of current month)
  const now = new Date();
  const activityMonths = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1, date: d };
  });
  const windowStart = new Date(
    activityMonths[0].year, activityMonths[0].month - 1, 1
  ).toISOString();

  const [eventsRes, speakersRes, sponsorsRes, galleryRes, bookingsRes] = await Promise.all([
    client.from('events').select('id, status, featured'),
    client.from('speakers').select('id, featured'),
    client.from('sponsors').select('id, active'),
    client.from('gallery_items').select('id'),
    client.from('bookings').select('submitted_at').gte('submitted_at', windowStart),
  ]);

  // Aggregate bookings per calendar month for the activity chart
  const recentBookings = bookingsRes.data ?? [];
  const monthlyCounts = activityMonths.map(({ year, month }) =>
    recentBookings.filter((b) => {
      const d = new Date(b.submitted_at);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    }).length
  );
  const maxCount = Math.max(...monthlyCounts, 1); // avoid divide-by-zero when no bookings
  const activityBars = monthlyCounts.map((c) => Math.max(5, Math.round((c / maxCount) * 100)));
  const activityLabelFirst = activityMonths[0].date.toLocaleDateString('es-US', { month: 'short', year: 'numeric' });
  const activityLabelLast  = activityMonths[11].date.toLocaleDateString('es-US', { month: 'short', year: 'numeric' });

  const events = eventsRes.data ?? [];
  const speakers = speakersRes.data ?? [];
  const sponsors = sponsorsRes.data ?? [];
  const gallery = galleryRes.data ?? [];

  const totalEvents = events.length;
  const upcomingEvents = events.filter(e => e.status === 'upcoming').length;
  const featuredSpeakers = speakers.filter(s => s.featured).length;
  const activeSponsors = sponsors.filter(s => s.active).length;

  return (
    <AdminLayout>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Eventos */}
        <div className="border border-[#EAE1D6] bg-[#FDFAF7] p-7">
          <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#5B4638]">{tr(ad.totalEvents, lang)}</p>
          <p className="mt-3 font-sans text-4xl font-light text-[#2A2421]">{totalEvents}</p>
          <p className="mt-1 font-sans text-[10px] uppercase tracking-wider text-[#A56E52]">
            {upcomingEvents} {tr(ad.upcoming, lang)}
          </p>
        </div>

        {/* Speakers */}
        <div className="border border-[#EAE1D6] bg-[#FDFAF7] p-7">
          <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#5B4638]">Speakers</p>
          <p className="mt-3 font-sans text-4xl font-light text-[#2A2421]">{speakers.length}</p>
          <p className="mt-1 font-sans text-[10px] uppercase tracking-wider text-[#A56E52]">
            {featuredSpeakers} {tr(ad.featured, lang)}
          </p>
        </div>

        {/* Sponsors */}
        <div className="border border-[#EAE1D6] bg-[#FDFAF7] p-7">
          <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#5B4638]">Sponsors</p>
          <p className="mt-3 font-sans text-4xl font-light text-[#2A2421]">{activeSponsors}</p>
          <p className="mt-1 font-sans text-[10px] uppercase tracking-wider text-[#A56E52]">
            {tr(ad.active, lang)}
          </p>
        </div>

        {/* Galería */}
        <div className="border border-[#A56E52] bg-[#A56E52]/5 p-7">
          <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#5B4638]">Galería</p>
          <p className="mt-3 font-sans text-4xl font-light text-[#2A2421]">{gallery.length}</p>
          <p className="mt-1 font-sans text-[10px] uppercase tracking-wider text-[#A56E52]">
            {tr(ad.filesUploaded, lang)}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-2 border border-[#2A2421] bg-[#2A2421] px-6 py-3 font-sans text-[11px] uppercase tracking-widest text-[#F7F3EE] transition-colors hover:bg-[#5B4638] hover:border-[#5B4638]"
        >
          {tr(ad.newEvent, lang)}
        </Link>
        <Link
          href="/admin/speakers"
          className="inline-flex items-center gap-2 border border-[#2A2421] px-6 py-3 font-sans text-[11px] uppercase tracking-widest text-[#2A2421] transition-colors hover:bg-[#2A2421] hover:text-[#F7F3EE]"
        >
          {tr(ad.newSpeaker, lang)}
        </Link>
        <Link
          href="/admin/media"
          className="inline-flex items-center gap-2 border border-[#D7C6B2] px-6 py-3 font-sans text-[11px] uppercase tracking-widest text-[#5B4638] transition-colors hover:bg-[#EAE1D6]"
        >
          {tr(ad.uploadMedia, lang)}
        </Link>
        <Link
          href="/admin/sponsors"
          className="inline-flex items-center gap-2 border border-[#D7C6B2] px-6 py-3 font-sans text-[11px] uppercase tracking-widest text-[#5B4638] transition-colors hover:bg-[#EAE1D6]"
        >
          {tr(ad.newSponsor, lang)}
        </Link>
      </div>

      {/* Summary grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Resumen de contenido */}
        <div className="xl:col-span-2 border border-[#EAE1D6] bg-[#FDFAF7]">
          <div className="border-b border-[#EAE1D6] px-7 py-5">
            <p className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#2A2421]">
              {tr(ad.contentStatus, lang)}
            </p>
          </div>
          <div className="divide-y divide-[#EAE1D6]/60">
            <div className="flex items-center justify-between px-7 py-5">
              <div>
                <p className="font-sans text-sm text-[#2A2421]">{tr(ad.events, lang)}</p>
                <p className="font-sans text-[10px] text-[#5B4638] mt-0.5">{upcomingEvents} {tr(ad.upcoming, lang)} · {events.filter(e => e.status === 'past').length} {tr(ad.past, lang)}</p>
              </div>
              <Link href="/admin/events" className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52] hover:text-[#5B4638] transition-colors">
                {tr(ad.manage, lang)}
              </Link>
            </div>
            <div className="flex items-center justify-between px-7 py-5">
              <div>
                <p className="font-sans text-sm text-[#2A2421]">Speakers</p>
                <p className="font-sans text-[10px] text-[#5B4638] mt-0.5">{speakers.length} totales · {featuredSpeakers} {tr(ad.featured, lang)}</p>
              </div>
              <Link href="/admin/speakers" className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52] hover:text-[#5B4638] transition-colors">
                {tr(ad.manage, lang)}
              </Link>
            </div>
            <div className="flex items-center justify-between px-7 py-5">
              <div>
                <p className="font-sans text-sm text-[#2A2421]">Sponsors</p>
                <p className="font-sans text-[10px] text-[#5B4638] mt-0.5">{activeSponsors} {tr(ad.active, lang)} · {sponsors.filter(s => !s.active).length} inactivos</p>
              </div>
              <Link href="/admin/sponsors" className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52] hover:text-[#5B4638] transition-colors">
                {tr(ad.manage, lang)}
              </Link>
            </div>
            <div className="flex items-center justify-between px-7 py-5">
              <div>
                <p className="font-sans text-sm text-[#2A2421]">Galería</p>
                <p className="font-sans text-[10px] text-[#5B4638] mt-0.5">{gallery.length} {tr(ad.filesUploaded, lang)}</p>
              </div>
              <Link href="/admin/media" className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52] hover:text-[#5B4638] transition-colors">
                {tr(ad.manage, lang)}
              </Link>
            </div>
          </div>
        </div>

        {/* Actividad visual */}
        <div className="border border-[#EAE1D6] bg-[#FDFAF7] p-7">
          <p className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#2A2421] mb-1">
            {tr(ad.activity, lang)}
          </p>
          <p className="font-sans text-[10px] uppercase tracking-widest text-[#5B4638] mb-6">
            {tr(ad.last12mo, lang)}
          </p>

          <div className="flex items-end gap-1.5 h-32">
            {activityBars.map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-[#A56E52]/20 hover:bg-[#A56E52]/40 transition-colors relative group"
                style={{ height: `${h}%` }}
              >
                <div
                  className="absolute bottom-0 left-0 right-0 bg-[#A56E52] transition-all duration-300"
                  style={{ height: `${h * 0.6}%` }}
                />
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between">
            <p className="font-sans text-[9px] uppercase tracking-widest text-[#5B4638]">{activityLabelFirst}</p>
            <p className="font-sans text-[9px] uppercase tracking-widest text-[#5B4638]">{activityLabelLast}</p>
          </div>

          <div className="mt-6 border-t border-[#EAE1D6] pt-5 space-y-4">
            <div className="flex justify-between items-center">
              <p className="font-sans text-[10px] uppercase tracking-wider text-[#5B4638]">{tr(ad.featuredEvent, lang)}</p>
              <p className="font-sans text-sm text-[#2A2421] font-medium">
                {events.some(e => e.featured) ? 'Activo' : '—'}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="font-sans text-[10px] uppercase tracking-wider text-[#5B4638]">{tr(ad.upcomingEvents, lang)}</p>
              <p className="font-sans text-sm text-[#2A2421] font-medium">{upcomingEvents}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="font-sans text-[10px] uppercase tracking-wider text-[#5B4638]">{tr(ad.mediaUploaded, lang)}</p>
              <p className="font-sans text-sm text-[#2A2421] font-medium">{gallery.length}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
