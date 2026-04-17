import PublicLayout from '@/components/layout/PublicLayout';
import GalleryGrid from '@/components/gallery/GalleryGrid';
import { getGalleryItems } from '@/app/actions/gallery';
import { getLang } from '@/lib/i18n/getLang';

export const revalidate = 60;

export default async function GalleryPage() {
  const lang = await getLang();
  const { data: galleryItems } = await getGalleryItems();

  return (
    <PublicLayout>
      {/* ── Hero ─────────────────────────────────── */}
      <section className="bg-[#FDFAF7] pb-20 pt-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-end">
            <div>
              <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#A56E52]">
                {lang === 'en' ? 'Gallery' : 'Galería'}
              </span>
              <div className="mt-2 h-px w-8 bg-[#A56E52]" />
              <h1
                className="mt-6 font-serif text-5xl font-normal leading-tight text-[#2A2421] md:text-6xl lg:text-7xl"
              >
                {lang === 'en' ? (
                  <>
                    Moments<br />that endure.
                  </>
                ) : (
                  <>
                    Momentos<br />que perduran.
                  </>
                )}
              </h1>
            </div>
            <div className="pb-2">
              <p className="font-sans text-base leading-relaxed text-[#5B4638]">
                {lang === 'en'
                  ? 'Each image here is the record of something real — a moment of connection, transformation, or beauty that occurred within a ME Producciones experience. From backstage preparations to the full energy of a room alive with purpose, this gallery is our most honest story.'
                  : 'Cada imagen aquí es el registro de algo real — un momento de conexión, transformación o belleza que ocurrió dentro de una experiencia de ME Producciones. Desde los preparativos tras bambalinas hasta la energía plena de una sala viva de propósito, esta galería es nuestra historia más honesta.'}
              </p>
              <p className="mt-4 font-sans text-sm leading-relaxed text-[#A56E52]">
                {lang === 'en'
                  ? 'Browse by category or see everything at once.'
                  : 'Explora por categoría o ve todo de una vez.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Thin divider ─────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="h-px bg-[#EAE1D6]" />
      </div>

      {/* ── Gallery Grid ─────────────────────────── */}
      <section className="bg-[#FDFAF7] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <GalleryGrid galleryItems={galleryItems} />
        </div>
      </section>

      {/* ── Closing note ─────────────────────────── */}
      <section className="bg-[#EAE1D6] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-serif text-2xl font-normal italic leading-relaxed text-[#2A2421]">
              {lang === 'en'
                ? '\u201cWe build spaces where the Latino story is told fully\u00a0\u2014 with pride, complexity, and radical beauty.\u201d'
                : '\u201cConstruimos espacios donde la historia latina se cuenta plenamente\u00a0\u2014 con orgullo, complejidad y belleza radical.\u201d'}
            </p>
            <p className="mt-6 font-sans text-sm text-[#A56E52]">
              ME Producciones
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
