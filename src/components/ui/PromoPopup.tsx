'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// ── Configuración ── Reemplazar los links cuando estén disponibles
const WA_NUMBER = '13055252555';
const TICKET_LINK_1 = '#'; // TODO: Reemplazar con link real
const TICKET_LINK_2 = '#'; // TODO: Reemplazar con link real
const POPUP_SESSION_KEY = 'me_promo_v1';

interface FeaturedEvent {
  id: string;
  title: string;
  date: string;
  city: string;
  state: string;
  venue: string;
  image_url: string | null;
  price: number;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ── Icons ──────────────────────────────────────────────────────────
function TicketIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ── TicketRow ──────────────────────────────────────────────────────
function TicketRow({
  href,
  icon,
  label,
  sub,
  accentColor,
  disabled = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  sub: string;
  accentColor: string;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <div className="flex items-center gap-3 px-4 py-3.5 border border-[#EAE1D6] opacity-40 select-none">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
        >
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-sans text-xs font-medium text-[#2A2421] leading-snug">
            {label}
            <span className="ml-2 font-sans text-[9px] uppercase tracking-widest text-[#A56E52]">
              Próximamente
            </span>
          </p>
          <p className="font-sans text-[10px] text-[#5B4638]">{sub}</p>
        </div>
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-3.5 border border-[#D7C6B2] transition-all duration-150 hover:shadow-sm group"
      style={{ '--accent': accentColor } as React.CSSProperties}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors"
        style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
      >
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-sans text-xs font-medium text-[#2A2421] leading-snug">{label}</p>
        <p className="font-sans text-[10px] text-[#5B4638]">{sub}</p>
      </div>
      <span className="shrink-0 text-[#D7C6B2] group-hover:translate-x-0.5 transition-transform" style={{ color: accentColor }}>
        <ArrowIcon />
      </span>
    </a>
  );
}

// ── Main Component ─────────────────────────────────────────────────
export default function PromoPopup() {
  const [event, setEvent] = useState<FeaturedEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(POPUP_SESSION_KEY)) return;

    fetch('/api/featured-event')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: FeaturedEvent | null) => {
        if (!data) return;
        setEvent(data);
        setVisible(true);
        sessionStorage.setItem(POPUP_SESSION_KEY, '1');
        // Double rAF to ensure DOM is ready for CSS transition
        requestAnimationFrame(() =>
          requestAnimationFrame(() => setShow(true))
        );
      })
      .catch(() => {});
  }, []);

  function close() {
    setShow(false);
    setTimeout(() => setVisible(false), 480);
  }

  if (!visible || !event) return null;

  const waMessage = encodeURIComponent(
    `Hola! Me interesa comprar tickets para "${event.title}" el ${formatDate(event.date)} en ${event.city}, ${event.state}. ¿Cómo puedo pagar con Zelle?`
  );
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${waMessage}`;

  return (
    <div
      className="fixed inset-0 z-[200]"
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300"
        style={{ opacity: show ? 1 : 0 }}
        onClick={close}
        aria-hidden
      />

      {/* Sheet — full width bottom on mobile · floating card on desktop */}
      <div className="absolute inset-x-0 bottom-0 flex justify-center sm:bottom-8 sm:px-4">
        <div
          className="relative w-full sm:max-w-[460px] bg-[#FDFAF7] shadow-2xl overflow-hidden overflow-y-auto max-h-[92vh]"
          style={{
            transform: show ? 'translateY(0)' : 'translateY(110%)',
            transition: 'transform 0.48s cubic-bezier(0.32, 0.72, 0, 1)',
          }}
          role="dialog"
          aria-modal
          aria-label={`Evento destacado: ${event.title}`}
        >
          {/* Drag handle visible only on mobile */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden" aria-hidden>
            <div className="h-1 w-10 rounded-full bg-[#D7C6B2]" />
          </div>

          {/* Close button */}
          <button
            onClick={close}
            aria-label="Cerrar"
            className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>

          {/* Hero image */}
          <div className="relative h-52 sm:h-60 shrink-0 bg-[#2A2421] overflow-hidden">
            {event.image_url ? (
              <Image
                src={event.image_url}
                alt={event.title}
                fill
                className="object-cover opacity-80"
                sizes="(max-width: 640px) 100vw, 460px"
                priority
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(135deg, #D91B94 0%, #7B1578 100%)' }}
              />
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2A2421]/80 via-[#2A2421]/10 to-transparent" />

            {/* "Evento Destacado" badge */}
            <div className="absolute bottom-4 left-5">
              <span
                className="font-sans text-[9px] font-semibold uppercase tracking-[0.22em] text-white px-3 py-1.5"
                style={{ background: 'linear-gradient(90deg, #D91B94, #9B157A)' }}
              >
                Evento Destacado
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 py-5 sm:px-7 sm:py-6">
            <p className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52] mb-1.5">
              {event.city}, {event.state}
            </p>
            <h2 className="font-serif text-[1.6rem] sm:text-[1.75rem] font-normal leading-snug text-[#2A2421] mb-1">
              {event.title}
            </h2>
            <p className="font-sans text-[11px] text-[#5B4638]">
              {formatDate(event.date)} &nbsp;·&nbsp; {event.venue}
            </p>
            {event.price > 0 && (
              <p
                className="font-sans text-sm font-semibold mt-1.5"
                style={{ color: '#D91B94' }}
              >
                Desde ${event.price.toLocaleString('en-US')}
              </p>
            )}

            {/* Divider */}
            <div className="mt-5 pt-5 border-t border-[#EAE1D6]">
              <p className="font-sans text-[9px] uppercase tracking-[0.22em] text-[#5B4638] mb-3">
                Comprar tickets
              </p>

              <div className="flex flex-col gap-2">
                <TicketRow
                  href={TICKET_LINK_1}
                  icon={<TicketIcon />}
                  label="Comprar en línea — Opción 1"
                  sub="Pago con tarjeta de crédito"
                  accentColor="#D91B94"
                  disabled={TICKET_LINK_1 === '#'}
                />
                <TicketRow
                  href={TICKET_LINK_2}
                  icon={<TicketIcon />}
                  label="Comprar en línea — Opción 2"
                  sub="Pago alternativo"
                  accentColor="#D91B94"
                  disabled={TICKET_LINK_2 === '#'}
                />
                <TicketRow
                  href={waUrl}
                  icon={<WhatsAppIcon />}
                  label="Pagar con Zelle"
                  sub="Escríbenos por WhatsApp"
                  accentColor="#25D366"
                />
              </div>
            </div>

            <button
              onClick={close}
              className="mt-5 w-full py-2.5 font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hover:text-[#2A2421] transition-colors"
            >
              Ver más tarde
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
