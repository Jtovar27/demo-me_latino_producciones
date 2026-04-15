'use client';

import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import type { DBHeroSlide } from '@/types/supabase';

interface HeroCarouselProps {
  slides: Pick<
    DBHeroSlide,
    | 'id'
    | 'image_url'
    | 'alt_es'
    | 'alt_en'
    | 'category_es'
    | 'category_en'
    | 'title_es'
    | 'title_en'
    | 'location'
    | 'cta_label_es'
    | 'cta_label_en'
    | 'cta_href'
  >[];
  lang?: 'es' | 'en';
}

// Fallback so the carousel never renders empty if no slides are seeded yet
const FALLBACK_SLIDE: HeroCarouselProps['slides'][number] = {
  id: 'fallback',
  image_url:
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80',
  alt_es: 'ME Producciones — evento en escenario',
  alt_en: 'ME Producciones — event on stage',
  category_es: 'Evento Insignia',
  category_en: 'Flagship Event',
  title_es: 'The Real Happiness',
  title_en: 'The Real Happiness',
  location: 'Miami, FL · 2026',
  cta_label_es: null,
  cta_label_en: null,
  cta_href: null,
};

const INTERVAL = 4500;

export default function HeroCarousel({ slides, lang = 'es' }: HeroCarouselProps) {
  const displaySlides = slides.length > 0 ? slides : [FALLBACK_SLIDE];
  const total = displaySlides.length;

  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advance = useCallback(() => {
    setCurrent((c) => (c + 1) % total);
  }, [total]);

  useEffect(() => {
    if (paused || total <= 1) return;
    timerRef.current = setTimeout(advance, INTERVAL);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, paused, advance, total]);

  const goTo = useCallback((i: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrent(i);
  }, []);

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {displaySlides.map((slide, i) => {
        const altText    = lang === 'en' ? slide.alt_en    : slide.alt_es;
        const category   = lang === 'en' ? slide.category_en : slide.category_es;
        const title      = lang === 'en' ? slide.title_en  : slide.title_es;
        const ctaLabel   = lang === 'en' ? slide.cta_label_en : slide.cta_label_es;

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            aria-hidden={i !== current}
          >
            <Image
              src={slide.image_url}
              alt={altText || title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority={i === 0}
              unoptimized={slide.image_url.startsWith('http')}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2A2421]/85 via-[#2A2421]/20 to-transparent" />

            {/* Slide caption */}
            <div className="absolute bottom-0 left-0 right-0 px-6 py-6 lg:px-8 lg:py-8">
              {category && (
                <span className="inline-block font-sans text-[9px] uppercase tracking-[0.25em] text-[#A56E52] border border-[#A56E52]/50 px-2 py-[3px] mb-3">
                  {category}
                </span>
              )}
              <p className="font-serif text-lg lg:text-xl text-[#EAE1D6] leading-snug">
                {title}
              </p>
              {slide.location && (
                <p className="font-sans text-[10px] uppercase tracking-widest text-[#B89E87] mt-1">
                  {slide.location}
                </p>
              )}
              {ctaLabel && slide.cta_href && (
                <a
                  href={slide.cta_href}
                  className="mt-3 inline-flex items-center gap-1.5 font-sans text-[9px] uppercase tracking-widest text-[#EAE1D6]/70 hover:text-[#EAE1D6] transition-colors duration-200"
                >
                  {ctaLabel}
                  <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                </a>
              )}
            </div>
          </div>
        );
      })}

      {/* Slide counter — top right */}
      <div className="absolute top-4 right-4 z-20 font-sans text-[10px] tabular-nums tracking-widest text-[#EAE1D6]/50 select-none pointer-events-none">
        {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>

      {/* Corner accent — top left */}
      <div className="absolute top-4 left-4 z-20 w-5 h-5 border-t border-l border-[#A56E52]/50 pointer-events-none" />

      {/* Dot indicators — bottom right */}
      {total > 1 && (
        <div className="absolute bottom-5 right-5 z-20 flex gap-1.5 items-center">
          {displaySlides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Ir a diapositiva ${i + 1}`}
              className={`transition-all duration-300 h-[2px] rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#A56E52] ${
                i === current
                  ? 'w-5 bg-[#A56E52]'
                  : 'w-2 bg-[#EAE1D6]/35 hover:bg-[#EAE1D6]/55'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
