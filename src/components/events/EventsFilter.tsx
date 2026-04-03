'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import type { Event, EventCategory, EventStatus } from '@/lib/data';

// ── Types ────────────────────────────────────────

type CategoryFilter = 'all' | EventCategory;
type StatusFilter = 'all' | EventStatus;

interface EventsFilterProps {
  events: Event[];
}

// ── Filter options ───────────────────────────────

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'flagship', label: 'Flagship' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'summit', label: 'Summit' },
  { value: 'community', label: 'Community' },
  { value: 'branded', label: 'Branded' },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'upcoming', label: 'Próximos' },
  { value: 'sold-out', label: 'Agotados' },
  { value: 'past', label: 'Finalizados' },
];

// ── Badge configs ─────────────────────────────────

const CATEGORY_LABELS: Record<EventCategory, string> = {
  flagship: 'Flagship',
  summit: 'Summit',
  wellness: 'Wellness',
  community: 'Community',
  branded: 'Branded',
};

const STATUS_CONFIG: Record<EventStatus, { label: string; styles: string }> = {
  upcoming: {
    label: 'Próximo',
    styles: 'border-[#A56E52] text-[#A56E52] bg-transparent',
  },
  'sold-out': {
    label: 'Agotado',
    styles: 'border-[#2A2421] text-[#F7F3EE] bg-[#2A2421]',
  },
  past: {
    label: 'Finalizado',
    styles: 'border-[#D7C6B2] text-[#5B4638] bg-transparent',
  },
};

// ── Helpers ──────────────────────────────────────

function formatDate(dateStr: string): { day: string; month: string; year: number } {
  const date = new Date(dateStr + 'T00:00:00');
  return {
    day: date.getDate().toString().padStart(2, '0'),
    month: date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase(),
    year: date.getFullYear(),
  };
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + '…';
}

// ── Filter button ─────────────────────────────────

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'border px-3 py-1.5 font-sans text-[10px] font-medium uppercase tracking-widest transition-all duration-150 cursor-pointer',
        active
          ? 'bg-[#2A2421] text-[#F7F3EE] border-[#2A2421]'
          : 'bg-transparent text-[#5B4638] border-[#D7C6B2] hover:border-[#5B4638]',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

// ── Main component ────────────────────────────────

export default function EventsFilter({ events }: EventsFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');
  const [visible, setVisible] = useState(true);
  const prevFilters = useRef({ category: selectedCategory, status: selectedStatus });

  // Animate grid on filter change
  useEffect(() => {
    const prev = prevFilters.current;
    if (prev.category !== selectedCategory || prev.status !== selectedStatus) {
      setVisible(false);
      const timer = setTimeout(() => {
        setVisible(true);
        prevFilters.current = { category: selectedCategory, status: selectedStatus };
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [selectedCategory, selectedStatus]);

  const filteredEvents = events.filter((event) => {
    const catMatch = selectedCategory === 'all' || event.category === selectedCategory;
    const statusMatch = selectedStatus === 'all' || event.status === selectedStatus;
    return catMatch && statusMatch;
  });

  function resetFilters() {
    setSelectedCategory('all');
    setSelectedStatus('all');
  }

  return (
    <div>
      {/* ── Filter bar ────────────────────────────── */}
      <div className="sticky top-0 z-10 border-b border-[#EAE1D6] bg-[#F7F3EE] px-6 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div className="flex flex-col gap-5 sm:flex-row sm:gap-8">
              {/* Category */}
              <div className="flex flex-col gap-2">
                <span className="font-sans text-[9px] font-medium uppercase tracking-widest text-[#A56E52]">
                  Categoría
                </span>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map((opt) => (
                    <FilterButton
                      key={opt.value}
                      active={selectedCategory === opt.value}
                      onClick={() => setSelectedCategory(opt.value)}
                    >
                      {opt.label}
                    </FilterButton>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col gap-2">
                <span className="font-sans text-[9px] font-medium uppercase tracking-widest text-[#A56E52]">
                  Estado
                </span>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((opt) => (
                    <FilterButton
                      key={opt.value}
                      active={selectedStatus === opt.value}
                      onClick={() => setSelectedStatus(opt.value)}
                    >
                      {opt.label}
                    </FilterButton>
                  ))}
                </div>
              </div>
            </div>

            {/* Count */}
            <span className="font-sans text-xs text-[#5B4638]">
              {filteredEvents.length}{' '}
              {filteredEvents.length === 1 ? 'evento' : 'eventos'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Events grid ───────────────────────────── */}
      <div className="bg-[#FDFAF7] px-6 py-16">
        <div className="mx-auto max-w-7xl">

          {filteredEvents.length === 0 ? (
            /* ── Empty state ─────────────────── */
            <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
              <div className="h-px w-16 bg-[#D7C6B2]" />
              <p
                className="font-serif text-xl font-normal text-[#2A2421]"

              >
                No hay eventos que coincidan con los filtros seleccionados.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="border border-[#D7C6B2] px-5 py-2.5 font-sans text-[10px] font-medium uppercase tracking-widest text-[#5B4638] transition-all duration-150 hover:border-[#2A2421] hover:text-[#2A2421] cursor-pointer"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            /* ── Grid with opacity+translate transition ── */
            <div
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 transition-all duration-150"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(6px)',
              }}
            >
              {filteredEvents.map((event) => {
                const date = formatDate(event.date);
                const status = STATUS_CONFIG[event.status];
                const catLabel = CATEGORY_LABELS[event.category];

                return (
                  <article
                    key={event.id}
                    className="flex flex-col border border-[#EAE1D6] bg-[#F7F3EE]"
                  >
                    {/* Event image */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>

                    {/* Date + badges row */}
                    <div className="flex items-stretch border-b border-[#EAE1D6]">
                      {/* Date block */}
                      <div className="flex min-w-[68px] flex-col items-center justify-center bg-[#2A2421] px-4 py-4">
                        <span
                          className="font-serif text-3xl font-normal leading-none text-[#F7F3EE]"

                        >
                          {date.day}
                        </span>
                        <span className="mt-1 font-sans text-[9px] font-medium uppercase tracking-widest text-[#A56E52]">
                          {date.month}
                        </span>
                        <span className="font-sans text-[8px] text-[#D7C6B2]">
                          {date.year}
                        </span>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-1 flex-wrap items-center gap-2 px-4 py-3">
                        <span
                          className={[
                            'inline-block border px-2 py-0.5 font-sans text-[9px] font-medium uppercase tracking-widest',
                            status.styles,
                          ].join(' ')}
                        >
                          {status.label}
                        </span>
                        <span className="inline-block border border-[#EAE1D6] bg-transparent px-2 py-0.5 font-sans text-[9px] font-medium uppercase tracking-widest text-[#5B4638]">
                          {catLabel}
                        </span>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="flex flex-1 flex-col gap-4 p-6">
                      <div>
                        <h3
                          className="mb-1.5 font-serif text-xl font-normal leading-snug text-[#2A2421]"

                        >
                          {event.title}
                        </h3>
                        <p className="font-sans text-[11px] font-medium uppercase tracking-wide text-[#A56E52]">
                          {event.city}, {event.state} &mdash; {event.venue}
                        </p>
                      </div>

                      <p className="font-sans text-sm leading-relaxed text-[#5B4638]">
                        {truncate(event.description, 100)}
                      </p>

                      {/* Ver detalles — ghost full-width button */}
                      <div className="mt-auto pt-2">
                        <a
                          href={`/events/${event.slug}`}
                          className="block w-full border border-[#D7C6B2] bg-transparent px-4 py-3 text-center font-sans text-[10px] font-medium uppercase tracking-widest text-[#5B4638] transition-all duration-150 hover:border-[#2A2421] hover:text-[#2A2421]"
                        >
                          Ver detalles
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
