import PublicLayout from '@/components/layout/PublicLayout';
import GalleryGrid from '@/components/gallery/GalleryGrid';
import { galleryItems } from '@/lib/data';

export default function GalleryPage() {
  return (
    <PublicLayout>
      {/* ── Hero ─────────────────────────────────── */}
      <section className="bg-[#FDFAF7] pb-20 pt-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-end">
            <div>
              <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#A56E52]">
                Galeria
              </span>
              <div className="mt-2 h-px w-8 bg-[#A56E52]" />
              <h1
                className="mt-6 font-serif text-5xl font-normal leading-tight text-[#2A2421] md:text-6xl lg:text-7xl"

              >
                Momentos
                <br />
                que perduran.
              </h1>
            </div>
            <div className="pb-2">
              <p className="font-sans text-base leading-relaxed text-[#5B4638]">
                Every image here is a record of something real — a moment of connection, transformation, or beauty that took place inside a ME Latino Producciones experience. From backstage preparations to the full energy of a room alive with purpose, this gallery is our most honest story.
              </p>
              <p className="mt-4 font-sans text-sm leading-relaxed text-[#A56E52]">
                Browse by category or explore everything at once.
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
            <p className="font-serif text-2xl font-normal italic leading-relaxed text-[#2A2421]"

            >
              "We build spaces where the Latino story is told fully — with pride, complexity, and radical beauty."
            </p>
            <p className="mt-6 font-sans text-sm text-[#A56E52]">
              Mariana Rios Delgado — Founder, ME Latino Producciones
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
