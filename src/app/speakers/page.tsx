import Image from 'next/image';
import PublicLayout from '@/components/layout/PublicLayout';
import SectionHeader from '@/components/ui/SectionHeader';
import Button from '@/components/ui/Button';
import MobileCarousel from '@/components/ui/MobileCarousel';
import { speakers, events } from '@/lib/data';

function ExpertiseTag({ label }: { label: string }) {
  return (
    <span className="inline-block border border-[#D7C6B2] px-2 py-0.5 text-[10px] font-sans font-medium uppercase tracking-widest text-[#5B4638]">
      {label}
    </span>
  );
}

function SpeakerCard({ speaker, large = false }: { speaker: (typeof speakers)[0]; large?: boolean }) {
  const speakerEvents = events.filter((e) => speaker.eventIds.includes(e.id));
  const primaryEvent = speakerEvents[0];

  return (
    <article className="group flex flex-col">
      {/* Speaker portrait */}
      <div className="relative w-full aspect-square overflow-hidden">
        <Image
          src={speaker.image}
          alt={speaker.name}
          fill
          className="object-cover object-top"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-[#EAE1D6] opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 pt-5">
        {primaryEvent && (
          <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-[#A56E52]">
            {primaryEvent.title}
          </p>
        )}

        <div>
          <h3
            className="font-serif text-xl font-normal leading-snug text-[#2A2421]"

          >
            {speaker.name}
          </h3>
          <p className="mt-1 font-sans text-sm text-[#5B4638]">
            {speaker.title}
          </p>
          <p className="font-sans text-sm text-[#A56E52]">
            {speaker.organization}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {speaker.expertise.slice(0, 3).map((tag) => (
            <ExpertiseTag key={tag} label={tag} />
          ))}
        </div>
      </div>
    </article>
  );
}

export default function SpeakersPage() {
  const featured = speakers.filter((s) => s.featured);
  const all = speakers;

  return (
    <PublicLayout>
      {/* ── Hero ─────────────────────────────────── */}
      <section className="bg-[#FDFAF7] pb-20 pt-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="max-w-3xl">
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#A56E52]">
              Ponentes e Invitados
            </span>
            <div className="mt-2 h-px w-8 bg-[#A56E52]" />
            <h1
              className="mt-6 font-serif text-5xl font-normal leading-tight text-[#2A2421] md:text-6xl lg:text-7xl"
            >
              Voces que
              <br />
              transforman.
            </h1>
            <p className="mt-8 max-w-xl font-sans text-base leading-relaxed text-[#5B4638]">
              Cada ponente que invitamos lleva una historia que amplía lo posible. Nuestra filosofía de selección es simple: buscamos voces que desafíen, sanen, inspiren y arraiguen — voces enraizadas en la experiencia latina que llegan mucho más allá.
            </p>
          </div>
        </div>
      </section>

      {/* ── Thin divider ─────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="h-px bg-[#EAE1D6]" />
      </div>

      {/* ── Featured Speakers ─────────────────────── */}
      <section className="bg-[#FDFAF7] py-12 md:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <SectionHeader
            label="Seleccionados"
            title="Ponentes destacados"
            subtitle="Las voces en el centro de nuestros escenarios más transformadores."
            className="mb-8 md:mb-16"
          />

          {/* Mobile carousel */}
          <div className="sm:hidden -mx-6 px-6">
            <MobileCarousel itemWidth="w-[72vw]" interval={4000}>
              {featured.map((speaker) => (
                <SpeakerCard key={speaker.id} speaker={speaker} large />
              ))}
            </MobileCarousel>
          </div>

          {/* Tablet+ grid */}
          <div className="hidden sm:grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((speaker) => (
              <SpeakerCard key={speaker.id} speaker={speaker} large />
            ))}
          </div>
        </div>
      </section>

      {/* ── All Speakers ─────────────────────────── */}
      <section className="bg-[#EAE1D6] py-12 md:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <SectionHeader
            label="Todos los ponentes"
            title="La comunidad de voces"
            subtitle="Desde conferenciantes visionarios hasta facilitadores de talleres íntimos — cada uno elegido cuidadosamente."
            className="mb-8 md:mb-16"
          />

          {/* Mobile: 2-col grid is compact enough */}
          <div className="sm:hidden grid grid-cols-2 gap-x-4 gap-y-8">
            {all.map((speaker) => (
              <SpeakerCard key={speaker.id} speaker={speaker} />
            ))}
          </div>

          {/* Tablet+ grid */}
          <div className="hidden sm:grid gap-x-8 gap-y-14 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {all.map((speaker) => (
              <SpeakerCard key={speaker.id} speaker={speaker} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Speaking Inquiry ─────────────────────── */}
      <section className="bg-[#2A2421] py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#A56E52]">
                Aplica como Ponente
              </span>
              <div className="mt-2 h-px w-8 bg-[#A56E52]" />
              <h2
                className="mt-6 font-serif text-4xl font-normal leading-tight text-[#F7F3EE] md:text-5xl"
              >
                Comparte tu voz
                <br />
                con nuestra comunidad.
              </h2>
            </div>

            <div className="flex flex-col gap-6">
              <p className="font-sans text-base leading-relaxed text-[#D7C6B2]">
                Siempre estamos atentos a voces que desafíen, iluminen y eleven. Si tienes una perspectiva arraigada en la experiencia latina — en negocios, bienestar, fe, creatividad o comunidad — te invitamos a iniciar una conversación con nosotros.
              </p>
              <p className="font-sans text-sm leading-relaxed text-[#A56E52]">
                Todas las solicitudes son revisadas personalmente. Respondemos cada mensaje en un plazo de 5 a 7 días hábiles.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <Button href="/contact#speaker" variant="terracotta" size="lg">
                  Enviar solicitud
                </Button>
                <Button href="/contact" variant="ghost" size="lg">
                  Contáctanos
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
