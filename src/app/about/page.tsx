import Image from 'next/image';
import PublicLayout from '@/components/layout/PublicLayout';
import SectionHeader from '@/components/ui/SectionHeader';
import Button from '@/components/ui/Button';
import MobileCarousel from '@/components/ui/MobileCarousel';
import { stats } from '@/lib/data';
import { getLang } from '@/lib/i18n/getLang';

export default async function AboutPage() {
  const lang = await getLang();

  const philosophyPillars = [
    {
      number: '01',
      title: lang === 'en' ? 'Purpose before production' : 'Propósito antes que producción',
      description: lang === 'en'
        ? 'Every creative decision begins with a question: what is this for? Logistics is the vehicle, not the destination.'
        : 'Cada decisión creativa comienza con una pregunta: ¿para qué sirve esto? La logística es el vehículo, no el destino.',
    },
    {
      number: '02',
      title: lang === 'en' ? 'Community as strategy' : 'Comunidad como estrategia',
      description: lang === 'en'
        ? "We don't build audiences. We build communities. The difference lies in the human fabric formed among attendees."
        : 'No construimos audiencias. Construimos comunidades. La diferencia está en el tejido humano que se forma entre los asistentes.',
    },
    {
      number: '03',
      title: lang === 'en' ? 'Quality without excuses' : 'Calidad sin excusas',
      description: lang === 'en'
        ? "Excellence in production is not a luxury — it's respect. Respecting the time, attention, and investment of every person who attends."
        : 'La excelencia en producción no es un lujo — es respeto. Respetar el tiempo, la atención y la inversión de cada persona que asiste.',
    },
    {
      number: '04',
      title: lang === 'en' ? 'Emotion with intention' : 'Emoción con intención',
      description: lang === 'en'
        ? 'The moments that endure are not the most spectacular, but the most honest. We design for the memory that transforms.'
        : 'Los momentos que perduran no son los más espectaculares, sino los más honestos. Diseñamos para el recuerdo que transforma.',
    },
  ];

  const values = [
    {
      number: '01',
      name: lang === 'en' ? 'Authenticity' : 'Autenticidad',
      description: lang === 'en'
        ? 'Every event reflects who we are without filters. Authenticity is the only platform from which we can invite others to be authentic.'
        : 'Cada evento refleja quiénes somos sin filtros. La autenticidad es la única plataforma desde la que podemos invitar a otros a ser auténticos.',
    },
    {
      number: '02',
      name: lang === 'en' ? 'Transformation' : 'Transformación',
      description: lang === 'en'
        ? "We don't measure success by the number of attendees, but by the change that occurs in each of them. Impact is our metric."
        : 'No medimos el éxito por el número de asistentes, sino por el cambio que ocurre en cada uno de ellos. El impacto es nuestra métrica.',
    },
    {
      number: '03',
      name: lang === 'en' ? 'Excellence' : 'Excelencia',
      description: lang === 'en'
        ? 'From the first email to the last applause, every touchpoint is an opportunity to demonstrate that the best is possible.'
        : 'Desde el primer correo hasta el último aplauso, cada punto de contacto es una oportunidad de demostrar que lo mejor es posible.',
    },
    {
      number: '04',
      name: lang === 'en' ? 'Community' : 'Comunidad',
      description: lang === 'en'
        ? "The Latino community in the United States doesn't need generic representation — it needs spaces where it already feels at home. That is our work."
        : 'La comunidad latina en Estados Unidos no necesita representación genérica — necesita espacios donde ya se sienta en casa. Ese es nuestro trabajo.',
    },
  ];

  const leadershipBio = lang === 'en'
    ? 'Mónica Espinoza is the founder and CEO of ME Producciones, LLC. With more than a decade of experience in the entertainment and corporate events industry, she has led her agency to become a leading force in creating meaningful experiences for the Latino community in the United States and Ecuador. Her journey began in Ecuador, passed through Mexico, and consolidated in Miami — always with the same conviction: create events with genuine purpose that inspire, transform, and leave a positive mark.'
    : 'Mónica Espinoza es la fundadora y CEO de ME Producciones, LLC. Con más de una década de experiencia en la industria del entretenimiento y eventos corporativos, ha llevado su agencia a convertirse en una fuerza líder en la creación de experiencias significativas para la comunidad latina en Estados Unidos y Ecuador. Su camino comenzó en Ecuador, pasó por México y se consolidó en Miami — siempre con la misma convicción: crear eventos con propósito genuino que inspiren, transformen y dejen una huella positiva.';

  return (
    <PublicLayout>

      {/* ── A. PAGE HERO ───────────────────────── */}
      <section className="bg-[#2A2421] pt-24 pb-16 md:pt-28 md:pb-20 lg:pt-32 lg:pb-24">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-20">
          <div className="max-w-3xl">
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#A56E52]">
              {lang === 'en' ? 'Our Story' : 'Nuestra Historia'}
            </span>
            <div className="mt-2 mb-8 h-px w-8 bg-[#A56E52]" />
            <h1 className="font-serif text-4xl font-normal leading-tight text-[#F7F3EE] md:text-5xl lg:text-6xl">
              {lang === 'en' ? 'Who we are and why we exist' : 'Quiénes somos y por qué existimos'}
            </h1>
            <p className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-[#D7C6B2]">
              {lang === 'en'
                ? 'ME Producciones was born from a deep conviction: the Latino community deserves events that not only entertain, but inspire, connect, and transform. We are the purposeful experience production agency for the Latino community in the United States and Latin America.'
                : 'ME Producciones nació de una convicción profunda: la comunidad latina merece eventos que no solo entretengan, sino que inspiren, conecten y transformen. Somos la agencia de producción de experiencias con propósito para la comunidad latina en Estados Unidos y Latinoamérica.'}
            </p>
          </div>
        </div>
      </section>

      {/* ── B. ORIGIN STORY ────────────────────── */}
      <section className="bg-[#FDFAF7] py-12 md:py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 gap-16 md:grid-cols-2 md:gap-24">
            <div className="flex items-start">
              <div className="border-l-2 border-[#A56E52] pl-8">
                <blockquote className="font-serif text-2xl font-normal leading-relaxed text-[#2A2421] md:text-3xl">
                  {lang === 'en'
                    ? '\u201cWe believe the most powerful events don\u2019t entertain \u2014 they transform.\u201d'
                    : '\u201cCreemos que los eventos m\u00e1s poderosos no entretienen \u2014 transforman.\u201d'}
                </blockquote>
                <cite className="mt-6 block font-sans text-xs font-medium uppercase tracking-widest text-[#A56E52] not-italic">
                  Mónica Espinoza, Founder &amp; CEO
                </cite>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <p className="font-sans text-base leading-relaxed text-[#5B4638]">
                {lang === 'en'
                  ? 'ME Producciones was founded by Mónica Espinoza, an Ecuadorian entrepreneur whose path took her through Ecuador, Mexico, and finally Miami. With more than a decade of experience in entertainment and corporate events, Mónica identified a gap that no one was filling: the Latino community needed high-quality events designed with real purpose — not generic productions, but experiences born from the inside.'
                  : 'ME Producciones fue fundada por Mónica Espinoza, una emprendedora ecuatoriana cuyo camino pasó por Ecuador, México y finalmente Miami. Con más de una década de experiencia en entretenimiento y eventos corporativos, Mónica identificó una brecha que nadie estaba llenando: la comunidad latina necesitaba eventos de alta calidad diseñados con propósito real — no producciones genéricas, sino experiencias nacidas desde adentro.'}
              </p>
              <p className="font-sans text-base leading-relaxed text-[#5B4638]">
                {lang === 'en'
                  ? 'The mission is clear: support the Latino community in any area of life — personal, business, cultural — through events that entertain, inspire, and generate collective impact. From the Stand Up Latin Tour in Ecuador to the Doral Latino Art Festival and The Real Happiness MasterClass, each project carries the same signature: + Talents, + Experiences, + Connections.'
                  : 'La misión es clara: apoyar a la comunidad latina en cualquier área de su vida — personal, empresarial, cultural — a través de eventos que entretengan, inspiren y generen impacto colectivo. Desde el Stand Up Latin Tour en Ecuador hasta el Doral Latino Art Festival y The Real Happiness MasterClass, cada proyecto lleva la misma firma: + Talentos, + Experiencias, + Conexiones.'}
              </p>
              <p className="font-sans text-base leading-relaxed text-[#5B4638]">
                {lang === 'en'
                  ? `Today, ME Producciones operates in the United States and Ecuador, and has connected more than ${stats.totalAttendees.toLocaleString()} people through experiences that transform perspectives and build community. Every event carries the same promise: quality without excuses and purpose without compromise.`
                  : `Hoy, ME Producciones opera en Estados Unidos y Ecuador, y ha conectado a más de ${stats.totalAttendees.toLocaleString()} personas a través de experiencias que transforman perspectivas y construyen comunidad. Cada evento lleva la misma promesa: calidad sin excusas y propósito sin concesiones.`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── C. VISION & PHILOSOPHY ─────────────── */}
      <section className="bg-[#F7F3EE] py-12 md:py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-20">
          <SectionHeader
            label={lang === 'en' ? 'Philosophy' : 'Filosofía'}
            title={lang === 'en' ? 'A different vision of the event.' : 'Una visión diferente del evento.'}
            subtitle={lang === 'en' ? 'Four principles that guide every creative, logistical, and human decision we make.' : 'Cuatro principios que guían cada decisión creativa, logística y humana que tomamos.'}
            className="mb-8 md:mb-16"
          />
          <div className="md:hidden -mx-6 px-6">
            <MobileCarousel itemWidth="w-[82vw]" interval={4000}>
              {philosophyPillars.map((pillar) => (
                <div key={pillar.number} className="bg-white border border-[#EAE1D6] p-7 flex flex-col gap-4 min-h-[200px]">
                  <span className="shrink-0 font-serif text-4xl font-normal leading-none text-[#A56E52]">{pillar.number}</span>
                  <h3 className="font-serif text-xl font-normal text-[#2A2421]">{pillar.title}</h3>
                  <p className="font-sans text-sm leading-relaxed text-[#5B4638]">{pillar.description}</p>
                </div>
              ))}
            </MobileCarousel>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-12">
            {philosophyPillars.map((pillar) => (
              <div key={pillar.number} className="flex gap-8">
                <span className="shrink-0 font-serif text-4xl font-normal leading-none text-[#A56E52]">{pillar.number}</span>
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
      <section className="bg-[#2A2421] py-12 md:py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2 md:gap-20">
            <div>
              <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#A56E52]">
                {lang === 'en' ? 'Our First Expression' : 'Nuestra Primera Expresión'}
              </span>
              <div className="mt-2 mb-8 h-px w-8 bg-[#A56E52]" />
              <h2 className="mb-6 font-serif text-3xl font-normal leading-tight text-[#F7F3EE] md:text-4xl">
                The Real Happiness
              </h2>
              <p className="mb-5 font-sans text-base leading-relaxed text-[#D7C6B2]">
                {lang === 'en'
                  ? 'The Real Happiness emerged as the first expression of the ME Producciones philosophy — not simply an event, but a proof of concept of what it means to produce with real purpose. Before becoming a brand, it was a question: can an event truly change the lives of the people who attend?'
                  : 'The Real Happiness surgió como la primera expresión de la filosofía ME Producciones — no simplemente un evento, sino una prueba de concepto de lo que significa producir con propósito real. Antes de ser una marca, fue una pregunta: ¿puede un evento cambiar verdaderamente la vida de las personas que asisten?'}
              </p>
              <p className="mb-10 font-sans text-base leading-relaxed text-[#D7C6B2]">
                {lang === 'en'
                  ? 'The answer was a resounding yes. From its first edition in Los Angeles in 2024 to its edition in Miami in 2025, The Real Happiness has demonstrated that the Latino community is hungry for experiences that treat it with the depth it deserves. Every edition sells out. Every edition produces real, measurable transformations in its attendees.'
                  : 'La respuesta fue un rotundo sí. Desde su primera edición en Los Ángeles en 2024 hasta su edición en Miami en 2025, The Real Happiness ha demostrado que la comunidad latina está hambrienta de experiencias que la traten con la profundidad que merece. Cada edición agota su aforo. Cada edición produce transformaciones reales y medibles en sus asistentes.'}
              </p>
              <Button href="/the-real-happiness" variant="terracotta" size="lg">
                {lang === 'en' ? 'Explore The Real Happiness' : 'Explorar The Real Happiness'}
              </Button>
            </div>
            <div className="relative aspect-video w-full overflow-hidden bg-[#1A1410] flex flex-col items-center justify-center gap-4 border border-[#5B4638]/40">
              <div className="flex h-14 w-14 items-center justify-center border border-[#A56E52] rounded-full">
                <svg className="w-6 h-6 text-[#A56E52] ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#5B4638]">
                {lang === 'en' ? 'Promotional video — Coming soon' : 'Video promocional — Próximamente'}
              </p>
              <p className="font-serif text-sm text-[#D7C6B2] text-center px-8 leading-relaxed">
                The Real Happiness MasterClass · Summit III<br />
                Doral · Samborondón · Orlando · 2026
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── E. LEADERSHIP ──────────────────────── */}
      <section className="bg-[#FDFAF7] py-12 md:py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-20">
          <SectionHeader
            label={lang === 'en' ? 'Team' : 'Equipo'}
            title={lang === 'en' ? 'The people behind the experience.' : 'Las personas detrás de la experiencia.'}
            className="mb-8 md:mb-16"
          />
          <div className="md:hidden -mx-6 px-6">
            <MobileCarousel itemWidth="w-[78vw]" interval={5000}>
              <div className="flex flex-col">
                <div className="relative mb-4 aspect-square w-full overflow-hidden">
                  <Image fill src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80" alt="Mónica Espinoza — Founder & CEO" className="object-cover" sizes="80vw" />
                </div>
                <h3 className="mb-1 font-serif text-xl font-normal text-[#2A2421]">Mónica Espinoza</h3>
                <span className="mb-3 font-sans text-xs font-medium uppercase tracking-widest text-[#A56E52]">Founder &amp; CEO</span>
                <p className="font-sans text-sm leading-relaxed text-[#5B4638] line-clamp-4">{leadershipBio}</p>
              </div>
            </MobileCarousel>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-16 max-w-3xl">
            <div className="flex flex-col">
              <div className="relative mb-6 aspect-square w-full overflow-hidden">
                <Image fill src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80" alt="Mónica Espinoza — Founder & CEO" className="object-cover" sizes="33vw" />
              </div>
              <h3 className="mb-1 font-serif text-xl font-normal text-[#2A2421]">Mónica Espinoza</h3>
              <span className="mb-4 font-sans text-xs font-medium uppercase tracking-widest text-[#A56E52]">Founder &amp; CEO</span>
              <p className="font-sans text-sm leading-relaxed text-[#5B4638]">{leadershipBio}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── F. VALUES BLOCK ────────────────────── */}
      <section className="bg-[#EAE1D6] py-12 md:py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-20">
          <SectionHeader
            label={lang === 'en' ? 'Values' : 'Valores'}
            title={lang === 'en' ? 'What moves us.' : 'Lo que nos mueve.'}
            className="mb-8 md:mb-16"
          />
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
      <section className="bg-[#F7F3EE] py-12 md:py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-20 text-center">
          <h2 className="mb-4 font-serif text-3xl font-normal text-[#2A2421] md:text-4xl">
            {lang === 'en' ? 'Be part of the experience.' : 'Sé parte de la experiencia.'}
          </h2>
          <p className="mx-auto mb-10 max-w-lg font-sans text-base text-[#5B4638]">
            {lang === 'en'
              ? 'Discover our experiences or get in touch with the team for a personalized conversation.'
              : 'Descubre nuestras experiencias o ponte en contacto con el equipo para una conversación personalizada.'}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button href="/experiences" variant="primary" size="lg">
              {lang === 'en' ? 'Explore experiences' : 'Explorar experiencias'}
            </Button>
            <Button href="/contact" variant="secondary" size="lg">
              {lang === 'en' ? 'Contact the team' : 'Contactar al equipo'}
            </Button>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
