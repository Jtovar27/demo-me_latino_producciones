'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import type { DBEvent } from '@/types/supabase';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// ── Ticket constants ──────────────────────────────────────────────
const WA_NUMBER = '13055252555';
const TICKET_LINK_1 = '#'; // TODO: reemplazar con link real
const TICKET_LINK_2 = '#'; // TODO: reemplazar con link real

// ── Types ────────────────────────────────────────

type EventCategory = 'flagship' | 'wellness' | 'summit' | 'community' | 'branded';
type EventStatus = 'upcoming' | 'sold-out' | 'past';
type CategoryFilter = 'all' | EventCategory;
type StatusFilter = 'all' | EventStatus;

interface EventsFilterProps {
  events: DBEvent[];
}

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
  return text.slice(0, max).trimEnd() + '\u2026';
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
  const { lang } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');
  const [visible, setVisible] = useState(true);
  const prevFilters = useRef({ category: selectedCategory, status: selectedStatus });

  // ── Ticket sheet state ────────────────────────────────────────
  const [ticketEvent, setTicketEvent] = useState<DBEvent | null>(null);
  const [ticketShow, setTicketShow] = useState(false);

  // Manage body scroll lock via effect
  useEffect(() => {
    if (ticketShow) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [ticketShow]);

  function openTickets(event: DBEvent) {
    setTicketEvent(event);
    requestAnimationFrame(() => requestAnimationFrame(() => setTicketShow(true)));
  }

  function closeTickets() {
    setTicketShow(false);
    setTimeout(() => setTicketEvent(null), 480);
  }

  // Animate grid on filter change
  useEffect(() => {
    const prev = prevFilters.current;
    if (prev.category !== selectedCategory || prev.status !== selectedStatus) {
      const hideTimer = setTimeout(() => setVisible(false), 0);
      const showTimer = setTimeout(() => {
        setVisible(true);
        prevFilters.current = { category: selectedCategory, status: selectedStatus };
      }, 150);
      return () => { clearTimeout(hideTimer); clearTimeout(showTimer); };
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

  // ── Translated constants ──────────────────────────────────────

  const categoryOptions: { value: CategoryFilter; label: string }[] = [
    { value: 'all',       label: lang === 'en' ? 'All'       : 'Todos' },
    { value: 'flagship',  label: 'Flagship' },
    { value: 'wellness',  label: 'Wellness' },
    { value: 'summit',    label: 'Summit' },
    { value: 'community', label: 'Community' },
    { value: 'branded',   label: 'Branded' },
  ];

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all',      label: lang === 'en' ? 'All'      : 'Todos' },
    { value: 'upcoming', label: lang === 'en' ? 'Upcoming' : 'Próximos' },
    { value: 'sold-out', label: lang === 'en' ? 'Sold Out' : 'Agotados' },
    { value: 'past',     label: lang === 'en' ? 'Past'     : 'Finalizados' },
  ];

  const categoryLabels: Record<EventCategory, string> = {
    flagship:  'Flagship',
    summit:    'Summit',
    wellness:  'Wellness',
    community: 'Community',
    branded:   'Branded',
  };

  const statusConfig: Record<EventStatus, { label: string; styles: string }> = {
    upcoming: {
      label: lang === 'en' ? 'Upcoming' : 'Próximo',
      styles: 'border-[#A56E52] text-[#A56E52] bg-transparent',
    },
    'sold-out': {
      label: lang === 'en' ? 'Sold Out' : 'Agotado',
      styles: 'border-[#2A2421] text-[#F7F3EE] bg-[#2A2421]',
    },
    past: {
      label: lang === 'en' ? 'Past' : 'Finalizado',
      styles: 'border-[#D7C6B2] text-[#5B4638] bg-transparent',
    },
  };

  return (
    <>
      {/* ── Filter bar ────────────────────────────── */}
      <div className="sticky top-0 z-10 border-b border-[#EAE1D6] bg-[#F7F3EE] px-6 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div className="flex flex-col gap-5 sm:flex-row sm:gap-8">
              {/* Category */}
              <div className="flex flex-col gap-2">
                <span className="font-sans text-[9px] font-medium uppercase tracking-widest text-[#A56E52]">
                  {lang === 'en' ? 'Category' : 'Categoría'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((opt) => (
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
                  {lang === 'en' ? 'Status' : 'Estado'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((opt) => (
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
              {filteredEvents.length === 1
                ? (lang === 'en' ? 'event' : 'evento')
                : (lang === 'en' ? 'events' : 'eventos')}
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
              <p className="font-serif text-xl font-normal text-[#2A2421]">
                {lang === 'en'
                  ? 'No events match the selected filters.'
                  : 'No hay eventos que coincidan con los filtros seleccionados.'}
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="border border-[#D7C6B2] px-5 py-2.5 font-sans text-[10px] font-medium uppercase tracking-widest text-[#5B4638] transition-all duration-150 hover:border-[#2A2421] hover:text-[#2A2421] cursor-pointer"
              >
                {lang === 'en' ? 'Clear filters' : 'Limpiar filtros'}
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
                const status = statusConfig[event.status as EventStatus] ?? statusConfig['past'];
                const catLabel = categoryLabels[event.category as EventCategory] ?? event.category;

                return (
                  <article
                    key={event.id}
                    className="flex flex-col border border-[#EAE1D6] bg-[#F7F3EE]"
                  >
                    {/* Event image */}
                    <div className="relative h-48 overflow-hidden bg-[#EAE1D6]">
                      {event.image_url ? (
                        <Image
                          src={event.image_url}
                          alt={event.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="font-serif text-3xl text-[#D7C6B2]">ME</span>
                        </div>
                      )}
                    </div>

                    {/* Date + badges row */}
                    <div className="flex items-stretch border-b border-[#EAE1D6]">
                      {/* Date block */}
                      <div className="flex min-w-[68px] flex-col items-center justify-center bg-[#2A2421] px-4 py-4">
                        <span className="font-serif text-3xl font-normal leading-none text-[#F7F3EE]">
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
                        <h3 className="mb-1.5 font-serif text-xl font-normal leading-snug text-[#2A2421]">
                          {event.title}
                        </h3>
                        <p className="font-sans text-[11px] font-medium uppercase tracking-wide text-[#A56E52]">
                          {event.city}, {event.state} &mdash; {event.venue}
                        </p>
                      </div>

                      <p className="font-sans text-sm leading-relaxed text-[#5B4638]">
                        {truncate(event.description ?? '', 100)}
                      </p>

                      {/* CTA buttons */}
                      <div className="mt-auto pt-2">
                        {event.status !== 'past' ? (
                          <button
                            onClick={() => openTickets(event)}
                            className="block w-full px-4 py-3 text-center font-sans text-[10px] font-semibold uppercase tracking-widest text-[#F7F3EE] bg-[#2A2421] hover:bg-[#5B4638] transition-colors"
                          >
                            {event.status === 'sold-out'
                              ? (lang === 'en' ? 'Waitlist' : 'Lista de espera')
                              : (lang === 'en' ? 'Buy Tickets' : 'Comprar Tickets')}
                          </button>
                        ) : (
                          <div className="w-full px-4 py-3 text-center font-sans text-[10px] uppercase tracking-widest text-[#5B4638] border border-[#D7C6B2]">
                            {lang === 'en' ? 'Past event' : 'Finalizado'}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

        </div>
      </div>

    {/* ── Ticket Sheet ─────────────────────────────────────────── */}
    {ticketEvent && (
      <div className="fixed inset-0 z-[200]" style={{ pointerEvents: ticketEvent ? 'auto' : 'none' }}>
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300"
          style={{ opacity: ticketShow ? 1 : 0 }}
          onClick={closeTickets}
          aria-hidden
        />

        {/* Sheet — bottom on mobile, floating card on desktop */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center sm:bottom-8 sm:px-4">
          <div
            className="relative w-full sm:max-w-[460px] bg-[#FDFAF7] shadow-2xl overflow-y-auto max-h-[88vh]"
            style={{
              transform: ticketShow ? 'translateY(0)' : 'translateY(110%)',
              transition: 'transform 0.48s cubic-bezier(0.32, 0.72, 0, 1)',
            }}
            role="dialog"
            aria-modal
            aria-label={`${lang === 'en' ? 'Tickets' : 'Tickets'}: ${ticketEvent.title}`}
          >
            {/* Drag handle — mobile only */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden" aria-hidden>
              <div className="h-1 w-10 rounded-full bg-[#D7C6B2]" />
            </div>

            {/* Close */}
            <button
              onClick={closeTickets}
              aria-label={lang === 'en' ? 'Close' : 'Cerrar'}
              className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#EAE1D6] hover:bg-[#D7C6B2] transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M1 1l9 9M10 1L1 10" stroke="#2A2421" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>

            {/* Header */}
            <div className="px-6 pt-6 pb-4 sm:px-7 border-b border-[#EAE1D6]">
              <p className="font-sans text-[9px] uppercase tracking-[0.22em] text-[#A56E52] mb-1">
                {ticketEvent.city}, {ticketEvent.state} &nbsp;·&nbsp; {ticketEvent.venue}
              </p>
              <h3 className="font-serif text-xl sm:text-2xl font-normal leading-snug text-[#2A2421] pr-8">
                {ticketEvent.title}
              </h3>
              <p className="font-sans text-xs text-[#5B4638] mt-1">
                {new Date(ticketEvent.date + 'T00:00:00').toLocaleDateString('es-US', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>

            {/* Ticket options */}
            <div className="px-6 py-5 sm:px-7">
              <p className="font-sans text-[9px] uppercase tracking-[0.22em] text-[#5B4638] mb-3">
                {ticketEvent.status === 'sold-out'
                  ? (lang === 'en' ? 'Waitlist' : 'Lista de espera')
                  : (lang === 'en' ? 'Select how to purchase' : 'Selecciona cómo comprar')}
              </p>

              <div className="flex flex-col gap-2.5">
                {/* Option 1 */}
                {TICKET_LINK_1 === '#' ? (
                  <div className="flex items-center gap-3 px-4 py-4 border border-[#EAE1D6] opacity-40">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#A56E52]/10 text-[#A56E52]">
                      <TicketSVG />
                    </span>
                    <div>
                      <p className="font-sans text-xs font-medium text-[#2A2421]">
                        {lang === 'en' ? 'Buy online — Option 1' : 'Comprar en línea — Opción 1'}
                        <span className="ml-2 text-[9px] uppercase tracking-widest text-[#A56E52]">
                          {lang === 'en' ? 'Coming soon' : 'Próximamente'}
                        </span>
                      </p>
                      <p className="font-sans text-[10px] text-[#5B4638]">
                        {lang === 'en' ? 'Credit card payment' : 'Pago con tarjeta de crédito'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <a href={TICKET_LINK_1} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-4 border border-[#D7C6B2] hover:border-[#A56E52] transition-colors group">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#A56E52]/10 text-[#A56E52]">
                      <TicketSVG />
                    </span>
                    <div className="flex-1">
                      <p className="font-sans text-xs font-medium text-[#2A2421]">
                        {lang === 'en' ? 'Buy online — Option 1' : 'Comprar en línea — Opción 1'}
                      </p>
                      <p className="font-sans text-[10px] text-[#5B4638]">
                        {lang === 'en' ? 'Credit card payment' : 'Pago con tarjeta de crédito'}
                      </p>
                    </div>
                    <ArrowSVG className="text-[#A56E52] shrink-0" />
                  </a>
                )}

                {/* Option 2 */}
                {TICKET_LINK_2 === '#' ? (
                  <div className="flex items-center gap-3 px-4 py-4 border border-[#EAE1D6] opacity-40">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#A56E52]/10 text-[#A56E52]">
                      <TicketSVG />
                    </span>
                    <div>
                      <p className="font-sans text-xs font-medium text-[#2A2421]">
                        {lang === 'en' ? 'Buy online — Option 2' : 'Comprar en línea — Opción 2'}
                        <span className="ml-2 text-[9px] uppercase tracking-widest text-[#A56E52]">
                          {lang === 'en' ? 'Coming soon' : 'Próximamente'}
                        </span>
                      </p>
                      <p className="font-sans text-[10px] text-[#5B4638]">
                        {lang === 'en' ? 'Alternative payment' : 'Pago alternativo'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <a href={TICKET_LINK_2} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-4 border border-[#D7C6B2] hover:border-[#A56E52] transition-colors group">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#A56E52]/10 text-[#A56E52]">
                      <TicketSVG />
                    </span>
                    <div className="flex-1">
                      <p className="font-sans text-xs font-medium text-[#2A2421]">
                        {lang === 'en' ? 'Buy online — Option 2' : 'Comprar en línea — Opción 2'}
                      </p>
                      <p className="font-sans text-[10px] text-[#5B4638]">
                        {lang === 'en' ? 'Alternative payment' : 'Pago alternativo'}
                      </p>
                    </div>
                    <ArrowSVG className="text-[#A56E52] shrink-0" />
                  </a>
                )}

                {/* Zelle via WhatsApp */}
                <a
                  href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
                    lang === 'en'
                      ? `Hi! I'm interested in buying tickets for "${ticketEvent.title}" on ${new Date(ticketEvent.date + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} in ${ticketEvent.city}, ${ticketEvent.state}. How can I pay with Zelle?`
                      : `Hola! Me interesa comprar tickets para "${ticketEvent.title}" el ${new Date(ticketEvent.date + 'T00:00:00').toLocaleDateString('es-US', { day: 'numeric', month: 'long', year: 'numeric' })} en ${ticketEvent.city}, ${ticketEvent.state}. ¿Cómo puedo pagar con Zelle?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-4 border border-[#25D366] bg-[#25D366]/5 hover:bg-[#25D366]/10 transition-colors group"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25D366]/20 text-[#25D366]">
                    <WhatsAppSVG />
                  </span>
                  <div className="flex-1">
                    <p className="font-sans text-xs font-medium text-[#2A2421]">
                      {lang === 'en' ? 'Pay with Zelle' : 'Pagar con Zelle'}
                    </p>
                    <p className="font-sans text-[10px] text-[#5B4638]">
                      {lang === 'en' ? 'Message us on WhatsApp' : 'Escríbenos por WhatsApp'}
                    </p>
                  </div>
                  <ArrowSVG className="text-[#25D366] shrink-0" />
                </a>
              </div>

              <button
                onClick={closeTickets}
                className="mt-5 w-full py-2.5 font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hover:text-[#2A2421] transition-colors"
              >
                {lang === 'en' ? 'Cancel' : 'Cancelar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
  );
}

// ── SVG helpers ───────────────────────────────────────────────────
function TicketSVG() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  );
}

function ArrowSVG({ className }: { className?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WhatsAppSVG() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
