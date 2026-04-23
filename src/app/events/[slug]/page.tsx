import { notFound } from 'next/navigation';
import { getLang } from '@/lib/i18n/getLang';
import Image from 'next/image';
import Link from 'next/link';
import PublicLayout from '@/components/layout/PublicLayout';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPublishedReviewsForEvent } from '@/app/actions/reviews';
import ReviewSubmitForm from './ReviewSubmitForm';
import EventTicketButtons from '@/components/events/EventTicketButtons';

export const dynamic = 'force-dynamic';

// ── Helpers ───────────────────────────────────────────────────────

function formatFullDate(dateStr: string, locale: string = 'es-US') {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function categoryLabel(cat: string) {
  const map: Record<string, string> = {
    flagship: 'Flagship', wellness: 'Wellness', summit: 'Summit',
    community: 'Community', branded: 'Branded',
  };
  return map[cat] ?? cat;
}

function statusConfig(status: string, lang: 'es' | 'en') {
  if (status === 'upcoming') return { label: lang === 'en' ? 'Upcoming'  : 'Próximo',    styles: 'border-[#A56E52] text-[#A56E52]' };
  if (status === 'sold-out') return { label: lang === 'en' ? 'Sold Out'  : 'Agotado',    styles: 'border-[#2A2421] text-[#F7F3EE] bg-[#2A2421]' };
  return                            { label: lang === 'en' ? 'Past'      : 'Finalizado', styles: 'border-[#D7C6B2] text-[#5B4638]' };
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width="10" height="10" viewBox="0 0 24 24" fill={n <= rating ? '#A56E52' : 'none'}
          stroke="#A56E52" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const lang = await getLang();

  const client = createAdminClient();
  const { data: event, error } = await client
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !event) notFound();

  // Fetch published reviews for this event — filtered at DB level by event_id or event_name
  const { data: eventReviews } = await getPublishedReviewsForEvent(event.id, event.title);

  const sc = statusConfig(event.status, lang);

  return (
    <PublicLayout>

      {/* ── BACK LINK ──────────────────────────────────────────── */}
      <div className="bg-[#F7F3EE] pt-28 pb-0 px-6 md:px-12 lg:px-20">
        <div className="max-w-[1400px] mx-auto">
          <Link href="/events"
            className="inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-widest text-[#A56E52] hover:text-[#2A2421] transition-colors">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {lang === 'en' ? 'All events' : 'Todos los eventos'}
          </Link>
        </div>
      </div>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="bg-[#F7F3EE] pt-8 pb-16 px-6 md:px-12 lg:px-20">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Left — info */}
            <div className="flex flex-col gap-6 order-2 lg:order-1">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`border px-3 py-1 font-sans text-[9px] uppercase tracking-widest ${sc.styles}`}>
                  {sc.label}
                </span>
                <span className="border border-[#EAE1D6] px-3 py-1 font-sans text-[9px] uppercase tracking-widest text-[#5B4638]">
                  {categoryLabel(event.category)}
                </span>
                {event.featured && (
                  <span className="border border-[#A56E52] px-3 py-1 font-sans text-[9px] uppercase tracking-widest text-[#A56E52]">
                    {lang === 'en' ? 'Featured' : 'Destacado'}
                  </span>
                )}
              </div>

              <h1 className="font-serif text-4xl md:text-5xl font-normal leading-tight text-[#2A2421]">
                {lang === 'en' ? (event.title_en ?? event.title) : event.title}
              </h1>

              {/* Date / venue strip */}
              <div className="flex flex-col gap-3 border-l-2 border-[#A56E52] pl-5">
                <div className="flex flex-col gap-0.5">
                  <span className="font-sans text-[9px] uppercase tracking-widest text-[#A56E52]">{lang === 'en' ? 'Date' : 'Fecha'}</span>
                  <span className="font-sans text-sm text-[#2A2421] capitalize">{formatFullDate(event.date, lang === 'en' ? 'en-US' : 'es-US')}</span>
                  {event.end_date && event.end_date !== event.date && (
                    <span className="font-sans text-xs text-[#5B4638]">{lang === 'en' ? 'to' : 'al'} {formatFullDate(event.end_date, lang === 'en' ? 'en-US' : 'es-US')}</span>
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-sans text-[9px] uppercase tracking-widest text-[#A56E52]">{lang === 'en' ? 'Venue' : 'Lugar'}</span>
                  <span className="font-sans text-sm text-[#2A2421]">{event.venue}</span>
                  <span className="font-sans text-xs text-[#5B4638]">{event.city}, {event.state}</span>
                </div>
                {event.price === 0 && !event.price_vip && (
                  <div className="flex flex-col gap-0.5">
                    <span className="font-sans text-[9px] uppercase tracking-widest text-[#A56E52]">{lang === 'en' ? 'Price' : 'Precio'}</span>
                    <span className="font-serif text-xl text-[#2A2421]">{lang === 'en' ? 'Free entry' : 'Entrada libre'}</span>
                  </div>
                )}
                {event.price > 0 && (
                  <div className="flex flex-col gap-0.5">
                    <span className="font-sans text-[9px] uppercase tracking-widest text-[#A56E52]">{lang === 'en' ? 'Regular' : 'Regular'}</span>
                    <span className="font-serif text-2xl text-[#2A2421]">${event.price}</span>
                    <span className="font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">{lang === 'en' ? 'per person' : 'por persona'}</span>
                  </div>
                )}
                {event.price_vip && event.price_vip > 0 && (
                  <div className="flex flex-col gap-0.5">
                    <span className="font-sans text-[9px] uppercase tracking-widest text-[#A56E52]">VIP</span>
                    <span className="font-serif text-2xl text-[#A56E52]">${event.price_vip}</span>
                    <span className="font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">{lang === 'en' ? 'per person' : 'por persona'}</span>
                  </div>
                )}
              </div>

              {event.description && (
                <p className="font-sans text-base leading-relaxed text-[#5B4638]">
                  {lang === 'en' ? (event.description_en ?? event.description) : event.description}
                </p>
              )}

              {event.price_vip && event.price_vip > 0 && event.vip_benefits && event.vip_benefits.length > 0 && (
                <div className="border border-[#A56E52]/40 bg-[#F7F3EE] p-5 flex flex-col gap-3">
                  <span className="font-sans text-[9px] uppercase tracking-widest text-[#A56E52]">
                    {lang === 'en' ? 'VIP — Includes' : 'VIP — Incluye'}
                  </span>
                  <ul className="flex flex-col gap-2">
                    {event.vip_benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2">
                        <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-[#A56E52]" />
                        <span className="font-sans text-sm text-[#2A2421]">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <span key={tag} className="border border-[#D7C6B2] px-3 py-1 font-sans text-[9px] uppercase tracking-widest text-[#5B4638]">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA buttons */}
              {event.status !== 'past' && (
                <EventTicketButtons
                  event={{
                    title: event.title,
                    date: event.date,
                    city: event.city,
                    state: event.state,
                    price: event.price,
                    price_vip: event.price_vip,
                    vip_benefits: event.vip_benefits,
                    eventbrite_url: event.eventbrite_url,
                    status: event.status,
                  }}
                />
              )}
            </div>

            {/* Right — image */}
            <div className="relative order-1 lg:order-2">
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#EAE1D6]">
                {event.image_url ? (
                  <Image
                    src={event.image_url}
                    alt={event.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-serif text-6xl text-[#D7C6B2]">ME</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── REVIEWS SECTION ────────────────────────────────────── */}
      {eventReviews.length > 0 && (
        <section className="bg-[#EAE1D6] py-16 px-6 md:px-12 lg:px-20">
          <div className="max-w-[1400px] mx-auto flex flex-col gap-10">
            <div className="flex flex-col gap-2">
              <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#A56E52]">
                {lang === 'en' ? 'Testimonials' : 'Testimonios'}
              </span>
              <div className="h-px w-8 bg-[#A56E52]" />
              <h2 className="font-serif text-2xl md:text-3xl font-normal text-[#2A2421] mt-2">
                {lang === 'en' ? 'What those who lived this event say.' : 'Lo que dicen quienes vivieron este evento.'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#C4B09A]">
              {eventReviews.map((r) => (
                <div key={r.id} className="bg-[#FDFAF7] p-8 flex flex-col gap-4">
                  <StarRow rating={r.rating ?? 5} />
                  {r.text && (
                    <p className="font-sans text-sm leading-relaxed text-[#5B4638] italic">
                      &ldquo;{r.text}&rdquo;
                    </p>
                  )}
                  <div className="mt-auto pt-2 border-t border-[#EAE1D6]">
                    <p className="font-sans text-sm font-medium text-[#2A2421]">{r.name}</p>
                    {r.role && <p className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52] mt-0.5">{r.role}</p>}
                    {r.company && <p className="font-sans text-[10px] text-[#5B4638]">{r.company}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── REVIEW SUBMISSION FORM ─────────────────────────────── */}
      <section className="bg-[#F7F3EE] py-16 px-6 md:px-12 lg:px-20">
        <div className="max-w-[1400px] mx-auto">
          <div className="max-w-2xl">
            <div className="flex flex-col gap-2 mb-10">
              <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#A56E52]">
                {lang === 'en' ? 'Your experience' : 'Tu experiencia'}
              </span>
              <div className="h-px w-8 bg-[#A56E52]" />
              <h2 className="font-serif text-2xl md:text-3xl font-normal text-[#2A2421] mt-2">
                {lang === 'en' ? 'Share your testimonial.' : 'Comparte tu testimonio.'}
              </h2>
              <p className="font-sans text-sm leading-relaxed text-[#5B4638] mt-1">
                {lang === 'en' ? 'Your experience inspires others to take the first step. Tell us how it went.' : 'Tu experiencia inspira a otros a dar el primer paso. Cuéntanos cómo fue.'}
              </p>
            </div>
            <ReviewSubmitForm eventName={event.title} />
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
