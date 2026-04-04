import Image from 'next/image';
import PublicLayout from '@/components/layout/PublicLayout';
import SectionHeader from '@/components/ui/SectionHeader';
import Button from '@/components/ui/Button';
import MobileCarousel from '@/components/ui/MobileCarousel';
import { stats } from '@/lib/data';
import { editorialImages } from '@/lib/media';

// ── Editorial data ──────────────────────────────

const philosophyPillars = [
  {
    number: '01',
    title: 'Propósito antes que producción',
    description:
      'Cada decisión creativa comienza con una pregunta: ¿para qué sirve esto? La logística es el vehículo, no el destino.',
  },
  {
    number: '02',
    title: 'Comunidad como estrategia',
    description:
      'No construimos audiencias. Construimos comunidades. La diferencia está en el tejido humano que se forma entre los asistentes.',
  },
  {
    number: '03',
    title: 'Calidad sin excusas',
    description:
      'La excelencia en producción no es un lujo — es respeto. Respetar el tiempo, la atención y la inversión de cada persona que asiste.',
  },
  {
    number: '04',
    title: 'Emoción con intención',
    description:
      'Los momentos que perduran no son los más espectaculares, sino los más honestos. Diseñamos para el recuerdo que transforma.',
  },
];

const leadershipTeam = [
  {
    name: 'Mariana Ríos Delgado',
    title: 'Founder & CEO',
    bio: 'Mariana fundó ME Latino Producciones en 2021 después de 15 años produciendo eventos en Latinoamérica y los Estados Unidos. Su visión de crear experiencias con propósito real para la comunidad latina dio origen a The Real Happiness y continúa impulsando cada nuevo proyecto.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Santiago Pérez',
    title: 'Director de Producción',
    bio: 'Santiago lidera la producción técnica y logística de cada evento, garantizando que la visión creativa se materialice con la más alta calidad. Su experiencia en producción de gran escala asegura resultados que superan las expectativas.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Valeria Mondragón',
    title: 'Directora de Experiencias',
    bio: 'Valeria diseña el arco emocional de cada evento, desde la bienvenida hasta el cierre. Su enfoque en la experiencia del asistente convierte los momentos ordinarios en memorias duraderas que las personas llevan consigo mucho después del evento.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
  },
];

const values = [
  {
    number: '01',
    name: 'Autenticidad',
    description:
      'Cada evento refleja quiénes somos sin filtros. La autenticidad es la única plataforma desde la que podemos invitar a otros a ser auténticos.',
  },
  {
    number: '02',
    name: 'Transformación',
    description:
      'No medimos el éxito por el número de asistentes, sino por el cambio que ocurre en cada uno de ellos. El impacto es nuestra métrica.',
  },
  {
    number: '03',
    name: 'Excelencia',
    description:
      'Desde el primer correo hasta el último aplauso, cada punto de contacto es una oportunidad de demostrar que lo mejor es posible.',
  },
  {
    number: '04',
    name: 'Comunidad',
    description:
      'La comunidad latina en Estados Unidos no necesita representación genérica — necesita espacios donde ya se sienta en casa. Ese es nuestro trabajo.',
  },
];

// ── Page ────────────────────────────────────────

export default function AboutPage() {
  return (
    <PublicLayout>

      {/* ── A. PAGE HERO ───────────────────────── */}
      <section className="bg-[#2A2421] py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="max-w-3xl">
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#A56E52]">
              Nuestra Historia
            </span>
            <div className="mt-2 mb-8 h-px w-8 bg-[#A56E52]" />
            <h1
              className="font-serif text-4xl font-normal leading-tight text-[#F7F3EE] md:text-5xl lg:text-6xl"

            >
              Quiénes somos y por qué existimos
            </h1>
            <p className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-[#D7C6B2]">
              ME Latino Producciones nació de la convicción de que los eventos más poderosos no
              solo entretienen — transforman. Somos la empresa de producción de eventos premium
              para la comunidad latina en los Estados Unidos.
            </p>
          </div>
        </div>
      </section>

      {/* ── B. ORIGIN STORY ────────────────────── */}
      <section className="bg-[#FDFAF7] py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid grid-cols-1 gap-16 md:grid-cols-2 md:gap-24">

            {/* Pull quote */}
            <div className="flex items-start">
              <div className="border-l-2 border-[#A56E52] pl-8">
                <blockquote
                  className="font-serif text-2xl font-normal leading-relaxed text-[#2A2421] md:text-3xl"

                >
                  &ldquo;Creemos que los eventos m&aacute;s poderosos no entretienen &mdash;
                  transforman.&rdquo;
                </blockquote>
                <cite className="mt-6 block font-sans text-xs font-medium uppercase tracking-widest text-[#A56E52] not-italic">
                  Mariana Ríos Delgado, Founder &amp; CEO
                </cite>
              </div>
            </div>

            {/* Story text */}
            <div className="flex flex-col gap-6">
              <p className="font-sans text-base leading-relaxed text-[#5B4638]">
                ME Latino Producciones fue fundada en 2021 por Mariana Ríos Delgado, después de
                más de 15 años produciendo eventos de gran escala en Latinoamérica y los Estados
                Unidos. A lo largo de su carrera, Mariana trabajó con organizaciones culturales,
                marcas multinacionales y comunidades locales, e identificó una brecha persistente:
                los eventos de alta calidad raramente estaban diseñados con la comunidad latina
                en mente.
              </p>
              <p className="font-sans text-base leading-relaxed text-[#5B4638]">
                La visión era clara desde el principio: crear eventos que no solo convocaran a la
                comunidad latina, sino que la celebraran, la retaran y la transformaran. No
                producciones genéricas con traducción al español, sino experiencias nacidas desde
                adentro — desde la cultura, los valores, y las historias reales de millones de
                latinos construyendo una vida en este país.
              </p>
              <p className="font-sans text-base leading-relaxed text-[#5B4638]">
                Hoy, ME Latino Producciones opera en cinco ciudades, ha producido{' '}
                {stats.totalEvents} eventos y ha conectado a más de{' '}
                {stats.totalAttendees.toLocaleString()} personas. Cada evento lleva la misma
                promesa: calidad sin excusas y propósito sin concesiones.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── C. VISION & PHILOSOPHY ─────────────── */}
      <section className="bg-[#F7F3EE] py-12 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <SectionHeader
            label="Filosofía"
            title="Una visión diferente del evento."
            subtitle="Cuatro principios que guían cada decisión creativa, logística y humana que tomamos."
            className="mb-8 md:mb-16"
          />

          {/* Mobile carousel */}
          <div className="md:hidden -mx-6 px-6">
            <MobileCarousel itemWidth="w-[82vw]" interval={4000}>
              {philosophyPillars.map((pillar) => (
                <div key={pillar.number} className="bg-white border border-[#EAE1D6] p-7 flex flex-col gap-4 min-h-[200px]">
                  <span className="shrink-0 font-serif text-4xl font-normal leading-none text-[#A56E52]">
                    {pillar.number}
                  </span>
                  <h3 className="font-serif text-xl font-normal text-[#2A2421]">{pillar.title}</h3>
                  <p className="font-sans text-sm leading-relaxed text-[#5B4638]">{pillar.description}</p>
                </div>
              ))}
            </MobileCarousel>
          </div>

          {/* Desktop grid */}
          <div className="hidden md:grid grid-cols-2 gap-12">
            {philosophyPillars.map((pillar) => (
              <div key={pillar.number} className="flex gap-8">
                <span className="shrink-0 font-serif text-4xl font-normal leading-none text-[#A56E52]">
                  {pillar.number}
                </span>
                <div>
                  <h3 className="mb-3 font-serif text-xl font-normal text-[#2A2421]">{pillar.title}</h3>
                  <p className="font-sans text-sm leading-relaxed text-[#5B4638]">{pillar.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── D. THE REAL HAPPINESS CONNECTION ──── */}
      <section className="bg-[#2A2421] py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2 md:gap-20">

            {/* Text */}
            <div>
              <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#A56E52]">
                Nuestra Primera Expresión
              </span>
              <div className="mt-2 mb-8 h-px w-8 bg-[#A56E52]" />
              <h2
                className="mb-6 font-serif text-3xl font-normal leading-tight text-[#F7F3EE] md:text-4xl"

              >
                The Real Happiness
              </h2>
              <p className="mb-5 font-sans text-base leading-relaxed text-[#D7C6B2]">
                The Real Happiness surgió como la primera expresión de la filosofía ME Latino —
                no simplemente un evento, sino una prueba de concepto de lo que significa producir
                con propósito real. Antes de ser una marca, fue una pregunta: ¿puede un evento
                cambiar verdaderamente la vida de las personas que asisten?
              </p>
              <p className="mb-10 font-sans text-base leading-relaxed text-[#D7C6B2]">
                La respuesta fue un rotundo sí. Desde su primera edición en Los Ángeles en 2024
                hasta su edición en Miami en 2025, The Real Happiness ha demostrado que la
                comunidad latina está hambrienta de experiencias que la traten con la profundidad
                que merece. Cada edición agota su aforo. Cada edición produce transformaciones
                reales y medibles en sus asistentes.
              </p>
              <Button href="/the-real-happiness" variant="terracotta" size="lg">
                Explorar The Real Happiness
              </Button>
            </div>

            {/* Image */}
            <div className="relative aspect-video w-full overflow-hidden">
              <Image
                fill
                src={editorialImages.aboutTheRealHappiness.src}
                alt={editorialImages.aboutTheRealHappiness.alt}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

          </div>
        </div>
      </section>

      {/* ── E. LEADERSHIP ──────────────────────── */}
      <section className="bg-[#FDFAF7] py-12 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <SectionHeader
            label="Equipo"
            title="Las personas detrás de la experiencia."
            className="mb-8 md:mb-16"
          />

          {/* Mobile carousel */}
          <div className="md:hidden -mx-6 px-6">
            <MobileCarousel itemWidth="w-[78vw]" interval={5000}>
              {leadershipTeam.map((person) => (
                <div key={person.name} className="flex flex-col">
                  <div className="relative mb-4 aspect-square w-full overflow-hidden">
                    <Image fill src={person.image} alt={`${person.name} — ${person.title}`}
                      className="object-cover" sizes="80vw" />
                  </div>
                  <h3 className="mb-1 font-serif text-xl font-normal text-[#2A2421]">{person.name}</h3>
                  <span className="mb-3 font-sans text-xs font-medium uppercase tracking-widest text-[#A56E52]">{person.title}</span>
                  <p className="font-sans text-sm leading-relaxed text-[#5B4638] line-clamp-4">{person.bio}</p>
                </div>
              ))}
            </MobileCarousel>
          </div>

          {/* Desktop grid */}
          <div className="hidden md:grid grid-cols-3 gap-10">
            {leadershipTeam.map((person) => (
              <div key={person.name} className="flex flex-col">
                <div className="relative mb-6 aspect-square w-full overflow-hidden">
                  <Image fill src={person.image} alt={`${person.name} — ${person.title}`}
                    className="object-cover" sizes="33vw" />
                </div>
                <h3 className="mb-1 font-serif text-xl font-normal text-[#2A2421]">{person.name}</h3>
                <span className="mb-4 font-sans text-xs font-medium uppercase tracking-widest text-[#A56E52]">{person.title}</span>
                <p className="font-sans text-sm leading-relaxed text-[#5B4638]">{person.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── F. VALUES BLOCK ────────────────────── */}
      <section className="bg-[#EAE1D6] py-12 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <SectionHeader
            label="Valores"
            title="Lo que nos mueve."
            className="mb-8 md:mb-16"
          />

          {/* Mobile carousel */}
          <div className="md:hidden -mx-6 px-6">
            <MobileCarousel itemWidth="w-[82vw]" interval={4500}>
              {values.map((value) => (
                <div key={value.number} className="flex flex-col gap-3 bg-[#F7F3EE] p-7 min-h-[180px]">
                  <span className="font-serif text-3xl font-normal text-[#A56E52]">{value.number}</span>
                  <h3 className="font-serif text-xl font-normal text-[#2A2421]">{value.name}</h3>
                  <p className="font-sans text-sm leading-relaxed text-[#5B4638]">{value.description}</p>
                </div>
              ))}
            </MobileCarousel>
          </div>

          {/* Desktop grid */}
          <div className="hidden md:grid grid-cols-2 gap-8">
            {values.map((value) => (
              <div key={value.number} className="flex flex-col gap-3 bg-[#F7F3EE] p-10">
                <span className="font-serif text-3xl font-normal text-[#A56E52]">{value.number}</span>
                <h3 className="font-serif text-xl font-normal text-[#2A2421]">{value.name}</h3>
                <p className="font-sans text-sm leading-relaxed text-[#5B4638]">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── G. CLOSING CTA ─────────────────────── */}
      <section className="bg-[#F7F3EE] py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12 text-center">
          <h2
            className="mb-4 font-serif text-3xl font-normal text-[#2A2421] md:text-4xl"

          >
            Sé parte de la experiencia.
          </h2>
          <p className="mx-auto mb-10 max-w-lg font-sans text-base text-[#5B4638]">
            Descubre nuestras experiencias o ponte en contacto con el equipo para una
            conversación personalizada.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button href="/experiences" variant="primary" size="lg">
              Explorar experiencias
            </Button>
            <Button href="/contact" variant="secondary" size="lg">
              Contactar al equipo
            </Button>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
