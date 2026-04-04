'use client';

import { useState, useEffect, useRef, useCallback, Children } from 'react';

interface MobileCarouselProps {
  children: React.ReactNode;
  autoPlay?: boolean;
  interval?: number;
  /** Tailwind width class for each slide, e.g. "w-[82vw]" or "w-[42vw]" */
  itemWidth?: string;
}

export default function MobileCarousel({
  children,
  autoPlay = true,
  interval = 4000,
  itemWidth = 'w-[82vw]',
}: MobileCarouselProps) {
  const items = Children.toArray(children);
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const child = track.children[index] as HTMLElement;
    if (child) {
      track.scrollTo({ left: child.offsetLeft, behavior: 'smooth' });
    }
    setCurrent(index);
  }, []);

  // Auto-advance
  useEffect(() => {
    if (!autoPlay) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (pausedRef.current) return;
      const next = (current + 1) % items.length;
      goTo(next);
    }, interval);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, autoPlay, interval, items.length, goTo]);

  // Detect snap position after user scrolls
  const handleScroll = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    pausedRef.current = true;

    // Resume after 3s of inactivity
    const resumeTimer = setTimeout(() => {
      pausedRef.current = false;
      const track = trackRef.current;
      if (!track) return;
      const children = Array.from(track.children) as HTMLElement[];
      let closest = 0;
      let minDist = Infinity;
      children.forEach((child, i) => {
        const dist = Math.abs(child.offsetLeft - track.scrollLeft);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      setCurrent(closest);
    }, 500);

    return () => clearTimeout(resumeTimer);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="relative">
      {/* Track */}
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto gap-3"
        style={{
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch' as never,
        }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className={`shrink-0 ${itemWidth}`}
            style={{ scrollSnapAlign: 'start' }}
          >
            {item}
          </div>
        ))}
        {/* Trailing spacer so last card snaps flush */}
        <div className="shrink-0 w-4" aria-hidden />
      </div>

      {/* Dot indicators */}
      {items.length > 1 && (
        <div className="flex justify-center gap-1.5 pt-4">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                pausedRef.current = false;
                goTo(i);
              }}
              aria-label={`Ir a ${i + 1}`}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 bg-[#A56E52]'
                  : 'w-2 bg-[#D7C6B2] hover:bg-[#C4B09A]'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
