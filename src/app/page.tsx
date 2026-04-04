import Link from 'next/link';
import Image from 'next/image';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SectionHeader from '@/components/ui/SectionHeader';
import { events, speakers, experiences, stats } from '@/lib/data';

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

export default function HomePage() {
  const upcomingEvents = events.filter((e) => e.status === 'upcoming').slice(0, 3);
  const featuredSpeakers = speakers.filter((s) => s.featured).slice(0, 4);
  const featuredExperience = experiences.find((e) => e.slug === 'the-real-happiness');
  const experienceCategories = experiences.filter((e) => e.slug !== 'the-real-happiness').slice(0, 4);

  return (
    <PublicLayout>

      {/* ── A. HERO ─────────────────────────────── */}
      <section className="bg-[#FDFAF7] flex items-center">
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-center py-14 md:py-24 lg:py-32">

            {/* Left — editorial text */}
            <div className="flex flex-col gap-7 md:gap-10">
              <div className="flex flex-col gap-3">
                <span className="font-sans text-[11px] font-medium uppercase tracking-[0.25em] text-[#A56E52]">
                  ME Latino Producciones
                </span>
                <div className="h-px w-8 bg-[#A56E52]" />
              </div>

              <h1
                className="font-serif text-4xl md:text-6xl lg:text-7xl font-normal leading-[1.05] text-[#2A2421]"

              >
                Experiencias
                <br />
                <span className="italic">que transforman.</span>
              </h1>

              <p className="font-sans text-base md:text-lg leading-relaxed text-[#5B4638] max-w-md">
                Producimos experiencias de clase mundial para la comunidad Latina — diseñadas con propósito, ejecutadas con precisión, y construidas para transformar vidas.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button href="/experiences" variant="primary" size="lg">
                  Explorar experiencias
                </Button>
                <Button href="/events" variant="secondary" size="lg">
                  Ver próximo evento
                </Button>
              </div>

              {/* Subtle stat strip */}
              <div className="flex gap-10 pt-6 border-t border-[#D7C6B2]">
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
            <div className="relative hidden lg:flex flex-col gap-4 items-end">
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
              "No producimos eventos. Construimos experiencias con propósito, comunidad y transformación."
            </blockquote>

            <p className="font-sans text-base leading-relaxed text-[#5B4638] max-w-2xl">
              Durante cuatro años hemos creado espacios donde la identidad Latina florece, donde el liderazgo toma forma, y donde la comunidad se convierte en familia. Cada evento es un acto de amor hacia nuestra gente.
            </p>

            <div className="h-px w-16 bg-[#A56E52]" />
          </div>
        </div>
      </section>

      {/* ── C. FEATURED EXPERIENCE — The Real Happiness ── */}
      {featuredExperience && (
        <section className="bg-[#2A2421] py-12 md:py-20 lg:py-28">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 lg:gap-24 items-center">

              {/* Image */}
              <div className="relative order-2 lg:order-1">
                <div className="relative w-full h-[240px] md:h-[400px] lg:h-[500px] overflow-hidden">
                  <Image
                    fill
                    src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80"
                    alt="The Real Happiness flagship event — community gathering"
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  {/* Decorative corner accent */}
                  <div className="absolute top-6 left-6 w-16 h-16 border border-[#A56E52] opacity-60" />
                  <div className="absolute bottom-6 right-6 w-24 h-px bg-[#A56E52] opacity-60" />
                </div>
                {/* Floating accent block */}
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#A56E52] opacity-20" />
              </div>

              {/* Content */}
              <div className="order-1 lg:order-2 flex flex-col gap-8">
                <div className="flex flex-col gap-3">
                  <span className="font-sans text-[11px] font-medium uppercase tracking-[0.25em] text-[#A56E52]">
                    Experiencia Insignia
                  </span>
                  <div className="h-px w-8 bg-[#A56E52]" />
                </div>

                <h2
                  className="font-serif text-4xl md:text-5xl font-normal leading-tight text-[#EAE1D6]"

                >
                  {featuredExperience.title}
                </h2>

                <p className="font-sans text-base leading-relaxed text-[#B89E87]">
                  {featuredExperience.description}
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {featuredExperience.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52] border border-[#A56E52] border-opacity-40 px-3 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="pt-4">
                  <Button href="/the-real-happiness" variant="terracotta" size="lg">
                    Conocer la experiencia
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── D. EXPERIENCE CATEGORIES ────────────── */}
      <section className="bg-[#FDFAF7] py-12 md:py-20 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="flex flex-col gap-8 md:gap-16">
            <SectionHeader
              label="Nuestros formatos"
              title="Experiencias diseñadas para cada etapa."
              subtitle="Cada formato es una puerta diferente hacia el mismo destino: crecimiento, conexión y transformación."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#D7C6B2]">
              {experienceCategories.map((exp, i) => (
                <Link
                  key={exp.id}
                  href="/experiences"
                  className="group flex flex-col gap-4 md:gap-6 bg-[#FDFAF7] p-6 md:p-8 lg:p-10 hover:bg-[#EAE1D6] transition-colors duration-300"
                >
                  <span
                    className="font-serif text-5xl font-normal text-[#D7C6B2] group-hover:text-[#A56E52] transition-colors duration-300"

                  >
                    0{i + 1}
                  </span>
                  <div className="flex flex-col gap-3 flex-1">
                    <h3
                      className="font-serif text-xl font-normal text-[#2A2421]"

                    >
                      {exp.title.replace(' — Flagship Experience', '')}
                    </h3>
                    <p className="font-sans text-sm leading-relaxed text-[#5B4638]">
                      {exp.shortDesc}
                    </p>
                  </div>
                  <span className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52] flex items-center gap-2">
                    Ver más
                    <span className="inline-block group-hover:translate-x-1 transition-transform duration-200">→</span>
                  </span>
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

            {/* Event cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#C4B09A]">
              {upcomingEvents.map((event) => {
                const d = formatDate(event.date);
                return (
                  <div key={event.id} className="flex flex-col bg-[#FDFAF7] group">
                    {/* Date header */}
                    <div className="bg-[#2A2421] px-5 py-4 md:px-8 md:py-6 flex items-center gap-4 md:gap-6">
                      <div className="flex flex-col items-center">
                        <span
                          className="font-serif text-4xl font-normal text-[#EAE1D6] leading-none"

                        >
                          {d.day}
                        </span>
                        <span className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52] mt-1">
                          {d.month} {d.year}
                        </span>
                      </div>
                      <div className="h-12 w-px bg-[#3D342F]" />
                      <div className="flex flex-col gap-1">
                        <Badge variant={event.status === 'sold-out' ? 'sold-out' : 'upcoming'} />
                        <span className="font-sans text-[10px] uppercase tracking-widest text-[#B89E87]">
                          {categoryLabel(event.category)}
                        </span>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="flex flex-col gap-3 md:gap-5 p-5 md:p-8 flex-1">
                      <h3
                        className="font-serif text-2xl font-normal leading-snug text-[#2A2421]"

                      >
                        {event.title}
                      </h3>
                      <div className="flex flex-col gap-1">
                        <p className="font-sans text-sm text-[#5B4638]">
                          {event.venue}
                        </p>
                        <p className="font-sans text-[11px] uppercase tracking-widest text-[#A56E52]">
                          {event.city}, {event.state}
                        </p>
                      </div>
                      <p className="font-sans text-sm leading-relaxed text-[#5B4638] line-clamp-3">
                        {event.description}
                      </p>
                    </div>

                    {/* Card footer */}
                    <div className="px-5 pb-5 md:px-8 md:pb-8 flex items-center justify-between">
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
                      <Button href={`/events/${event.slug}`} variant="ghost" size="sm">
                        Reservar lugar
                      </Button>
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

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8">
              {featuredSpeakers.map((speaker, i) => (
                <div key={speaker.id} className="flex flex-col gap-4 md:gap-6 group">
                  {/* Image placeholder */}
                  <div className="relative w-full aspect-[3/4] overflow-hidden">
                    <div
                      className={`absolute inset-0 ${
                        i % 4 === 0 ? 'bg-[#D7C6B2]' :
                        i % 4 === 1 ? 'bg-[#C4B09A]' :
                        i % 4 === 2 ? 'bg-[#B89E87]' :
                        'bg-[#EAE1D6]'
                      }`}
                    />
                    {/* Subtle compositional shape */}
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-[#2A2421] opacity-10" />
                    <div className="absolute top-4 right-4 w-8 h-8 border border-[#A56E52] opacity-40" />
                    {/* Speaker initial placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className="font-serif text-5xl md:text-7xl font-normal text-[#FDFAF7] opacity-30"

                      >
                        {speaker.name.charAt(0)}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-3">
                    <div>
                      <h3
                        className="font-serif text-xl font-normal text-[#2A2421] leading-snug"

                      >
                        {speaker.name}
                      </h3>
                      <p className="font-sans text-sm text-[#A56E52] mt-1">{speaker.title}</p>
                      <p className="font-sans text-xs text-[#5B4638] mt-0.5">{speaker.organization}</p>
                    </div>

                    {/* Expertise tags */}
                    <div className="flex flex-wrap gap-1">
                      {speaker.expertise.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="font-sans text-[9px] uppercase tracking-widest text-[#5B4638] border border-[#D7C6B2] px-2 py-0.5"
                        >
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
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=80"
                  alt="Community gathering — Latino community event audience"
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

      {/* ── I. FINAL CTA ────────────────────────── */}
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
