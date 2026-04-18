'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Button from '@/components/ui/Button';
import type { DBFlagshipEvent, FlagshipVenue } from '@/types/supabase';

interface Props {
  events: DBFlagshipEvent[];
  lang: string;
}

export default function FlagshipCarousel({ events, lang }: Props) {
  const [current, setCurrent]   = useState(0);
  const [visible, setVisible]   = useState(true);
  const pausedRef               = useRef(false);
  const timerRef                = useRef<ReturnType<typeof setInterval> | null>(null);
  const total                   = events.length;

  const goTo = useCallback((next: number) => {
    if (next === current || total <= 1) return;
    setVisible(false);
    setTimeout(() => {
      setCurrent(next);
      setVisible(true);
    }, 220);
  }, [current, total]);

  const next = useCallback(() => goTo((current + 1) % total), [current, total, goTo]);
  const prev = useCallback(() => goTo((current - 1 + total) % total), [current, total, goTo]);

  useEffect(() => {
    if (total <= 1) return;
    timerRef.current = setInterval(() => {
      if (!pausedRef.current) {
        setVisible(false);
        setTimeout(() => {
          setCurrent(c => (c + 1) % total);
          setVisible(true);
        }, 220);
      }
    }, 7000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [total]);

  if (total === 0) return null;

  const event   = events[current];
  const venues  = (event.venues ?? []) as FlagshipVenue[];
  const desc    = lang === 'en' ? event.description_en : event.description_es;
  const isEn    = lang === 'en';

  return (
    <section
      className="bg-[#2A2421] py-12 md:py-20 lg:py-28"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex flex-col gap-10 md:gap-16">

          {/* Slide content — fades on transition */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transition: 'opacity 0.22s ease',
            }}
          >
            {/* Header row */}
            <div className="flex items-start justify-between gap-6">
              <div className="flex flex-col gap-3">
                <span className="font-sans text-[11px] font-medium uppercase tracking-[0.25em] text-[#A56E52]">
                  {isEn ? 'Flagship event · ME Producciones' : 'Evento insignia · ME Producciones'}
                </span>
                <div className="h-px w-8 bg-[#A56E52]" />
                <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-normal leading-tight text-[#EAE1D6] max-w-2xl">
                  {event.title}
                </h2>
                {desc && (
                  <p className="font-sans text-base leading-relaxed text-[#B89E87] max-w-xl mt-2">
                    {desc}
                  </p>
                )}
              </div>

              {/* Nav arrows — only when more than one event */}
              {total > 1 && (
                <div className="hidden sm:flex gap-2 shrink-0 pt-1">
                  <button
                    onClick={prev}
                    aria-label={isEn ? 'Previous event' : 'Evento anterior'}
                    className="h-10 w-10 border border-[#5B4638] text-[#A56E52] flex items-center justify-center hover:border-[#A56E52] hover:bg-[#A56E52]/10 transition-colors duration-200 font-sans text-sm"
                  >
                    ←
                  </button>
                  <button
                    onClick={next}
                    aria-label={isEn ? 'Next event' : 'Siguiente evento'}
                    className="h-10 w-10 border border-[#5B4638] text-[#A56E52] flex items-center justify-center hover:border-[#A56E52] hover:bg-[#A56E52]/10 transition-colors duration-200 font-sans text-sm"
                  >
                    →
                  </button>
                </div>
              )}
            </div>

            {/* Venue cards */}
            {venues.length > 0 && (
              <div className={`mt-10 md:mt-16 grid grid-cols-1 gap-px bg-[#3D342F] ${
                venues.length === 2 ? 'md:grid-cols-2' :
                venues.length >= 4 ? 'md:grid-cols-2 lg:grid-cols-4' :
                'md:grid-cols-3'
              }`}>
                {venues.map((venue, i) => {
                  const num  = String(i + 1).padStart(2, '0');
                  const date = isEn ? venue.date_en : venue.date_es;
                  const tag  = isEn ? venue.tag_en  : venue.tag_es;
                  return (
                    <div
                      key={i}
                      className="bg-[#2A2421] p-8 md:p-10 flex flex-col gap-5 group hover:bg-[#1A1410] transition-colors duration-300"
                    >
                      <span className="font-serif text-5xl font-normal text-[#A56E52] opacity-40 leading-none">
                        {num}
                      </span>
                      <div className="flex flex-col gap-1">
                        <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#A56E52]">
                          {tag}
                        </span>
                        <h3 className="font-serif text-3xl font-normal text-[#EAE1D6]">
                          {venue.city}
                        </h3>
                        <p className="font-sans text-sm text-[#B89E87]">{venue.region}</p>
                      </div>
                      <div className="h-px w-full bg-[#3D342F]" />
                      <p className="font-sans text-xs uppercase tracking-widest text-[#5B4638]">
                        {date}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer: CTA + dots */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Button href="/events" variant="terracotta" size="lg">
              {isEn ? 'View all events' : 'Ver todos los eventos'}
            </Button>

            {total > 1 && (
              <div className="flex items-center gap-2">
                {/* Mobile arrows */}
                <button
                  onClick={prev}
                  aria-label={isEn ? 'Previous' : 'Anterior'}
                  className="sm:hidden h-8 w-8 border border-[#5B4638] text-[#A56E52] flex items-center justify-center hover:border-[#A56E52] transition-colors text-xs"
                >
                  ←
                </button>

                {events.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    aria-label={`Evento ${i + 1}`}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === current
                        ? 'w-8 bg-[#A56E52]'
                        : 'w-2 bg-[#5B4638] hover:bg-[#A56E52]/50'
                    }`}
                  />
                ))}

                <button
                  onClick={next}
                  aria-label={isEn ? 'Next' : 'Siguiente'}
                  className="sm:hidden h-8 w-8 border border-[#5B4638] text-[#A56E52] flex items-center justify-center hover:border-[#A56E52] transition-colors text-xs"
                >
                  →
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
