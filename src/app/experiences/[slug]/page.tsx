import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PublicLayout from '@/components/layout/PublicLayout';
import Button from '@/components/ui/Button';
import { getExperienceBySlug } from '@/app/actions/experiences';
import { getLang } from '@/lib/i18n/getLang';

export const revalidate = 60;
export const dynamicParams = true;

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80';

export default async function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lang = await getLang();
  const { data: experience } = await getExperienceBySlug(slug);

  if (!experience) notFound();

  const categoryLabels: Record<string, string> =
    lang === 'en'
      ? { flagship: 'Flagship Experience', summit: 'Summit', wellness: 'Wellness', community: 'Community', branded: 'Brand Experience' }
      : { flagship: 'Experiencia Insignia', summit: 'Summit', wellness: 'Bienestar', community: 'Comunidad', branded: 'Experiencia de Marca' };

  const categoryLabel = categoryLabels[experience.category] ?? experience.category;

  return (
    <PublicLayout>
      {/* ── Back link ─────────────────────────── */}
      <div className="bg-[#FDFAF7] pt-28 pb-0 px-6">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/experiences"
            className="inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-widest text-[#A56E52] hover:text-[#5B4638] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            {lang === 'en' ? 'All experiences' : 'Todas las experiencias'}
          </Link>
        </div>
      </div>

      {/* ── Hero Image ────────────────────────── */}
      <section className="bg-[#FDFAF7] pt-8 pb-0 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="relative w-full aspect-[4/3] md:aspect-[16/9] overflow-hidden">
            <Image
              fill
              src={experience.image_url ?? FALLBACK_IMAGE}
              alt={experience.title}
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1152px"
              priority
              unoptimized={!!experience.image_url}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2A2421]/60 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* ── Content ───────────────────────────── */}
      <section className="bg-[#FDFAF7] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">

            {/* Main content */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              <div>
                <span className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#A56E52]">
                  {categoryLabel}
                </span>
                <div className="h-px w-8 bg-[#A56E52] mt-2 mb-6" />
                <h1 className="font-serif text-4xl md:text-5xl font-normal leading-tight text-[#2A2421]">
                  {lang === 'en' ? (experience.title_en ?? experience.title) : experience.title}
                </h1>
              </div>

              {experience.short_desc && (
                <p className="font-serif text-xl font-normal text-[#5B4638] leading-relaxed italic">
                  {lang === 'en' ? (experience.short_desc_en ?? experience.short_desc) : experience.short_desc}
                </p>
              )}

              {experience.description && (
                <div className="border-t border-[#EAE1D6] pt-8">
                  <p className="font-sans text-base leading-relaxed text-[#5B4638] whitespace-pre-line">
                    {lang === 'en' ? (experience.description_en ?? experience.description) : experience.description}
                  </p>
                </div>
              )}

              {experience.tags && experience.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-[#EAE1D6]">
                  {experience.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-sans text-[10px] uppercase tracking-widest text-[#5B4638] bg-[#EAE1D6] px-3 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar CTA */}
            <aside className="flex flex-col gap-8">
              <div className="bg-[#2A2421] p-8 flex flex-col gap-6">
                <div>
                  <span className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#A56E52]">
                    {lang === 'en' ? 'Interested?' : '¿Interesado?'}
                  </span>
                  <div className="h-px w-6 bg-[#A56E52] mt-2 mb-5" />
                  <h3 className="font-serif text-2xl font-normal text-[#F7F3EE] leading-snug">
                    {lang === 'en'
                      ? 'Let\'s create something together.'
                      : 'Creemos algo juntos.'}
                  </h3>
                </div>
                <p className="font-sans text-sm leading-relaxed text-[#D7C6B2]">
                  {lang === 'en'
                    ? 'Contact us to learn about availability, pricing, and how we can customize this experience for your community.'
                    : 'Contáctanos para conocer disponibilidad, precios y cómo podemos personalizar esta experiencia para tu comunidad.'}
                </p>
                <Button variant="terracotta" size="md" href="/contact">
                  {lang === 'en' ? 'Get in touch' : 'Contactar'}
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  href="/events"
                  className="border-[#5B4638] text-[#D7C6B2] hover:border-[#D7C6B2] hover:text-[#F7F3EE]"
                >
                  {lang === 'en' ? 'View upcoming events' : 'Ver próximos eventos'}
                </Button>
              </div>

              <div className="border border-[#EAE1D6] p-6 flex flex-col gap-3">
                <span className="font-sans text-[10px] font-medium uppercase tracking-widest text-[#A56E52]">
                  {lang === 'en' ? 'Category' : 'Categoría'}
                </span>
                <p className="font-sans text-sm text-[#2A2421]">{categoryLabel}</p>
              </div>
            </aside>

          </div>
        </div>
      </section>

      {/* ── Back CTA ──────────────────────────── */}
      <section className="bg-[#EAE1D6] py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-serif text-2xl font-normal text-[#2A2421]">
              {lang === 'en' ? 'Explore more experiences' : 'Explorar más experiencias'}
            </p>
            <p className="font-sans text-sm text-[#5B4638] mt-1">
              {lang === 'en'
                ? 'Discover all the ways ME Producciones creates transformation.'
                : 'Descubre todas las formas en que ME Producciones crea transformación.'}
            </p>
          </div>
          <Button variant="primary" size="md" href="/experiences">
            {lang === 'en' ? 'All experiences' : 'Todas las experiencias'}
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
