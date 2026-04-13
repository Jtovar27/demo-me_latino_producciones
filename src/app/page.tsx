import Link from 'next/link';
import Image from 'next/image';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SectionHeader from '@/components/ui/SectionHeader';
import MobileCarousel from '@/components/ui/MobileCarousel';
import { stats } from '@/lib/data';
import { editorialImages } from '@/lib/media';
import { getEvents } from '@/app/actions/events';
import { getSpeakers } from '@/app/actions/speakers';
import { getPublishedReviews } from '@/app/actions/reviews';
import { getSponsors } from '@/app/actions/sponsors';
import { getExperiences } from '@/app/actions/experiences';
import type { DBReview, DBSponsor } from '@/types/supabase';
import ReviewSubmitForm from '@/components/reviews/ReviewSubmitForm';

export const revalidate = 0;

// ── Helpers ────────────────────────────────────

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return {
    month: d.toLocaleString('es-US', { month: 'short' }).toUpperCase(),
    day: String(d.getDate()).padStart(2, '0'),
    year: d.getFullYear(),
    full: d.toLocaleDateString('es-US', { day: 'numeric', month: 'long', year: 'numeric' }),
  };
}

function categoryLabel(cat: string) {
  const map: Record<string, string> = {
    flagship: 'Insignia',
    wellness: 'Bienestar',
    summit: 'Summit',
    community: 'Comunidad',
    branded: 'Branded',
  };
  return map[cat] ?? cat;
}

// ── Page ───────────────────────────────────────

export default async function HomePage() {
  const [{ data: allEvents }, { data: allSpeakers }, { data: publishedReviews }, { data: activeSponsors }, { data: allExperiences }] = await Promise.all([
    getEvents(),
    getSpeakers(),
    getPublishedReviews(6),
    getSponsors(),
    getExperiences(),
  ]);

  const upcomingEvents = allEvents.filter((e) => e.status === 'upcoming').slice(0, 3);
  const featuredSpeakers = allSpeakers.filter((s) => s.featured).slice(0, 4);
  const featuredExperience = allExperiences.find((e) => e.slug === 'the-real-happiness');
  const experienceCategories = allExperiences.filter((e) => e.slug !== 'the-real-happiness').slice(0, 4);

  return (
    <PublicLayout>

      {/* ── A. HERO ─────────────────────────────── */}
      <section className="bg-[#FDFAF7] flex items-center">
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-center py-14 md:py-24 lg:py-32">

            {/* Left — editorial text */}
            <div className="flex flex-col gap-7 md:gap-10">
              <div className="hero-label flex flex-col gap-3">
                <span className="font-sans text-[11px] font-medium uppercase tracking-[0.25em] text-[#A56E52]">
                  ME Producciones · Summit III · 2026
                </span>
                <div className="h-px w-8 bg-[#A56E52]" />
              </div>

              <h1
                className="hero-h1 font-serif text-4xl md:text-6xl lg:text-7xl font-normal leading-[1.05] text-[#2A2421]"
              >
                The Real
                <br />
                <span className="italic">Happiness</span>
                <br />
                MasterClass
              </h1>

              <p className="hero-body font-sans text-base md:text-lg leading-relaxed text-[#5B4638] max-w-md">
                Tres ciudades. Un movimiento. Elige ser feliz — speakers internacionales, herramientas reales y una comunidad de líderes, emprendedores y visionarios listos para transformar su vida y su negocio.
              </p>

              <div className="hero-cta flex flex-col sm:flex-row gap-4 pt-2">
                <Button href="/events" variant="primary" size="lg">
                  Reservar mi lugar
                </Button>
                <Button href="/experiences" variant="secondary" size="lg">
                  Conocer el Summit
                </Button>
              </div>

              {/* Subtle stat strip */}
              <div className="hero-stats flex gap-10 pt-6 border-t border-[#D7C6B2]">
                <div>
                  <p className="font-serif text-2xl text-[#2A2421]">
                    {stats.totalAttendees.toLocaleString()}+
                  </p>
                  <p className="font-sans text-[11px] uppercase tracking-widest text-[#A56E52] mt-1">Asistentes</p>
                </div>
                <div>
                  <p className="font-serif text-2xl text-[#2A2421]">
                    {stats.citiesReached}
                  </p>
                  <p className="font-sans text-[11px] uppercase tracking-widest text-[#A56E52] mt-1">Ciudades</p>
                </div>
                <div>
                  <p className="font-serif text-2xl text-[#2A2421]">
                    {stats.totalEvents}+
                  </p>
                  <p className="font-sans text-[11px] uppercase tracking-widest text-[#A56E52] mt-1">Eventos</p>
                </div>
              </div>
            </div>

            {/* Right — image composition */}
            <div className="hero-image relative hidden lg:flex flex-col gap-4 items-end">
              {/* Main large image */}
              <div className="relative w-full h-[560px] overflow-hidden">
                <Image
                  fill
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80"
                  alt="Main event hero shot — vibrant conference audience"
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {/* Decorative text overlay */}
                <div className="absolute bottom-8 left-8">
                  <p
                    className="font-serif text-4xl text-[#EAE1D6] opacity-30 leading-none"

                  >
                    The Real
                    <br />Happiness
                  </p>
                </div>
              </div>
              {/* Small accent image */}
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-[#EAE1D6] border-4 border-[#FDFAF7]" />
              <div className="absolute top-8 -left-4 w-2 h-32 bg-[#A56E52]" />
            </div>
          </div>
        </div>
      </section>

      {/* ── B. BRAND STATEMENT ──────────────────── */}
      <section className="bg-[#F7F3EE] py-12 md:py-20 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-6 md:gap-10">
            {/* Terracotta divider above */}
            <div className="h-px w-16 bg-[#A56E52]" />

            <blockquote
              className="font-serif text-2xl md:text-3xl lg:text-4xl font-normal leading-snug text-[#2A2421]"
            >
              &ldquo;La felicidad es una habilidad, no un destino.
              Y este a&ntilde;o la vas a aprender.&rdquo;
            </blockquote>

            <p className="font-sans text-base leading-relaxed text-[#5B4638] max-w-2xl">
              The Real Happiness MasterClass Summit III llega a tres ciudades en 2026 — Doral, Samborondón y Orlando. Un día de herramientas prácticas, speakers internacionales y conexiones que cambian el rumbo de tu vida personal y empresarial. <strong>#HappinessIsAChoice</strong>
            </p>

            <div className="h-px w-16 bg-[#A56E52]" />
          </div>
        </div>
      </section>

      {/* ── C. TRHMC 3 CITIES ───────────────────── */}
      <section className="bg-[#2A2421] py-12 md:py-20 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="flex flex-col gap-10 md:gap-16">

            <div className="flex flex-col gap-3">
              <span className="font-sans text-[11px] font-medium uppercase tracking-[0.25em] text-[#A56E52]">
                Summit III · 2026
              </span>
              <div className="h-px w-8 bg-[#A56E52]" />
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-normal leading-tight text-[#EAE1D6] max-w-2xl">
                Tres ciudades.<br />Un movimiento. Elige ser feliz.
              </h2>
              <p className="font-sans text-base leading-relaxed text-[#B89E87] max-w-xl mt-2">
                The Real Happiness MasterClass llega a tres sedes en 2026 — un día de experiencia, herramientas y comunidad que te cambia para siempre.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#3D342F]">
              {[
                { num: '01', date: 'Agosto 29, 2026',    city: 'Miami',        region: 'Florida, USA',  tag: 'Primera sede' },
                { num: '02', date: 'Septiembre 2026',    city: 'Samborondón',  region: 'Ecuador',       tag: 'Segunda sede' },
                { num: '03', date: 'Octubre 11, 2026',   city: 'Orlando',      region: 'Florida, USA',  tag: 'Tercera sede' },
              ].map((stop) => (
                <div key={stop.num} className="bg-[#2A2421] p-8 md:p-10 flex flex-col gap-5 group hover:bg-[#1A1410] transition-colors duration-300">
                  <span className="font-serif text-5xl font-normal text-[#A56E52] opacity-40 leading-none">{stop.num}</span>
                  <div className="flex flex-col gap-1">
                    <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#A56E52]">{stop.tag}</span>
                    <h3 className="font-serif text-3xl font-normal text-[#EAE1D6]">{stop.city}</h3>
                    <p className="font-sans text-sm text-[#B89E87]">{stop.region}</p>
                  </div>
                  <div className="h-px w-full bg-[#3D342F]" />
                  <p className="font-sans text-xs uppercase tracking-widest text-[#5B4638]">{stop.date}</p>
                </div>
              ))}
            </div>

            <div>
              <Button href="/events" variant="terracotta" size="lg">
                Ver todos los eventos
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── D. EXPERIENCE CATEGORIES ────────────── */}
      <section className="bg-[#FDFAF7] py-12 md:py-20 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="flex flex-col gap-8 md:gap-16">
            <SectionHeader
              label="Nuestros formatos"
              title="Experiencias diseñadas para cada etapa."
              subtitle="Cada formato es una puerta diferente hacia el mismo destino: crecimiento, conexión y transformación."
            />

            {/* Mobile carousel */}
            <div className="md:hidden -mx-6 px-6">
              <MobileCarousel itemWidth="w-[75vw]" interval={3500}>
                {experienceCategories.map((exp, i) => (
                  <Link
                    key={exp.id}
                    href="/experiences"
                    className="group flex h-full flex-col overflow-hidden border border-[#D7C6B2] bg-[#FDFAF7] transition-colors duration-300 hover:bg-[#EAE1D6]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        fill
                        src={exp.image_url ?? 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
                        alt={exp.title}
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        sizes="75vw"
                        unoptimized={!!exp.image_url}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#2A2421]/75 via-[#2A2421]/10 to-transparent" />
                      <div className="absolute left-5 top-5 flex h-12 w-12 items-center justify-center border border-[#F7F3EE]/40 bg-[#2A2421]/35 backdrop-blur-[2px]">
                        <span className="font-serif text-2xl font-normal text-[#F7F3EE]">
                          0{i + 1}
                        </span>
                      </div>
                      <div className="absolute bottom-5 left-5">
                        <span className="font-sans text-[10px] uppercase tracking-widest text-[#F7F3EE]/85">
                          {categoryLabel(exp.category)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-6">
                      <h3 className="font-serif text-xl font-normal text-[#2A2421]">
                        {exp.title.replace(' — Flagship Experience', '')}
                      </h3>
                      <p className="font-sans text-sm leading-relaxed text-[#5B4638]">
                        {exp.short_desc}
                      </p>
                      <span className="mt-auto flex items-center gap-2 font-sans text-[10px] uppercase tracking-widest text-[#A56E52]">
                        Ver más
                        <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                      </span>
                    </div>
                  </Link>
                ))}
              </MobileCarousel>
            </div>
            {/* Desktop grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#D7C6B2]">
              {experienceCategories.map((exp, i) => (
                <Link
                  key={exp.id}
                  href="/experiences"
                  className="card-lift group flex flex-col overflow-hidden bg-[#FDFAF7] transition-colors duration-300 hover:bg-[#EAE1D6]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      fill
                      src={exp.image_url ?? 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
                      alt={exp.title}
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      unoptimized={!!exp.image_url}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2A2421]/70 via-[#2A2421]/5 to-transparent" />
                    <div className="absolute left-6 top-6 flex h-14 w-14 items-center justify-center border border-[#F7F3EE]/35 bg-[#2A2421]/30 backdrop-blur-[2px]">
                      <span className="font-serif text-3xl font-normal text-[#F7F3EE]">
                        0{i + 1}
                      </span>
                    </div>
                    <div className="absolute bottom-6 left-6">
                      <span className="font-sans text-[10px] uppercase tracking-widest text-[#F7F3EE]/85">
                        {categoryLabel(exp.category)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-8 lg:p-10">
                    <h3 className="font-serif text-xl font-normal text-[#2A2421]">
                      {exp.title.replace(' — Flagship Experience', '')}
                    </h3>
                    <p className="font-sans text-sm leading-relaxed text-[#5B4638]">
                      {exp.short_desc}
                    </p>
                    <span className="mt-auto flex items-center gap-2 font-sans text-[10px] uppercase tracking-widest text-[#A56E52]">
                      Ver más
                      <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── E. UPCOMING EVENTS PREVIEW ──────────── */}
      <section className="bg-[#EAE1D6] py-12 md:py-20 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="flex flex-col gap-8 md:gap-16">

            {/* Header row */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <SectionHeader
                label="Próximos eventos"
                title="Dónde nos vemos."
                subtitle="Reserva tu lugar antes de que se agoten. Nuestros eventos se llenan rápido."
              />
              <div className="shrink-0">
                <Button href="/events" variant="secondary" size="md">
                  Ver todos los eventos
                </Button>
              </div>
            </div>

            {/* Mobile: 2-at-a-time carousel */}
            <div className="md:hidden -mx-6 px-6">
              <MobileCarousel itemWidth="w-[72vw]" interval={4500}>
                {upcomingEvents.map((event) => {
                  const d = formatDate(event.date);
                  return (
                    <div key={event.id} className="flex flex-col bg-[#FDFAF7] h-full">
                      <div className="bg-[#2A2421] px-5 py-4 flex items-center gap-4">
                        <div className="flex flex-col items-center">
                          <span className="font-serif text-3xl font-normal text-[#EAE1D6] leading-none">{d.day}</span>
                          <span className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52] mt-1">{d.month} {d.year}</span>
                        </div>
                        <div className="h-10 w-px bg-[#3D342F]" />
                        <div className="flex flex-col gap-1">
                          <Badge variant={event.status === 'sold-out' ? 'sold-out' : 'upcoming'} />
                          <span className="font-sans text-[10px] uppercase tracking-widest text-[#B89E87]">{categoryLabel(event.category)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 p-5 flex-1">
                        <h3 className="font-serif text-xl font-normal leading-snug text-[#2A2421]">{event.title}</h3>
                        <p className="font-sans text-xs text-[#5B4638]">{event.venue}</p>
                        <p className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52]">{event.city}, {event.state}</p>
                      </div>
                      <div className="px-5 pb-5 flex items-center justify-between">
                        <div className="flex flex-col">
                          {event.price === 0 ? (
                            <span className="font-serif text-base text-[#2A2421]">Entrada libre</span>
                          ) : (
                            <>
                              <span className="font-serif text-xl text-[#2A2421]">${event.price}</span>
                              <span className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52]">por persona</span>
                            </>
                          )}
                        </div>
                        <Button href={`/events/${event.slug}`} variant="ghost" size="sm">Reservar</Button>
                      </div>
                    </div>
                  );
                })}
              </MobileCarousel>
            </div>

            {/* Desktop grid */}
            <div className="hidden md:grid grid-cols-3 gap-px bg-[#C4B09A]">
              {upcomingEvents.map((event) => {
                const d = formatDate(event.date);
                return (
                  <div key={event.id} className="flex flex-col bg-[#FDFAF7] group">
                    <div className="bg-[#2A2421] px-8 py-6 flex items-center gap-6">
                      <div className="flex flex-col items-center">
                        <span className="font-serif text-4xl font-normal text-[#EAE1D6] leading-none">{d.day}</span>
                        <span className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52] mt-1">{d.month} {d.year}</span>
                      </div>
                      <div className="h-12 w-px bg-[#3D342F]" />
                      <div className="flex flex-col gap-1">
                        <Badge variant={event.status === 'sold-out' ? 'sold-out' : 'upcoming'} />
                        <span className="font-sans text-[10px] uppercase tracking-widest text-[#B89E87]">{categoryLabel(event.category)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-5 p-8 flex-1">
                      <h3 className="font-serif text-2xl font-normal leading-snug text-[#2A2421]">{event.title}</h3>
                      <div className="flex flex-col gap-1">
                        <p className="font-sans text-sm text-[#5B4638]">{event.venue}</p>
                        <p className="font-sans text-[11px] uppercase tracking-widest text-[#A56E52]">{event.city}, {event.state}</p>
                      </div>
                      <p className="font-sans text-sm leading-relaxed text-[#5B4638] line-clamp-3">{event.description}</p>
                    </div>
                    <div className="px-8 pb-8 flex items-center justify-between">
                      <div className="flex flex-col">
                        {event.price === 0 ? (
                          <span className="font-serif text-lg text-[#2A2421]">Entrada libre</span>
                        ) : (
                          <>
                            <span className="font-serif text-2xl text-[#2A2421]">${event.price}</span>
                            <span className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52]">por persona</span>
                          </>
                        )}
                      </div>
                      <Button href={`/events/${event.slug}`} variant="ghost" size="sm">Reservar lugar</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── F. FEATURED SPEAKERS ────────────────── */}
      <section className="bg-[#F7F3EE] py-12 md:py-20 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="flex flex-col gap-8 md:gap-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <SectionHeader
                label="Voces que inspiran"
                title="Speakers de clase mundial."
                subtitle="Cada speaker es cuidadosamente seleccionado por su autenticidad, profundidad y capacidad de transformar salas enteras."
              />
              <div className="shrink-0">
                <Button href="/speakers" variant="secondary" size="md">
                  Ver todos los speakers
                </Button>
              </div>
            </div>

            {/* Mobile: auto-advance carousel */}
            <div className="md:hidden -mx-6 px-6">
              <MobileCarousel itemWidth="w-[42vw]" interval={3000}>
                {featuredSpeakers.map((speaker, i) => (
                  <div key={speaker.id} className="flex flex-col gap-3 group">
                    <div className="relative w-full aspect-[3/4] overflow-hidden">
                      <div className={`absolute inset-0 ${
                        i % 4 === 0 ? 'bg-[#D7C6B2]' :
                        i % 4 === 1 ? 'bg-[#C4B09A]' :
                        i % 4 === 2 ? 'bg-[#B89E87]' :
                        'bg-[#EAE1D6]'
                      }`} />
                      {speaker.image_url ? (
                        <Image
                          src={speaker.image_url}
                          alt={speaker.name}
                          fill
                          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                          sizes="42vw"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="font-serif text-4xl font-normal text-[#FDFAF7] opacity-30">
                            {speaker.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 w-6 h-6 border border-[#A56E52] opacity-40" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-serif text-sm font-normal text-[#2A2421] leading-snug">{speaker.name}</h3>
                      <p className="font-sans text-[10px] text-[#A56E52]">{speaker.title}</p>
                    </div>
                  </div>
                ))}
              </MobileCarousel>
            </div>

            {/* Desktop grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredSpeakers.map((speaker, i) => (
                <div key={speaker.id} className="flex flex-col gap-6 group">
                  <div className="relative w-full aspect-[3/4] overflow-hidden">
                    <div className={`absolute inset-0 ${
                      i % 4 === 0 ? 'bg-[#D7C6B2]' :
                      i % 4 === 1 ? 'bg-[#C4B09A]' :
                      i % 4 === 2 ? 'bg-[#B89E87]' :
                      'bg-[#EAE1D6]'
                    }`} />
                    {speaker.image_url ? (
                      <Image
                        src={speaker.image_url}
                        alt={speaker.name}
                        fill
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-serif text-7xl font-normal text-[#FDFAF7] opacity-30">
                          {speaker.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 w-8 h-8 border border-[#A56E52] opacity-40" />
                  </div>
                  <div className="flex flex-col gap-3">
                    <div>
                      <h3 className="font-serif text-xl font-normal text-[#2A2421] leading-snug">{speaker.name}</h3>
                      <p className="font-sans text-sm text-[#A56E52] mt-1">{speaker.title}</p>
                      <p className="font-sans text-xs text-[#5B4638] mt-0.5">{speaker.organization}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {speaker.expertise.slice(0, 2).map((tag) => (
                        <span key={tag} className="font-sans text-[9px] uppercase tracking-widest text-[#5B4638] border border-[#D7C6B2] px-2 py-0.5">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── G. EDITORIAL IMAGE SECTION ──────────── */}
      <section className="bg-[#2A2421] py-12 md:py-20 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">

            {/* Text */}
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <span className="font-sans text-[11px] font-medium uppercase tracking-[0.25em] text-[#A56E52]">
                  Impacto & comunidad
                </span>
                <div className="h-px w-8 bg-[#A56E52]" />
              </div>

              <h2
                className="font-serif text-4xl md:text-5xl font-normal leading-tight text-[#EAE1D6]"

              >
                Cada sala es un espejo de lo que somos capaces.
              </h2>

              <p className="font-sans text-base leading-relaxed text-[#B89E87]">
                Más de 18,500 personas han cruzado las puertas de nuestros eventos. Han llorado, reído, debatido y celebrado. Han encontrado mentores, socios y amigos de por vida. Han recordado quiénes son y decidido quiénes quieren ser.
              </p>

              <p className="font-sans text-base leading-relaxed text-[#B89E87]">
                Eso es lo que hacemos. No producimos eventos — producimos posibilidad.
              </p>

              <div className="pt-4">
                <Button href="/about" variant="secondary" size="lg">
                  Nuestra historia
                </Button>
              </div>
            </div>

            {/* Image composition */}
            <div className="relative">
              {/* Main image */}
              <div className="relative w-full h-[240px] md:h-[380px] lg:h-[480px] overflow-hidden">
                <Image
                  fill
                  src={editorialImages.homeImpact.src}
                  alt={editorialImages.homeImpact.alt}
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {/* Terracotta frame */}
                <div className="absolute inset-6 border border-[#A56E52] opacity-20" />
              </div>
              {/* Floating small image */}
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-[#A56E52] opacity-30" />
              {/* Stats overlay */}
              <div className="absolute top-8 right-8 bg-[#2A2421] border border-[#3D342F] px-6 py-5">
                <p className="font-serif text-3xl text-[#EAE1D6]">{stats.satisfaction}%</p>
                <p className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52] mt-1">Satisfacción</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── H. METRICS ──────────────────────────── */}
      <section className="bg-[#EAE1D6] py-12 md:py-20 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="flex flex-col gap-8 md:gap-16">
            <div className="text-center">
              <span className="font-sans text-[11px] font-medium uppercase tracking-[0.25em] text-[#A56E52]">
                En números
              </span>
              <div className="h-px w-8 bg-[#A56E52] mx-auto mt-3" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-[#C4B09A]">
              {[
                { value: `${stats.totalEvents}+`, label: 'Eventos producidos' },
                { value: `${(stats.totalAttendees / 1000).toFixed(1)}K+`, label: 'Vidas impactadas' },
                { value: `${stats.totalSpeakers}+`, label: 'Speakers y facilitadores' },
                { value: `${stats.citiesReached}`, label: 'Ciudades en EEUU' },
                { value: `${stats.yearsActive}`, label: 'Años de trayectoria' },
                { value: `${stats.satisfaction}%`, label: 'Satisfacción general' },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col items-center text-center gap-2 bg-[#EAE1D6] px-4 py-7 md:py-10 lg:py-14">
                  <span
                    className="font-serif text-3xl md:text-4xl lg:text-5xl font-normal text-[#2A2421]"

                  >
                    {value}
                  </span>
                  <span className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52] leading-relaxed">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── I. TESTIMONIALS ─────────────────────── */}
      <section className="bg-[#F7F3EE] py-12 md:py-20 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="flex flex-col gap-8 md:gap-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <SectionHeader
                label="Testimonios"
                title="Lo que dice nuestra comunidad."
                subtitle="Cada historia es prueba de lo que es posible cuando te rodeas de la comunidad correcta."
              />
              <div className="shrink-0">
                <Button href="/events" variant="secondary" size="md">
                  Ver eventos
                </Button>
              </div>
            </div>

            {publishedReviews.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#D7C6B2]">
                {publishedReviews.map((r: DBReview) => (
                  <div key={r.id} className="bg-[#FDFAF7] p-8 flex flex-col gap-4">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((n) => (
                        <svg key={n} width="10" height="10" viewBox="0 0 24 24"
                          fill={(r.rating ?? 5) >= n ? '#A56E52' : 'none'} stroke="#A56E52" strokeWidth="1.5">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                    {r.text && (
                      <p className="font-sans text-sm leading-relaxed text-[#5B4638] italic flex-1">
                        &ldquo;{r.text}&rdquo;
                      </p>
                    )}
                    <div className="border-t border-[#EAE1D6] pt-4">
                      <p className="font-sans text-sm font-medium text-[#2A2421]">{r.name}</p>
                      {r.role && <p className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52] mt-0.5">{r.role}</p>}
                      {r.event_name && <p className="font-sans text-[10px] text-[#5B4638]">{r.event_name}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Submit form */}
            <div className="flex flex-col md:flex-row gap-12 md:gap-20 items-start">
              <div className="md:w-1/3 shrink-0">
                <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-[#A56E52] mb-3">
                  Comparte tu experiencia
                </p>
                <p className="font-sans text-2xl font-light text-[#2A2421] leading-snug mb-4">
                  ¿Asististe a uno de nuestros eventos?
                </p>
                <p className="font-sans text-sm text-[#5B4638] leading-relaxed">
                  Tu testimonio inspira a otros a dar el siguiente paso. Cuéntanos cómo fue tu experiencia y lo publicaremos en nuestra comunidad.
                </p>
              </div>
              <div className="flex-1 w-full">
                <ReviewSubmitForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── J. SPONSORS ─────────────────────────── */}
      {activeSponsors.filter((s: DBSponsor) => s.active).length > 0 && (
        <section className="bg-[#FDFAF7] py-12 md:py-20 border-t border-[#EAE1D6]">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
            <div className="flex flex-col gap-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <span className="font-sans text-[11px] font-medium uppercase tracking-[0.25em] text-[#A56E52]">
                    Sponsors &amp; Partners
                  </span>
                  <div className="h-px w-8 bg-[#A56E52]" />
                </div>
                <Link
                  href="/sponsors"
                  className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52] hover:text-[#2A2421] transition-colors shrink-0"
                >
                  Ver todos los sponsors →
                </Link>
              </div>

              {/* Cards grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {activeSponsors.filter((s: DBSponsor) => s.active).slice(0, 8).map((sponsor: DBSponsor) => {
                  const card = (
                    <div className="group border border-[#EAE1D6] bg-[#F7F3EE] overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                      {/* Image */}
                      <div className="w-full border-b border-[#EAE1D6]">
                        {sponsor.logo_url ? (
                          <Image
                            src={sponsor.logo_url}
                            alt={sponsor.name}
                            width={0}
                            height={0}
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="w-full h-auto block"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full py-10 flex items-center justify-center bg-[#F7F3EE]">
                            <p className="font-serif text-base font-normal text-[#2A2421] text-center px-4">
                              {sponsor.name}
                            </p>
                          </div>
                        )}
                      </div>
                      {/* Name */}
                      <div className="px-3 py-2.5 sm:px-4 sm:py-3">
                        <p className="font-sans text-[10px] sm:text-xs font-medium text-[#2A2421] truncate">
                          {sponsor.name}
                        </p>
                      </div>
                    </div>
                  );

                  return sponsor.website ? (
                    <a
                      key={sponsor.id}
                      href={sponsor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visitar sitio de ${sponsor.name}`}
                      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A56E52]"
                    >
                      {card}
                    </a>
                  ) : (
                    <div key={sponsor.id}>{card}</div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── K. FINAL CTA ────────────────────────── */}
      <section className="bg-[#D7C6B2] py-12 md:py-20 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-6 md:gap-10">
            <div className="flex flex-col gap-3 items-center">
              <span className="font-sans text-[11px] font-medium uppercase tracking-[0.25em] text-[#A56E52]">
                Tu próximo paso
              </span>
              <div className="h-px w-8 bg-[#A56E52]" />
            </div>

            <h2
              className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal leading-tight text-[#2A2421]"

            >
              La experiencia que buscabas te está esperando.
            </h2>

            <p className="font-sans text-base leading-relaxed text-[#5B4638] max-w-xl">
              No importa en qué etapa de tu vida te encuentres — tenemos una experiencia diseñada para ti. El próximo paso siempre empieza con una decisión.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button href="/experiences" variant="primary" size="lg">
                Explorar experiencias
              </Button>
              <Button href="/the-real-happiness" variant="secondary" size="lg">
                The Real Happiness
              </Button>
            </div>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
