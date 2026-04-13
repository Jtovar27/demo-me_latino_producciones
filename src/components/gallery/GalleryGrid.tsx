'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Video } from 'lucide-react';
import type { DBGalleryItem } from '@/types/supabase';

type GalleryCategory = 'backstage' | 'moments' | 'audience' | 'stage' | 'details';
type FilterTab = 'all' | GalleryCategory;

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'backstage', label: 'Backstage' },
  { key: 'moments', label: 'Momentos' },
  { key: 'audience', label: 'Audiencia' },
  { key: 'stage', label: 'Escenario' },
  { key: 'details', label: 'Detalles' },
];

const CATEGORY_LABELS: Record<GalleryCategory, string> = {
  backstage: 'Backstage',
  moments: 'Momentos',
  audience: 'Audiencia',
  stage: 'Escenario',
  details: 'Detalles',
};

// Background color variants for placeholder variety
const BG_VARIANTS = [
  'bg-[#D7C6B2]',
  'bg-[#EAE1D6]',
  'bg-stone-300',
  'bg-[#C4B09A]',
  'bg-[#BFA98E]',
  'bg-stone-200',
];

interface GalleryGridProps {
  galleryItems: DBGalleryItem[];
}

export default function GalleryGrid({ galleryItems }: GalleryGridProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filtered =
    activeTab === 'all'
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeTab);

  return (
    <div>
      {/* Filter tabs */}
      <div className="mb-12 flex flex-wrap gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={[
              'px-5 py-2.5 font-sans text-[11px] font-medium uppercase tracking-[0.18em] transition-all duration-200',
              activeTab === tab.key
                ? 'bg-[#2A2421] text-[#F7F3EE]'
                : 'bg-transparent text-[#5B4638] hover:bg-[#EAE1D6]',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Masonry grid using CSS columns */}
      <div
        className="transition-all duration-300"
        style={{
          columnCount: 'auto',
          columnWidth: '300px',
          columnGap: '16px',
        }}
      >
        {filtered.map((item, index) => {
          const bgClass = BG_VARIANTS[index % BG_VARIANTS.length];
          const catLabel = item.category
            ? (CATEGORY_LABELS[item.category as GalleryCategory] ?? item.category)
            : '';

          return (
            <div
              key={item.id}
              className="group relative mb-4 break-inside-avoid overflow-hidden"
            >
              {/* Image or Video */}
              <div className={`relative w-full overflow-hidden ${bgClass}`}>
                {item.media_type === 'video' ? (
                  <div className="aspect-video w-full flex flex-col items-center justify-center gap-2">
                    <Video size={32} className="text-[#A56E52]" />
                    <span className="font-sans text-[9px] uppercase tracking-widest text-[#5B4638]">Video</span>
                  </div>
                ) : (
                  <Image
                    src={item.public_url}
                    alt={item.alt ?? ''}
                    width={0}
                    height={0}
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="w-full h-auto block"
                    unoptimized
                  />
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 flex flex-col items-start justify-end bg-[#2A2421] p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-90">
                  {catLabel && (
                    <span className="mb-2 font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-[#A56E52]">
                      {catLabel}
                    </span>
                  )}
                  <p className="font-sans text-sm leading-snug text-[#F7F3EE]">
                    {item.alt ?? ''}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="font-sans text-sm text-[#5B4638]">
            No hay imágenes en esta categoría todavía.
          </p>
        </div>
      )}
    </div>
  );
}
