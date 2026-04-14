import Link from 'next/link';
import Image from 'next/image';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import SponsorPackagesSection from '@/components/sponsors/SponsorPackagesSection';
import { getSponsors } from '@/app/actions/sponsors';
import type { DBSponsor } from '@/types/supabase';

export const revalidate = 0;

// ── Types & constants ───────────────────────────────────

type SponsorTier = 'platinum' | 'silver' | 'blue' | 'pink';

const TIER_ORDER: SponsorTier[] = ['platinum', 'silver', 'blue', 'pink'];

function safeTier(t: string): SponsorTier {
  return (['platinum', 'silver', 'blue', 'pink'] as const).includes(t as SponsorTier)
    ? (t as SponsorTier)
    : 'pink';
}

const TIER_META: Record<
  SponsorTier,
  {
    label: string;
    description: string;
    /** card border + accent */
    borderClass: string;
    /** tier label pill */
    pillClass: string;
    /** logo container height (Tailwind) */
    logoH: string;
    /** columns at various breakpoints */
    gridClass: string;
    /** card background */
    cardBg: string;
  }
> = {
  platinum: {
    label: 'Platinum',
    description:
      'Nuestros aliados más comprometidos — presentes en cada punto de contacto de la experiencia ME Producciones.',
    borderClass: 'border-[#2A2421]',
    pillClass: 'bg-[#2A2421] text-[#F7F3EE]',
    logoH: 'aspect-[4/3]',
    gridClass: 'grid-cols-2 sm:grid-cols-2',
    cardBg: 'bg-[#FDFAF7]',
  },
  silver: {
    label: 'Silver',
    description: 'Socios integrales que amplifican nuestros eventos y valores compartidos a gran escala.',
    borderClass: 'border-[#D7C6B2]',
    pillClass: 'bg-[#EAE1D6] text-[#5B4638]',
    logoH: 'aspect-[4/3]',
    gridClass: 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3',
    cardBg: 'bg-[#FDFAF7]',
  },
  blue: {
    label: 'Blue',
    description: 'Socios emergentes que aportan experiencia, alcance y comunidad.',
    borderClass: 'border-[#4A7FA5]',
    pillClass: 'bg-[#E8F1F7] text-[#4A7FA5]',
    logoH: 'aspect-[4/3]',
    gridClass: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    cardBg: 'bg-[#F7F3EE]',
  },
  pink: {
    label: 'Pink',
    description:
      'Organizaciones alineadas con nuestra misión de celebración cultural e impacto colectivo.',
    borderClass: 'border-[#C4758A]',
    pillClass: 'bg-[#FAF0F3] text-[#C4758A]',
    logoH: 'aspect-[4/3]',
    gridClass: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    cardBg: 'bg-[#F7F3EE]',
  },
};

const WHY_PARTNER = [
  {
    number: '01',
    title: 'Alcance premium',
    body: 'Acceso directo a más de 18,500 consumidores latinos premium — profesionales, fundadores, creativos y líderes comunitarios con alto poder adquisitivo e influencia.',
  },
  {
    number: '02',
    title: 'Alineación de marca',
    body: 'La asociación con ME Producciones comunica un compromiso genuino con la cultura latina. Nuestra comunidad reconoce y premia la alineación auténtica de marca.',
  },
  {
    number: '03',
    title: 'Presencia editorial',
    body: 'Tu marca aparece en contenido de calidad editorial — antes, durante y después de cada evento — en redes sociales, email y nuestra creciente presencia en medios.',
  },
  {
    number: '04',
    title: 'Impacto medible',
    body: 'Cada socio recibe un reporte de impacto post-evento: alcance, impresiones, sentimiento y retroalimentación cualitativa de la comunidad. Métricas claras, no suposiciones.',
  },
];

// ── Sub-components ───────────────────────────────────────

function TierPill({ tier }: { tier: SponsorTier }) {
  const { label, pillClass } = TIER_META[tier];
  return (
    <span
      className={`inline-block px-3 py-1 font-sans text-[9px] uppercase tracking-[0.2em] font-medium ${pillClass}`}
    >
      {label}
    </span>
  );
}

function SponsorCard({ sponsor, tier }: { sponsor: DBSponsor; tier: SponsorTier }) {
  const { borderClass, logoH, cardBg } = TIER_META[tier];
  const isPlatinum = tier === 'platinum';

  const inner = (
    <div
      className={[
        'group flex flex-col border overflow-hidden transition-all duration-200',
        borderClass,
        cardBg,
        sponsor.website
          ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
          : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Logo area — natural proportions, no crop */}
      <div className="w-full border-b border-[#EAE1D6]">
        {sponsor.logo_url ? (
          <Image
            src={sponsor.logo_url}
            alt={sponsor.name}
            width={0}
            height={0}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="w-full h-auto block"
            unoptimized
          />
        ) : (
          <div className={`w-full py-16 flex items-center justify-center ${cardBg}`}>
            <p
              className={[
                'font-serif font-normal text-[#2A2421] text-center leading-tight px-6',
                isPlatinum ? 'text-2xl' : 'text-base',
              ].join(' ')}
            >
              {sponsor.name}
            </p>
          </div>
        )}
      </div>

      {/* Info below image */}
      <div className={`flex flex-col gap-2 ${isPlatinum ? 'p-4 sm:p-8' : 'p-3 sm:p-5'}`}>
      {/* Tier + link icon */}
      <div className="flex items-center justify-between gap-2">
        <TierPill tier={tier} />
        {sponsor.website && (
          <svg
            className="w-3.5 h-3.5 text-[#D7C6B2] group-hover:text-[#A56E52] transition-colors shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        )}
      </div>

      {/* Name (if has logo) */}
      {sponsor.logo_url && (
        <p
          className={[
            'font-sans font-medium text-[#2A2421] leading-snug',
            isPlatinum ? 'text-sm' : 'text-xs',
          ].join(' ')}
        >
          {sponsor.name}
        </p>
      )}

      {/* Description — platinum only */}
      {sponsor.description && isPlatinum && (
        <p className="font-sans text-xs leading-relaxed text-[#5B4638]">
          {sponsor.description}
        </p>
      )}
      </div>{/* end info */}
    </div>
  );

  if (sponsor.website) {
    return (
      <a
        href={sponsor.website}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visitar sitio web de ${sponsor.name}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A56E52]"
      >
        {inner}
      </a>
    );
  }

  return <div>{inner}</div>;
}

// ── Page ─────────────────────────────────────────────────

export default async function SponsorsPage() {
  const { data: allSponsors } = await getSponsors();
  const activeSponsors = allSponsors.filter((s) => s.active !== false);

  const grouped = TIER_ORDER.reduce<Record<SponsorTier, DBSponsor[]>>(
    (acc, tier) => {
      acc[tier] = activeSponsors.filter((s) => safeTier(s.tier) === tier);
      return acc;
    },
    { platinum: [], silver: [], blue: [], pink: [] }
  );

  const hasAnySponsors = activeSponsors.length > 0;

  return (
    <PublicLayout>

      {/* ── A. HERO ──────────────────────────────── */}
      <section className="bg-[#FDFAF7] pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="max-w-3xl">
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#A56E52]">
              Sponsors &amp; Partners
            </span>
            <div className="mt-3 mb-8 h-px w-8 bg-[#A56E52]" />
            <h1 className="font-serif text-4xl font-normal leading-[1.1] text-[#2A2421] md:text-5xl lg:text-6xl">
              Una comunidad de marcas con propósito
            </h1>
            <p className="mt-6 max-w-2xl font-sans text-base leading-relaxed text-[#5B4638]">
              Nuestros patrocinadores no son vendedores — son aliados invertidos en construir algo
              que perdura. Compartimos audiencia, valores y la convicción de que la comunidad
              latina merece lo mejor.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button href="/contact" variant="primary" size="md">
                Convertirme en sponsor
              </Button>
              <Button href="#paquetes" variant="secondary" size="md">
                Ver paquetes
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-[#EAE1D6]" />

      {/* ── B. CURRENT SPONSORS ──────────────────── */}
      <section className="bg-[#FDFAF7] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">

          <div className="mb-16 flex flex-col gap-2">
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#A56E52]">
              Patrocinadores actuales
            </span>
            <div className="mt-1 h-px w-8 bg-[#A56E52]" />
            <h2 className="mt-4 font-serif text-3xl font-normal text-[#2A2421] md:text-4xl">
              Quienes nos acompañan
            </h2>
          </div>

          {hasAnySponsors ? (
            <div className="flex flex-col gap-16">
              {TIER_ORDER.map((tier) => {
                const sponsors = grouped[tier];
                if (sponsors.length === 0) return null;
                const { label, description, gridClass } = TIER_META[tier];

                return (
                  <div key={tier}>
                    {/* Tier header row */}
                    <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-10 border-t border-[#EAE1D6] pt-8">
                      <div className="shrink-0">
                        <TierPill tier={tier} />
                        <p className="mt-2 font-serif text-lg font-normal text-[#2A2421]">
                          {label}
                        </p>
                      </div>
                      <p className="max-w-md font-sans text-sm leading-relaxed text-[#5B4638] sm:text-right">
                        {description}
                      </p>
                    </div>

                    {/* Sponsor cards */}
                    <div className={`grid gap-4 ${gridClass}`}>
                      {sponsors.map((sponsor) => (
                        <SponsorCard key={sponsor.id} sponsor={sponsor} tier={tier} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty state */
            <div className="border border-dashed border-[#D7C6B2] px-8 py-20 text-center">
              <div className="mx-auto max-w-md">
                <p className="font-serif text-2xl font-normal text-[#2A2421]">
                  Sé el primero en asociarte
                </p>
                <p className="mt-4 font-sans text-sm leading-relaxed text-[#5B4638]">
                  Estamos construyendo una comunidad de marcas comprometidas con la cultura latina.
                  Los primeros en unirse tienen acceso a los mejores espacios y visibilidad.
                </p>
                <div className="mt-8">
                  <Button href="/contact" variant="primary" size="md">
                    Iniciar conversación
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── C. WHY PARTNER ──────────────────────── */}
      <section className="bg-[#EAE1D6] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="mb-14 flex flex-col gap-2">
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#A56E52]">
              Por qué asociarse
            </span>
            <div className="mt-1 h-px w-8 bg-[#A56E52]" />
            <h2 className="mt-4 max-w-lg font-serif text-3xl font-normal text-[#2A2421] md:text-4xl">
              Más que visibilidad.
            </h2>
            <p className="mt-3 max-w-xl font-sans text-sm leading-relaxed text-[#5B4638]">
              El patrocinio con ME Producciones es una inversión en comunidad, credibilidad
              y relevancia cultural.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
            {WHY_PARTNER.map((item, i) => (
              <div
                key={item.number}
                className={[
                  'flex flex-col gap-4 p-8 border-[#C4B09A]',
                  i % 2 === 0 ? 'md:border-r' : '',
                  i < 2 ? 'border-b' : '',
                  'border-t border-l border-r md:border-l-0 md:border-t-0 first:border-t',
                ].join(' ')}
              >
                <span className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#A56E52]">
                  {item.number}
                </span>
                <h3 className="font-serif text-xl font-normal text-[#2A2421]">{item.title}</h3>
                <p className="font-sans text-sm leading-relaxed text-[#5B4638]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── D. TIER PACKAGES ────────────────────── */}
      <section id="paquetes" className="bg-[#FDFAF7] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="mb-14 text-center flex flex-col items-center gap-2">
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#A56E52]">
              Paquetes de patrocinio
            </span>
            <div className="mt-1 h-px w-8 bg-[#A56E52]" />
            <h2 className="mt-4 font-serif text-3xl font-normal text-[#2A2421] md:text-4xl">
              Encuentra tu nivel.
            </h2>
            <p className="mt-3 max-w-xl font-sans text-sm leading-relaxed text-[#5B4638]">
              Cada nivel está diseñado para maximizar la presencia de tu marca mientras profundizas
              tu conexión con la comunidad.
            </p>
          </div>

          <SponsorPackagesSection />
        </div>
      </section>

      {/* ── E. CTA ──────────────────────────────── */}
      <section className="bg-[#2A2421] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#A56E52]">
              Construyamos juntos
            </span>
            <div className="mx-auto mt-3 mb-8 h-px w-8 bg-[#A56E52]" />
            <h2 className="mb-6 font-serif text-3xl font-normal leading-tight text-[#F7F3EE] md:text-4xl">
              Los acuerdos de patrocinio a medida están disponibles para marcas con objetivos únicos.
            </h2>
            <p className="mb-10 font-sans text-sm leading-relaxed text-[#D7C6B2]">
              Nuestro equipo trabajará contigo para diseñar una presencia que se sienta auténtica y
              entregue resultados reales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/contact" variant="terracotta" size="lg">
                Iniciar conversación
              </Button>
              <Link
                href="#paquetes"
                className="inline-flex items-center justify-center border border-[#5B4638] px-6 py-3 font-sans text-[11px] uppercase tracking-widest text-[#D7C6B2] hover:border-[#D7C6B2] hover:text-[#F7F3EE] transition-colors duration-200"
              >
                Ver paquetes
              </Link>
            </div>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
