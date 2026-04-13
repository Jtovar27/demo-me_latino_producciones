import Image from 'next/image';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import SectionHeader from '@/components/ui/SectionHeader';
import { events, speakers, testimonials } from '@/lib/data';
import { editorialImages } from '@/lib/media';

// ── Data ───────────────────────────────────────

const flagshipEvent = events.find((e) => e.slug === 'the-real-happiness-miami-2025');

const featuredSpeakers = speakers.filter((s) => s.featured).slice(0, 4);

const featuredTestimonials = testimonials.slice(0, 3);

// ── Agenda ─────────────────────────────────────

const day1: { time: string; title: string; description: string }[] = [
  {
    time: '9:00 AM',
    title: 'Bienvenida y apertura',
    description:
      'Apertura ceremonial del espacio, presentación del equipo anfitrión y establecimiento de la intención colectiva para los dos días.',
  },
  {
    time: '11:00 AM',
    title: 'Keynote: Propósito y Liderazgo',
    description:
      'Una conversación profunda sobre cómo el propósito auténtico se convierte en el principal activo del liderazgo latino contemporáneo.',
  },
  {
    time: '2:00 PM',
    title: 'Workshop: Identidad y Claridad',
    description:
      'Taller facilitado para explorar la intersección entre identidad cultural y claridad personal — con ejercicios prácticos y reflexión en comunidad.',
  },
  {
    time: '7:00 PM',
    title: 'Velada comunitaria',
    description:
      'Una noche de conexión auténtica con música en vivo, conversaciones espontáneas y la energía de una comunidad que se reconoce entre sí.',
  },
];

const day2: { time: string; title: string; description: string }[] = [
  {
    time: '8:30 AM',
    title: 'Breathwork matutino',
    description:
      'Sesión de respiración consciente para comenzar el segundo día con presencia total — liberando lo que ya no sirve y abriendo espacio a lo nuevo.',
  },
  {
    time: '10:30 AM',
    title: 'Keynote: Transformación y Acción',
    description:
      'El camino desde la inspiración hacia la acción concreta. ¿Cómo traducimos lo que sentimos en cambios reales y sostenibles en nuestra vida?',
  },
  {
    time: '1:00 PM',
    title: 'Paneles simultáneos',
    description:
      'Tres conversaciones en paralelo — liderazgo, bienestar y creatividad — facilitadas por voces que han navegado estos caminos con autenticidad.',
  },
  {
    time: '5:00 PM',
    title: 'Ceremonia de cierre',
    description:
      'Un cierre ritual de los dos días: reflexión colectiva, compromisos hacia adelante y una celebración del camino recorrido juntos.',
  },
];

// ── Tickets ────────────────────────────────────

const tickets = [
  {
    name: 'Acceso General',
    price: '$397',
    popular: false,
    description: 'Todo lo esencial para vivir The Real Happiness.',
    includes: [
      'Acceso completo ambos días',
      'Todos los keynotes y paneles',
      'Sesiones de respiración consciente',
      'Networking comunitario',
    ],
    cta: 'Registrarse',
    ctaHref: '/contact',
    variant: 'secondary' as const,
  },
  {
    name: 'Experiencia VIP',
    price: '$697',
    popular: true,
    description: 'Una experiencia más íntima con acceso exclusivo.',
    includes: [
      'Todo en Acceso General',
      'Acceso al lounge VIP',
      'Asientos prioritarios en el auditorio',
      'Cena privada pre-evento',
      'Sesión exclusiva de preguntas con ponentes',
    ],
    cta: 'Registrarse',
    ctaHref: '/contact',
    variant: 'terracotta' as const,
  },
  {
    name: 'Círculo Fundadores',
    price: '$1,497',
    popular: false,
    description: 'Para quienes quieren una relación profunda con ME Producciones.',
    includes: [
      'Todo en Experiencia VIP',
      'Cena privada con los fundadores',
      'Acceso tras bambalinas al evento',
      'Limitado a 25 personas',
    ],
    cta: 'Aplicar',
    ctaHref: '/contact',
    variant: 'secondary' as const,
  },
];

// ── Audience cards ──────────────────────────────

const audienceCards = [
  {
    title: 'Eres un líder en transición',
    description:
      'Navegas un momento de cambio — de carrera, de identidad, de propósito — y buscas hacerlo con intención, no por inercia. Necesitas un espacio donde pensar con claridad y sentir con profundidad.',
  },
  {
    title: 'Buscas comunidad auténtica',
    description:
      'Las conexiones superficiales ya no te satisfacen. Buscas personas que compartan tus valores, hablen tu idioma — literal y culturalmente — y que estén comprometidas con crecer de verdad.',
  },
  {
    title: 'Estás listo para ir más profundo',
    description:
      'Has leído los libros, escuchado los podcasts, asistido a las conferencias. Ahora quieres una experiencia que te mueva por dentro — que active algo que los conceptos solos no pueden tocar.',
  },
];

// ── Page ───────────────────────────────────────

export default function TheRealHappinessPage() {
  return (
    <PublicLayout>

      {/* ── A. HERO ──────────────────────────────── */}
      <section className="bg-[#2A2421] min-h-screen flex items-center justify-center px-6 md:px-12 lg:px-20 py-24 md:py-32 relative overflow-hidden">

        {/* Background texture accents */}
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src={editorialImages.theRealHappinessHero.src}
            alt=""
            fill
            className="object-cover opacity-20"
            sizes="100vw"
            priority
          />
          <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-[#342B25] opacity-50" />
          <div className="absolute bottom-0 left-0 w-1/4 h-1/3 bg-[#3D342F] opacity-40" />
          <div className="absolute top-1/3 left-8 w-px h-40 bg-[#A56E52] opacity-30" />
          <div className="absolute bottom-16 right-16 w-24 h-px bg-[#A56E52] opacity-30" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center gap-10">

          {/* Label */}
          <div className="flex flex-col items-center gap-2">
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#A56E52]">
              The Real Happiness
            </span>
            <div className="h-px w-8 bg-[#A56E52]" />
          </div>

          {/* H1 */}
          <h1
            className="font-serif text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.05] text-[#F7F3EE]"

          >
            Una experiencia de dos días diseñada para transformar.
          </h1>

          {/* Event details */}
          <p className="font-sans text-sm tracking-widest text-[#EAE1D6] uppercase">
            Miami, FL&nbsp;&nbsp;—&nbsp;&nbsp;17 &amp; 18 de Octubre, 2025&nbsp;&nbsp;—&nbsp;&nbsp;The Fillmore Miami Beach
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button variant="terracotta" size="lg" href="/contact">
              Reservar lugar
            </Button>
            <Button
              variant="secondary"
              size="lg"
              href="#agenda"
              className="border-[#F7F3EE] text-[#F7F3EE] hover:bg-[#F7F3EE] hover:text-[#2A2421]"
            >
              Ver agenda
            </Button>
          </div>

          {/* Capacity note */}
          {flagshipEvent && (
            <p className="font-sans text-xs text-[#B89E87] tracking-widest uppercase">
              {flagshipEvent.registered} de {flagshipEvent.capacity} lugares ocupados
            </p>
          )}
        </div>
      </section>

      {/* ── B. CONCEPT SECTION ───────────────────── */}
      <section className="bg-[#F7F3EE] py-24 md:py-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">

          {/* Left: pull quote */}
          <div className="flex flex-col gap-6">
            <div className="h-px w-8 bg-[#A56E52]" />
            <blockquote
              className="font-serif text-2xl md:text-3xl font-normal leading-snug text-[#2A2421]"

            >
              &ldquo;No es una conferencia. No es un retiro. Es un espacio donde el
              prop&oacute;sito se convierte en pr&aacute;ctica.&rdquo;
            </blockquote>
            <div className="h-px w-8 bg-[#D7C6B2]" />
            <p className="font-sans text-sm text-[#A56E52] uppercase tracking-widest">
              — Mariana Ríos Delgado, Fundadora
            </p>
          </div>

          {/* Right: description paragraphs */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#A56E52]">
                La experiencia
              </span>
              <div className="h-px w-8 bg-[#A56E52]" />
            </div>
            <div className="flex flex-col gap-5 font-sans text-base leading-relaxed text-[#5B4638]">
              <p>
                The Real Happiness es una inmersión de dos días diseñada para el líder latino
                moderno que está listo para ir más profundo. No se trata de motivación pasajera —
                se trata de transformación sostenida, activada desde adentro.
              </p>
              <p>
                Cada elemento del programa ha sido curado con intención editorial: keynotes que
                desafían las narrativas heredadas, workshops que activan la claridad personal,
                breathwork que restaura el cuerpo y la mente, conversaciones que crean conexiones
                reales. Dos días donde el propósito deja de ser concepto y se convierte en práctica.
              </p>
              <p>
                Diseñada para el líder latino moderno que lleva el peso del éxito externo sin haber
                tenido espacio para el crecimiento interno. Para quien está listo para encontrar su
                comunidad más auténtica y comprometerse con la versión más verdadera de sí mismo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── C. FOR WHOM ──────────────────────────── */}
      <section className="bg-[#EAE1D6] py-24 md:py-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-16">

          <SectionHeader
            label="Para quién es"
            title="Esta experiencia fue creada para ti si..."
            centered
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#C4B09A]">
            {audienceCards.map((card, i) => (
              <div key={i} className="flex flex-col gap-6 bg-[#EAE1D6] p-8 md:p-10">
                <span
                  className="font-serif text-5xl font-normal text-[#C4B09A]"

                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3
                  className="font-serif text-xl font-normal leading-snug text-[#2A2421]"

                >
                  {card.title}
                </h3>
                <p className="font-sans text-sm leading-relaxed text-[#5B4638]">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── D. AGENDA ────────────────────────────── */}
      <section id="agenda" className="bg-[#FDFAF7] py-24 md:py-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-16">

          <SectionHeader
            label="Programa"
            title="Dos días. Una transformación."
            centered
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            {/* Day 1 */}
            <div className="flex flex-col gap-8">
              <div className="flex items-baseline gap-5">
                <span
                  className="font-serif text-6xl font-normal text-[#D7C6B2] leading-none"

                >
                  01
                </span>
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52]">
                    Viernes, 17 de Octubre
                  </p>
                  <p className="font-sans text-xs uppercase tracking-widest text-[#2A2421] font-medium mt-0.5">
                    Abrir
                  </p>
                </div>
              </div>

              <div className="flex flex-col divide-y divide-[#EAE1D6]">
                {day1.map((session, i) => (
                  <div key={i} className="flex gap-5 py-6">
                    <span className="font-sans text-xs text-[#A56E52] w-20 shrink-0 pt-1">
                      {session.time}
                    </span>
                    <div className="flex flex-col gap-1">
                      <h4
                        className="font-serif text-base font-normal text-[#2A2421] leading-snug"

                      >
                        {session.title}
                      </h4>
                      <p className="font-sans text-xs leading-relaxed text-[#5B4638]">
                        {session.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Day 2 */}
            <div className="flex flex-col gap-8">
              <div className="flex items-baseline gap-5">
                <span
                  className="font-serif text-6xl font-normal text-[#D7C6B2] leading-none"

                >
                  02
                </span>
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52]">
                    Sábado, 18 de Octubre
                  </p>
                  <p className="font-sans text-xs uppercase tracking-widest text-[#2A2421] font-medium mt-0.5">
                    Integrar
                  </p>
                </div>
              </div>

              <div className="flex flex-col divide-y divide-[#EAE1D6]">
                {day2.map((session, i) => (
                  <div key={i} className="flex gap-5 py-6">
                    <span className="font-sans text-xs text-[#A56E52] w-20 shrink-0 pt-1">
                      {session.time}
                    </span>
                    <div className="flex flex-col gap-1">
                      <h4
                        className="font-serif text-base font-normal text-[#2A2421] leading-snug"

                      >
                        {session.title}
                      </h4>
                      <p className="font-sans text-xs leading-relaxed text-[#5B4638]">
                        {session.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── E. SPEAKERS ──────────────────────────── */}
      <section className="bg-[#2A2421] py-24 md:py-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-16">

          <div className="flex flex-col gap-4">
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#A56E52]">
              Ponentes
            </span>
            <div className="h-px w-8 bg-[#A56E52]" />
            <h2
              className="font-serif text-3xl md:text-4xl lg:text-5xl font-normal leading-tight text-[#EAE1D6]"

            >
              Voces que transforman salas enteras.
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {featuredSpeakers.map((speaker) => (
              <div key={speaker.id} className="flex flex-col gap-4 group">
                {/* Speaker portrait */}
                <div className="relative w-full aspect-[3/4] overflow-hidden">
                  <Image
                    src={speaker.image}
                    alt={speaker.name}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-[#2A2421] to-transparent" />
                  <div className="absolute top-4 right-4 w-6 h-6 border border-[#A56E52] opacity-40" />
                </div>

                {/* Info */}
                <div className="flex flex-col gap-2">
                  <h3
                    className="font-serif text-base md:text-lg font-normal leading-snug text-[#F7F3EE]"

                  >
                    {speaker.name}
                  </h3>
                  <p className="font-sans text-xs text-[#EAE1D6]">{speaker.title}</p>
                  <p className="font-sans text-[10px] text-[#A56E52]">{speaker.organization}</p>
                  {/* Expertise tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {speaker.expertise.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="font-sans text-[9px] uppercase tracking-widest text-[#B89E87] border border-[#3D342F] px-2 py-0.5"
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
      </section>

      {/* ── F. VENUE ─────────────────────────────── */}
      <section className="bg-[#F7F3EE] py-24 md:py-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: venue image */}
          <div className="w-full aspect-video relative overflow-hidden">
            <Image
              src={editorialImages.theRealHappinessVenue.src}
              alt={editorialImages.theRealHappinessVenue.alt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-8 border border-[#B89E87] opacity-30" />
            <div className="absolute bottom-6 left-6">
              <span className="font-sans text-[10px] uppercase tracking-widest text-[#F7F3EE] opacity-80">
                The Fillmore Miami Beach
              </span>
            </div>
          </div>

          {/* Right: venue info */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#A56E52]">
                La sede
              </span>
              <div className="h-px w-8 bg-[#A56E52]" />
            </div>

            <h2
              className="font-serif text-3xl md:text-4xl font-normal leading-tight text-[#2A2421]"

            >
              The Fillmore Miami Beach
            </h2>

            <p className="font-sans text-sm text-[#A56E52] uppercase tracking-widest">
              1700 Washington Ave, Miami Beach, FL 33139
            </p>

            <div className="flex flex-col gap-4 font-sans text-base leading-relaxed text-[#5B4638]">
              <p>
                El Fillmore Miami Beach es un hito histórico de la cultura en el sur de la
                Florida. Construido originalmente como el Miami Beach Auditorium en 1951 y
                restaurado con maestría en 2007, el recinto combina arquitectura art déco icónica
                con producción audiovisual de clase mundial.
              </p>
              <p>
                Con capacidad para 1,200 asistentes, acústica de primer nivel y una ubicación
                privilegiada en el corazón de South Beach, el Fillmore ofrece el escenario perfecto
                para una experiencia que merece estar a la altura del momento que representa.
              </p>
            </div>

            <div className="flex gap-8 pt-4 border-t border-[#D7C6B2]">
              <div>
                <p
                  className="font-serif text-2xl font-normal text-[#2A2421]"

                >
                  1,200
                </p>
                <p className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52] mt-1">
                  Capacidad
                </p>
              </div>
              <div>
                <p
                  className="font-serif text-2xl font-normal text-[#2A2421]"

                >
                  1951
                </p>
                <p className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52] mt-1">
                  Fundado
                </p>
              </div>
              <div>
                <p
                  className="font-serif text-2xl font-normal text-[#2A2421]"

                >
                  SoBe
                </p>
                <p className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52] mt-1">
                  Ubicación
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── G. TICKETS ───────────────────────────── */}
      <section className="bg-[#FDFAF7] py-24 md:py-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-16">

          <SectionHeader
            label="Registro"
            title="Elige tu experiencia."
            subtitle="Lugares limitados. Todos los niveles incluyen acceso completo al programa de los dos días."
            centered
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border border-[#D7C6B2]">
            {tickets.map((ticket, i) => (
              <div
                key={i}
                className={[
                  'flex flex-col gap-6 p-8 md:p-10 relative',
                  ticket.popular
                    ? 'bg-[#2A2421] border-x border-[#A56E52]'
                    : 'bg-[#FDFAF7]',
                  i < tickets.length - 1 ? 'border-b sm:border-b-0 sm:border-r border-[#D7C6B2]' : '',
                ].join(' ')}
              >
                {/* "Mas popular" label */}
                {ticket.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="font-sans text-[9px] font-medium uppercase tracking-widest text-[#F7F3EE] bg-[#A56E52] px-4 py-1">
                      Más popular
                    </span>
                  </div>
                )}

                {/* Tier name */}
                <div>
                  <h3
                    className={[
                      'font-serif text-2xl font-normal leading-snug',
                      ticket.popular ? 'text-[#F7F3EE]' : 'text-[#2A2421]',
                    ].join(' ')}

                  >
                    {ticket.name}
                  </h3>
                  <p
                    className={[
                      'font-sans text-sm mt-2',
                      ticket.popular ? 'text-[#D7C6B2]' : 'text-[#5B4638]',
                    ].join(' ')}
                  >
                    {ticket.description}
                  </p>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span
                    className={[
                      'font-serif text-5xl font-normal',
                      ticket.popular ? 'text-[#F7F3EE]' : 'text-[#2A2421]',
                    ].join(' ')}

                  >
                    {ticket.price}
                  </span>
                  <span
                    className={[
                      'font-sans text-xs',
                      ticket.popular ? 'text-[#D7C6B2]' : 'text-[#5B4638]',
                    ].join(' ')}
                  >
                    por persona
                  </span>
                </div>

                {/* Includes */}
                <ul className="flex flex-col gap-2 flex-1">
                  {ticket.includes.map((item, fi) => (
                    <li key={fi} className="flex items-start gap-2">
                      <span className="text-[#A56E52] shrink-0 leading-none mt-1">&mdash;</span>
                      <span
                        className={[
                          'font-sans text-xs leading-relaxed',
                          ticket.popular ? 'text-[#D7C6B2]' : 'text-[#5B4638]',
                        ].join(' ')}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button variant={ticket.variant} size="md" href={ticket.ctaHref}>
                  {ticket.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── H. TESTIMONIALS ──────────────────────── */}
      <section className="bg-[#EAE1D6] py-24 md:py-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-16">

          <SectionHeader
            label="Testimonios"
            title="Lo que dicen quienes vivieron la experiencia."
            centered
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="flex flex-col gap-6 bg-[#F7F3EE] p-8 relative"
              >
                {/* Large decorative quote mark */}
                <span
                  className="font-serif text-8xl font-normal text-[#D7C6B2] leading-none absolute top-4 left-6 select-none pointer-events-none"
                  aria-hidden="true"

                >
                  &ldquo;
                </span>

                <p
                  className="font-serif text-base md:text-lg font-normal leading-relaxed text-[#2A2421] italic relative z-10 pt-8"

                >
                  {testimonial.text}
                </p>

                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-[#D7C6B2]">
                  <div className="w-12 h-12 relative rounded-full overflow-hidden shrink-0">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-sans text-xs font-medium uppercase tracking-widest text-[#2A2421]">
                      {testimonial.name}
                    </p>
                    <p className="font-sans text-[10px] text-[#A56E52]">
                      {testimonial.title}
                    </p>
                    <p className="font-sans text-[10px] text-[#5B4638]">
                      {testimonial.event}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── I. CLOSING CTA ───────────────────────── */}
      <section className="bg-[#2A2421] py-24 md:py-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-[1400px] mx-auto">
          <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-10">

            <div className="flex flex-col items-center gap-2">
              <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#A56E52]">
                Miami, Octubre 2025
              </span>
              <div className="h-px w-8 bg-[#A56E52]" />
            </div>

            <h2
              className="font-serif text-5xl md:text-6xl font-normal leading-tight text-[#F7F3EE]"

            >
              Tu lugar te espera.
            </h2>

            <p className="font-sans text-base leading-relaxed text-[#D7C6B2] max-w-lg">
              The Real Happiness — Miami, Octubre 2025.
            </p>

            <Button variant="terracotta" size="lg" href="/contact">
              Reservar lugar ahora
            </Button>

            <p className="font-sans text-xs text-[#B89E87] tracking-widest uppercase">
              Cupo limitado a 1,200 asistentes.
            </p>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
