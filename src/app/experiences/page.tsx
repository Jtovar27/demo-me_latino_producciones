import Image from 'next/image';
import PublicLayout from '@/components/layout/PublicLayout';
import SectionHeader from '@/components/ui/SectionHeader';
import Button from '@/components/ui/Button';
import MobileCarousel from '@/components/ui/MobileCarousel';
import { experiences } from '@/lib/data';
import { editorialImages } from '@/lib/media';

const categoryLabels: Record<string, string> = {
  flagship: 'Experiencia Insignia',
  summit: 'Summit',
  wellness: 'Bienestar',
  community: 'Comunidad',
  branded: 'Experiencia de Marca',
};

const processSteps = [
  {
    number: '01',
    title: 'Escuchamos',
    description:
      'Todo comienza con una conversación profunda. Entendemos el propósito, la audiencia, y la transformación que buscamos crear juntos.',
  },
  {
    number: '02',
    title: 'Diseñamos',
    description:
      'Construimos cada experiencia como una obra editorial — cada sesión, cada transición, cada detalle sirve a la intención total.',
  },
  {
    number: '03',
    title: 'Producimos',
    description:
      'Con estándares de producción premium, ejecutamos cada elemento con precisión. Nada se deja al azar; todo es intencional.',
  },
  {
    number: '04',
    title: 'Transformamos',
    description:
      'El resultado no es un evento. Es un antes y un después. Creamos los momentos que la gente recuerda por décadas.',
  },
];

export default function ExperiencesPage() {
  const flagshipExperience = experiences.find((e) => e.slug === 'the-real-happiness');

  return (
    <PublicLayout>
      {/* ── Page Hero ─────────────────────────────── */}
      <section className="bg-[#F7F3EE] pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#A56E52]">
              Nuestras Experiencias
            </span>
            <div className="h-px w-8 bg-[#A56E52] mt-2 mb-8" />
            <h1
              className="font-serif text-5xl md:text-6xl lg:text-7xl font-normal leading-none text-[#2A2421] mb-8"

            >
              Cada experiencia,
              <br />
              una transformación.
            </h1>
            <p className="font-sans text-lg leading-relaxed text-[#5B4638] max-w-xl">
              En ME Latino Producciones no producimos eventos. Diseñamos experiencias que marcan un
              antes y un después en la vida de quienes las viven.
            </p>
          </div>
        </div>
      </section>

      {/* ── Experience Categories Grid ─────────────── */}
      <section className="bg-[#FDFAF7] py-12 md:py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            label="Lo que hacemos"
            title="Nuestro universo de experiencias"
            subtitle="Seis formatos. Un propósito: crear momentos que importan para la comunidad latina."
            className="mb-8 md:mb-16"
          />

          {/* Mobile carousel */}
          <div className="md:hidden -mx-6 px-6">
            <MobileCarousel itemWidth="w-[78vw]" interval={4000}>
              {experiences.map((experience) => (
                <article
                  key={experience.id}
                  className="group bg-[#F7F3EE] border border-[#EAE1D6] flex flex-col h-full"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      fill
                      src={experience.image}
                      alt={experience.title}
                      className="object-cover"
                      sizes="80vw"
                    />
                  </div>
                  <div className="flex flex-col flex-1 p-5 gap-3">
                    <span className="font-sans text-[10px] font-medium uppercase tracking-widest text-[#A56E52]">
                      {categoryLabels[experience.category]}
                    </span>
                    <h3 className="font-serif text-lg font-normal text-[#2A2421] leading-snug">
                      {experience.title}
                    </h3>
                    <p className="font-sans text-sm leading-relaxed text-[#5B4638] line-clamp-2">
                      {experience.shortDesc}
                    </p>
                    <div className="mt-auto pt-1">
                      <Button variant="ghost" size="sm" href={`/experiences/${experience.slug}`}
                        className="p-0 border-none hover:bg-transparent text-[#A56E52] uppercase text-[10px] tracking-widest">
                        Conocer más →
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </MobileCarousel>
          </div>

          {/* Desktop grid */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map((experience) => (
              <article
                key={experience.id}
                className="group bg-[#F7F3EE] border border-[#EAE1D6] transition-all duration-300 hover:border-[#A56E52] hover:shadow-[0_8px_32px_rgba(42,36,33,0.08)] flex flex-col"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    fill
                    src={experience.image}
                    alt={experience.title}
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 flex items-end p-4">
                    <span className="font-sans text-[10px] font-medium uppercase tracking-widest text-[#F7F3EE]/70">
                      {categoryLabels[experience.category]}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col flex-1 p-6 gap-4">
                  <div>
                    <span className="font-sans text-[10px] font-medium uppercase tracking-widest text-[#A56E52] mb-2 block">
                      {categoryLabels[experience.category]}
                    </span>
                    <h3 className="font-serif text-xl font-normal text-[#2A2421] leading-snug mb-3">
                      {experience.title}
                    </h3>
                    <p className="font-sans text-sm leading-relaxed text-[#5B4638]">
                      {experience.shortDesc}
                    </p>
                  </div>
                  <div className="mt-auto pt-2">
                    <Button variant="ghost" size="sm" href={`/experiences/${experience.slug}`}
                      className="p-0 border-none hover:bg-transparent text-[#A56E52] hover:text-[#5B4638] uppercase text-[10px] tracking-widest">
                      Conocer más &rarr;
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Real Happiness Featured Block ─────── */}
      {flagshipExperience && (
        <section className="bg-[#2A2421] py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Image */}
              <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[480px] overflow-hidden">
                <Image
                  fill
                  src={editorialImages.experiencesFlagship.src}
                  alt={editorialImages.experiencesFlagship.alt}
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              {/* Content */}
              <div className="bg-[#3A302C] p-10 lg:p-16 flex flex-col justify-center gap-6">
                <div>
                  <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#A56E52]">
                    Experiencia Insignia
                  </span>
                  <div className="h-px w-8 bg-[#A56E52] mt-2 mb-6" />
                </div>
                <h2
                  className="font-serif text-4xl lg:text-5xl font-normal leading-tight text-[#F7F3EE]"

                >
                  The Real Happiness
                </h2>
                <p className="font-sans text-base leading-relaxed text-[#D7C6B2]">
                  {flagshipExperience.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button variant="terracotta" size="md" href="/the-real-happiness">
                    Conocer la experiencia
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    href="/events"
                    className="border-[#F7F3EE] text-[#F7F3EE] hover:bg-[#F7F3EE] hover:text-[#2A2421]"
                  >
                    Ver próximas fechas
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Process Section ────────────────────────── */}
      <section className="bg-[#F7F3EE] py-12 md:py-24 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Mobile header */}
          <div className="md:hidden mb-8">
            <SectionHeader
              label="Cómo trabajamos"
              title="El proceso detrás de cada experiencia"
              subtitle="Cuatro etapas que transforman una visión en un momento que permanece."
            />
          </div>

          {/* Mobile: 4 steps horizontal carousel, one at a time */}
          <div className="md:hidden -mx-6 px-6">
            <MobileCarousel itemWidth="w-[82vw]" interval={4000} autoPlay>
              {processSteps.map((step) => (
                <div key={step.number} className="bg-[#FDFAF7] border border-[#EAE1D6] p-7 flex flex-col gap-4 h-full min-h-[200px]">
                  <span className="font-serif text-5xl font-normal text-[#D7C6B2] leading-none">
                    {step.number}
                  </span>
                  <h3 className="font-sans text-sm font-medium uppercase tracking-widest text-[#2A2421]">
                    {step.title}
                  </h3>
                  <p className="font-sans text-sm leading-relaxed text-[#5B4638]">
                    {step.description}
                  </p>
                </div>
              ))}
            </MobileCarousel>
          </div>

          {/* Desktop: 2-col layout */}
          <div className="hidden md:grid grid-cols-2 gap-16 items-start">
            <SectionHeader
              label="Cómo trabajamos"
              title="El proceso"
              subtitle="Cuatro etapas que transforman una visión en un momento que permanece."
            />
            <div className="flex flex-col gap-0 divide-y divide-[#D7C6B2]">
              {processSteps.map((step) => (
                <div key={step.number} className="flex gap-6 py-8 first:pt-0 last:pb-0">
                  <span className="font-serif text-4xl font-normal text-[#D7C6B2] leading-none flex-shrink-0 w-12">
                    {step.number}
                  </span>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-sans text-sm font-medium uppercase tracking-widest text-[#2A2421]">
                      {step.title}
                    </h3>
                    <p className="font-sans text-sm leading-relaxed text-[#5B4638]">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA to Contact ─────────────────────────── */}
      <section className="bg-[#EAE1D6] py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#A56E52]">
            Trabajemos juntos
          </span>
          <div className="h-px w-8 bg-[#A56E52] mt-2 mb-8 mx-auto" />
          <h2
            className="font-serif text-4xl md:text-5xl font-normal text-[#2A2421] mb-6 max-w-2xl mx-auto leading-tight"

          >
            Tiene una visión. Nosotros la hacemos realidad.
          </h2>
          <p className="font-sans text-base leading-relaxed text-[#5B4638] max-w-lg mx-auto mb-10">
            Cuéntenos sobre su comunidad, su marca, o su idea. Estamos listos para crear algo
            extraordinario.
          </p>
          <Button variant="primary" size="lg" href="/contact">
            Iniciar conversación
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
