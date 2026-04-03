import PublicLayout from '@/components/layout/PublicLayout';
import SectionHeader from '@/components/ui/SectionHeader';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { sponsors, type SponsorTier } from '@/lib/data';

// ── Constants ───────────────────────────────────

const TIER_ORDER: SponsorTier[] = ['platinum', 'gold', 'silver', 'partner'];

const TIER_LABELS: Record<SponsorTier, string> = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  partner: 'Partner',
};

const TIER_DESCRIPTIONS: Record<SponsorTier, string> = {
  platinum:
    'Nuestros aliados más comprometidos — presentes en cada punto de contacto de la experiencia ME Latino.',
  gold: 'Socios integrales que amplifican nuestros eventos y valores compartidos a gran escala.',
  silver: 'Socios emergentes que aportan experiencia, alcance y comunidad.',
  partner:
    'Organizaciones alineadas con nuestra misión de celebración cultural e impacto colectivo.',
};

const WHY_PARTNER = [
  {
    number: '01',
    title: 'Alcance premium',
    description:
      'Acceso directo a más de 18,500 consumidores latinos premium — profesionales, fundadores, creativos y líderes comunitarios con alto poder adquisitivo e influencia.',
  },
  {
    number: '02',
    title: 'Alineación de marca',
    description:
      'La asociación con ME Latino Producciones comunica un compromiso genuino con la cultura latina. Nuestra comunidad reconoce y premia la alineación auténtica de marca.',
  },
  {
    number: '03',
    title: 'Presencia editorial',
    description:
      'Tu marca aparece en contenido de calidad editorial — antes, durante y después de cada evento — en redes sociales, email y nuestra creciente presencia en medios.',
  },
  {
    number: '04',
    title: 'Impacto medible',
    description:
      'Cada socio recibe un reporte de impacto post-evento: alcance, impresiones, sentimiento y retroalimentación cualitativa de la comunidad. Métricas claras, no suposiciones.',
  },
];

const TIER_PACKAGES = [
  {
    tier: 'platinum' as SponsorTier,
    price: '$25,000+',
    highlights: [
      'Presencia completa en todos los eventos de la temporada',
      'Tiempo en escena (introducción de keynote o segmento de marca)',
      'Espacio de activación exclusivo',
      'Logotipo en todo el material del evento',
      'Campaña digital co-brandada (redes + email)',
      'Acceso VIP para 10 personas (todos los eventos)',
      'Oportunidad de speaker o panel',
      'Reporte de impacto post-evento',
    ],
  },
  {
    tier: 'gold' as SponsorTier,
    price: '$10,000+',
    highlights: [
      'Patrocinador nombrado para un evento o track específico',
      'Señalización en escenario',
      'Stand o booth premium',
      '20 entradas de acceso general',
      'Co-promoción en redes sociales (3 publicaciones)',
      'Reporte de impacto post-evento',
    ],
  },
  {
    tier: 'silver' as SponsorTier,
    price: '$5,000+',
    highlights: [
      'Logotipo en programa del evento y materiales digitales',
      'Mención en redes sociales (1 publicación)',
      '10 entradas de acceso general',
      'Listado en directorio de patrocinadores',
    ],
  },
];

// ── Page ────────────────────────────────────────

export default function SponsorsPage() {
  const groupedSponsors = TIER_ORDER.reduce<Record<SponsorTier, typeof sponsors>>(
    (acc, tier) => {
      acc[tier] = sponsors.filter((s) => s.tier === tier);
      return acc;
    },
    { platinum: [], gold: [], silver: [], partner: [] }
  );

  return (
    <PublicLayout>

      {/* ── A. PAGE HERO ───────────────────────── */}
      <section className="bg-[#FDFAF7] py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="max-w-3xl">
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#A56E52]">
              Sponsors &amp; Partners
            </span>
            <div className="mt-2 mb-8 h-px w-8 bg-[#A56E52]" />
            <h1
              className="font-serif text-4xl font-normal leading-tight text-[#2A2421] md:text-5xl lg:text-6xl"

            >
              Una comunidad de marcas con propósito
            </h1>
            <p className="mt-6 max-w-xl font-sans text-base leading-relaxed text-[#5B4638]">
              Nuestros patrocinadores no son vendedores — son aliados invertidos en construir algo
              que perdura. Compartimos audiencia, valores y la convicción de que la comunidad
              latina merece lo mejor.
            </p>
          </div>
        </div>
      </section>

      {/* ── B. CURRENT SPONSORS ─────────────────── */}
      <section className="bg-[#FDFAF7] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <SectionHeader
            label="Patrocinadores actuales"
            title="Quienes nos acompañan"
            className="mb-20"
          />

          <div className="flex flex-col gap-20">
            {TIER_ORDER.map((tier) => {
              const tierSponsors = groupedSponsors[tier];
              if (tierSponsors.length === 0) return null;

              const isPlatinum = tier === 'platinum';
              const gridCols = isPlatinum
                ? 'grid-cols-1 sm:grid-cols-2'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

              return (
                <div key={tier}>
                  {/* Tier header */}
                  <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                    <Badge variant={tier} />
                    <p className="font-sans text-sm leading-relaxed text-[#5B4638]">
                      {TIER_DESCRIPTIONS[tier]}
                    </p>
                  </div>

                  {/* Sponsor cards */}
                  <div className={`grid gap-6 ${gridCols}`}>
                    {tierSponsors.map((sponsor) => (
                      <div
                        key={sponsor.id}
                        className={[
                          'flex flex-col gap-5 p-8',
                          isPlatinum
                            ? 'border border-[#2A2421] bg-[#FDFAF7]'
                            : 'border border-[#EAE1D6] bg-[#F7F3EE]',
                        ].join(' ')}
                      >
                        {/* Name as logo placeholder */}
                        <div className="flex h-14 items-center">
                          <p
                            className="font-serif text-xl font-normal text-[#2A2421]"

                          >
                            {sponsor.name}
                          </p>
                        </div>

                        <Badge variant={tier} />

                        <p className="font-sans text-sm leading-relaxed text-[#5B4638]">
                          {sponsor.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── C. WHY PARTNER ─────────────────────── */}
      <section className="bg-[#EAE1D6] py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <SectionHeader
            label="Por qué asociarse"
            title="Más que visibilidad."
            subtitle="El patrocinio con ME Latino Producciones es una inversión en comunidad, credibilidad y relevancia cultural."
            className="mb-16"
          />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {WHY_PARTNER.map((item) => (
              <div
                key={item.number}
                className="flex flex-col gap-4 border-t border-[#D7C6B2] pt-8"
              >
                <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#A56E52]">
                  {item.number}
                </span>
                <h3
                  className="font-serif text-xl font-normal text-[#2A2421]"

                >
                  {item.title}
                </h3>
                <p className="font-sans text-sm leading-relaxed text-[#5B4638]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── D. SPONSORSHIP TIERS ────────────────── */}
      <section className="bg-[#FDFAF7] py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <SectionHeader
            label="Paquetes de patrocinio"
            title="Encuentra tu nivel."
            subtitle="Cada nivel está diseñado para maximizar la presencia de tu marca mientras profundizas tu conexión con la comunidad."
            centered
            className="mb-16"
          />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {TIER_PACKAGES.map((pkg, i) => {
              const isDark = i === 0;
              return (
                <div
                  key={pkg.tier}
                  className={[
                    'flex flex-col gap-8 p-10',
                    isDark
                      ? 'bg-[#2A2421]'
                      : 'border border-[#EAE1D6] bg-[#FDFAF7]',
                  ].join(' ')}
                >
                  <div className="flex flex-col gap-2">
                    <Badge variant={pkg.tier} />
                    <p
                      className={[
                        'mt-4 font-serif text-3xl font-normal',
                        isDark ? 'text-[#F7F3EE]' : 'text-[#2A2421]',
                      ].join(' ')}

                    >
                      {pkg.price}
                    </p>
                    <p
                      className={[
                        'font-sans text-xs uppercase tracking-widest',
                        isDark ? 'text-[#D7C6B2]' : 'text-[#5B4638]',
                      ].join(' ')}
                    >
                      Inversión inicial
                    </p>
                  </div>

                  <ul className="flex flex-col gap-3">
                    {pkg.highlights.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-3">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#A56E52]" />
                        <span
                          className={[
                            'font-sans text-sm leading-relaxed',
                            isDark ? 'text-[#D7C6B2]' : 'text-[#5B4638]',
                          ].join(' ')}
                        >
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-4">
                    <Button
                      href="/contact"
                      variant={isDark ? 'terracotta' : 'secondary'}
                      size="md"
                      className="w-full justify-center"
                    >
                      Solicitar información — {TIER_LABELS[pkg.tier]}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── E. INQUIRY CTA ─────────────────────── */}
      <section className="bg-[#2A2421] py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#A56E52]">
              Construyamos juntos
            </span>
            <div className="mx-auto mt-2 mb-8 h-px w-8 bg-[#A56E52]" />
            <h2
              className="mb-6 font-serif text-3xl font-normal leading-tight text-[#F7F3EE] md:text-4xl"

            >
              Los acuerdos de patrocinio a medida están disponibles para marcas con objetivos
              únicos.
            </h2>
            <p className="mb-10 font-sans text-base leading-relaxed text-[#D7C6B2]">
              Nuestro equipo trabajará contigo para diseñar una presencia que se sienta auténtica
              y entregue resultados reales.
            </p>
            <Button href="/contact" variant="terracotta" size="lg">
              Iniciar conversación
            </Button>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
