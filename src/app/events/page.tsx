import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import EventsFilter from '@/components/events/EventsFilter';
import { getEvents } from '@/app/actions/events';
import { getLang } from '@/lib/i18n/getLang';

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  const lang = await getLang();
  const { data: events } = await getEvents();
  const upcomingCount = events.filter((e) => e.status === 'upcoming').length;
  const cities = new Set(events.map((e) => e.city)).size;

  return (
    <PublicLayout>

      {/* ── A. HERO ──────────────────────────────────────────────── */}
      <section className="bg-[#F7F3EE] pt-32 pb-20 px-6 md:px-12 lg:px-20 overflow-hidden">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-12">

          {/* Label */}
          <div className="hero-label flex flex-col gap-2">
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#A56E52]">
              {lang === 'en' ? 'Upcoming Events' : 'Próximos Eventos'}
            </span>
            <div className="h-px w-8 bg-[#A56E52]" />
          </div>

          {/* Main content row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-end">
            {/* H1 */}
            <h1
              className="hero-h1 font-serif text-4xl md:text-5xl lg:text-6xl font-normal leading-tight text-[#2A2421]"
            >
              {lang === 'en'
                ? 'Every experience, an opportunity for transformation.'
                : 'Cada experiencia, una oportunidad de transformación.'}
            </h1>

            {/* Intro + quick stats */}
            <div className="flex flex-col gap-8">
              <p className="font-sans text-base leading-relaxed text-[#5B4638] max-w-lg">
                {lang === 'en'
                  ? 'From Miami to Chicago, ME Producciones produces events that combine editorial purpose, authentic community, and world-class production. Find the experience designed for this moment in your life.'
                  : 'Desde Miami hasta Chicago, ME Producciones produce eventos que combinan propósito editorial, comunidad auténtica y producción de clase mundial. Encuentra la experiencia diseñada para este momento de tu vida.'}
              </p>

              {/* Stat strip */}
              <div className="flex gap-10 pt-4 border-t border-[#D7C6B2]">
                <div>
                  <p className="font-serif text-3xl font-normal text-[#2A2421]">
                    {upcomingCount}
                  </p>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52] mt-1">
                    {lang === 'en' ? 'Upcoming' : 'Próximos'}
                  </p>
                </div>
                <div>
                  <p className="font-serif text-3xl font-normal text-[#2A2421]">
                    {cities}
                  </p>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52] mt-1">
                    {lang === 'en' ? 'Cities' : 'Ciudades'}
                  </p>
                </div>
                <div>
                  <p className="font-serif text-3xl font-normal text-[#2A2421]">
                    {events.length}
                  </p>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52] mt-1">
                    {lang === 'en' ? 'Total events' : 'Total eventos'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── B. FILTER + EVENTS GRID (Client Component) ──────────── */}
      <div className="max-w-[1400px] mx-auto w-full px-6 md:px-12 lg:px-20 py-16">
        <EventsFilter events={events} />
      </div>

      {/* ── C. CUSTOM EVENTS CTA ─────────────────────────────────── */}
      <section className="bg-[#2A2421] py-24 md:py-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-[1400px] mx-auto">
          <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-10">

            <div className="flex flex-col items-center gap-2">
              <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#A56E52]">
                {lang === 'en' ? 'Custom production' : 'Producción personalizada'}
              </span>
              <div className="h-px w-8 bg-[#A56E52]" />
            </div>

            <h2
              className="font-serif text-4xl md:text-5xl font-normal leading-tight text-[#F7F3EE]"
            >
              {lang === 'en'
                ? 'Looking to produce your own event?'
                : '¿Buscas producir tu propio evento?'}
            </h2>

            <p className="font-sans text-base leading-relaxed text-[#B89E87] max-w-xl">
              {lang === 'en'
                ? 'Our production team works with brands, organizations, and leaders to design tailor-made experiences — from editorial conceptualization to full execution in any city in the country. Tell us your vision.'
                : 'Nuestro equipo de producción trabaja con marcas, organizaciones y líderes para diseñar experiencias a medida — desde conceptualización editorial hasta ejecución completa en cualquier ciudad del país. Cuéntanos tu visión.'}
            </p>

            <Button href="/contact" variant="terracotta" size="lg">
              {lang === 'en' ? 'Contact the team' : 'Contactar al equipo'}
            </Button>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
