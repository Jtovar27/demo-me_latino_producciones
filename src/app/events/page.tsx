import PublicLayout from '@/components/layout/PublicLayout';
import SectionHeader from '@/components/ui/SectionHeader';
import Button from '@/components/ui/Button';
import EventsFilter from '@/components/events/EventsFilter';
import { events } from '@/lib/data';

export default function EventsPage() {
  return (
    <PublicLayout>

      {/* ── A. HERO ──────────────────────────────────────────────── */}
      <section className="bg-[#F7F3EE] pt-32 pb-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-12">

          {/* Label */}
          <div className="flex flex-col gap-2">
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#A56E52]">
              Próximos Eventos
            </span>
            <div className="h-px w-8 bg-[#A56E52]" />
          </div>

          {/* Main content row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-end">
            {/* H1 */}
            <h1
              className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal leading-tight text-[#2A2421]"

            >
              Cada experiencia, una oportunidad de transformación.
            </h1>

            {/* Intro + quick stats */}
            <div className="flex flex-col gap-8">
              <p className="font-sans text-base leading-relaxed text-[#5B4638] max-w-lg">
                Desde Miami hasta Chicago, ME Latino Producciones produce eventos que combinan
                propósito editorial, comunidad auténtica y producción de clase mundial. Encuentra
                la experiencia diseñada para este momento de tu vida.
              </p>

              {/* Stat strip */}
              <div className="flex gap-10 pt-4 border-t border-[#D7C6B2]">
                <div>
                  <p
                    className="font-serif text-3xl font-normal text-[#2A2421]"

                  >
                    {events.filter((e) => e.status === 'upcoming').length}
                  </p>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52] mt-1">
                    Próximos
                  </p>
                </div>
                <div>
                  <p
                    className="font-serif text-3xl font-normal text-[#2A2421]"

                  >
                    5
                  </p>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52] mt-1">
                    Ciudades
                  </p>
                </div>
                <div>
                  <p
                    className="font-serif text-3xl font-normal text-[#2A2421]"

                  >
                    {events.length}
                  </p>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52] mt-1">
                    Total eventos
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
                Producción personalizada
              </span>
              <div className="h-px w-8 bg-[#A56E52]" />
            </div>

            <h2
              className="font-serif text-4xl md:text-5xl font-normal leading-tight text-[#F7F3EE]"

            >
              ¿Buscas producir tu propio evento?
            </h2>

            <p className="font-sans text-base leading-relaxed text-[#B89E87] max-w-xl">
              Nuestro equipo de producción trabaja con marcas, organizaciones y líderes para
              diseñar experiencias a medida — desde conceptualización editorial hasta ejecución
              completa en cualquier ciudad del país. Cuéntanos tu visión.
            </p>

            <Button href="/contact" variant="terracotta" size="lg">
              Contactar al equipo
            </Button>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
