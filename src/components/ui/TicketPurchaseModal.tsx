'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { submitBooking } from '@/app/actions/bookings';

const WA_NUMBER   = '13055252555';
const ZELLE_PHONE = '786-599-9520';
const ZELLE_LINK  = 'https://enroll.zellepay.com/qr-codes?data=eyJuYW1lIjoiTU9OSUNBIEVTUElOT1pBIiwidG9rZW4iOiI3ODY1OTk5NTIwIiwiYWN0aW9uIjoicGF5bWVudCJ9';

interface Props {
  eventTitle: string;
  eventDate: string;
  eventCity: string;
  eventState: string;
  eventPrice: number;
  onClose: () => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

function WhatsAppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function TicketPurchaseModal({
  eventTitle,
  eventDate,
  eventCity,
  eventState,
  eventPrice,
  onClose,
}: Props) {
  const [name, setName]   = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [qty, setQty]     = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone]   = useState(false);

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    setTimeout(() => firstInputRef.current?.focus(), 80);
    return () => { document.body.style.overflow = ''; };
  }, []);

  const total = eventPrice * qty;
  const isFree = eventPrice === 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim())  { setError('Por favor ingresa tu nombre completo.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Por favor ingresa un email válido.'); return; }
    if (!phone.trim()) { setError('Por favor ingresa tu teléfono.'); return; }

    setLoading(true);
    const fd = new FormData();
    fd.append('name',       name);
    fd.append('email',      email);
    fd.append('phone',      phone);
    fd.append('event_name', eventTitle);
    fd.append('guests',     String(qty));
    fd.append('message',    isFree ? `Asistencia gratuita · ${qty} persona(s)` : `${qty} ticket(s) · Total: $${total.toLocaleString('en-US')}`);

    const result = await submitBooking(fd);
    setLoading(false);

    if (result.error) { setError(result.error); return; }
    setDone(true);
  }

  const waConfirmMsg = encodeURIComponent(
    `Hola! Acabo de pagar por Zelle para "${eventTitle}" el ${formatDate(eventDate)} en ${eventCity}, ${eventState}.\n\nNombre: ${name}\nEmail: ${email}\nTeléfono: ${phone}\nTickets: ${qty}${!isFree ? `\nTotal pagado: $${total.toLocaleString('en-US')}` : ''}\n\nAdjunto la captura del pago. ✅`
  );
  const waConfirmUrl = `https://wa.me/${WA_NUMBER}?text=${waConfirmMsg}`;

  const labelCls = 'block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2';
  const inputCls = 'w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors';

  return (
    <>
      <div
        className="fixed inset-0 z-[300] bg-[#2A2421]/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Comprar tickets"
        className="fixed inset-x-0 bottom-0 z-[300] mx-auto max-w-lg sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full border border-[#EAE1D6] bg-[#FDFAF7] shadow-2xl rounded-t-lg sm:rounded-none overflow-y-auto max-h-[92vh]"
      >
        {/* Header */}
        <div className="border-b border-[#EAE1D6] px-6 py-5 flex items-start justify-between gap-4">
          <div>
            <span className="font-sans text-[9px] uppercase tracking-[0.25em] text-[#A56E52]">
              {eventCity}, {eventState}
            </span>
            <p className="mt-1 font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">
              {done ? 'Completa tu pago' : 'Comprar Tickets'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="shrink-0 font-sans text-[#5B4638] hover:text-[#2A2421] transition-colors text-xl leading-none p-1 mt-0.5"
          >
            ×
          </button>
        </div>

        {done ? (
          /* ── Paso 2: Instrucciones de pago ── */
          <div className="px-6 py-7 flex flex-col gap-5">
            {/* Confirmación */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-[#A56E52] flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A56E52" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-serif text-xl text-[#2A2421]">¡Reserva registrada!</p>
                <p className="font-sans text-xs text-[#5B4638]">
                  {isFree ? 'Solo confirma tu asistencia por WhatsApp' : 'Ahora completa tu pago por Zelle'}
                </p>
              </div>
            </div>

            {/* Resumen del pedido */}
            <div className="border border-[#EAE1D6] bg-[#F7F3EE] px-5 py-4 space-y-1">
              <p className="font-sans text-[9px] uppercase tracking-widest text-[#5B4638]">Resumen</p>
              <p className="font-sans text-sm text-[#2A2421] font-medium">{eventTitle}</p>
              <p className="font-sans text-xs text-[#5B4638]">{formatDate(eventDate)} · {eventCity}, {eventState}</p>
              <div className="pt-2 flex justify-between items-center">
                <span className="font-sans text-xs text-[#5B4638]">
                  {qty} ticket{qty > 1 ? 's' : ''}{isFree ? ' (entrada libre)' : ` × $${eventPrice.toLocaleString('en-US')}`}
                </span>
                {!isFree && (
                  <span className="font-sans text-sm font-semibold text-[#A56E52]">
                    Total: ${total.toLocaleString('en-US')}
                  </span>
                )}
              </div>
            </div>

            {!isFree && (
              /* Instrucciones de Zelle */
              <div className="border border-[#2A2421] bg-[#2A2421] px-5 py-5 space-y-4">
                <p className="font-sans text-[9px] uppercase tracking-widest text-[#D7C6B2]">Pago por Zelle</p>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="font-sans text-[10px] text-[#D7C6B2] mb-0.5">Enviar a</p>
                    <p className="font-serif text-2xl text-white">{ZELLE_PHONE}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-[10px] text-[#D7C6B2] mb-0.5">Monto exacto</p>
                    <p className="font-serif text-2xl text-[#A56E52]">${total.toLocaleString('en-US')}</p>
                  </div>
                </div>
                {ZELLE_LINK ? (
                  <a
                    href={ZELLE_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full border border-[#A56E52] bg-[#A56E52] px-6 py-3.5 font-sans text-[11px] uppercase tracking-widest text-white hover:bg-[#8B5A42] transition-colors"
                  >
                    Abrir Zelle y Pagar →
                  </a>
                ) : (
                  <p className="font-sans text-[10px] text-[#D7C6B2]/70">
                    Abre tu app de banco, selecciona Zelle y envía al número indicado.
                  </p>
                )}
              </div>
            )}

            {/* Envío de captura */}
            <div className="border border-[#EAE1D6] px-5 py-4 space-y-3">
              <div className="flex gap-3 items-start">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#A56E52] font-sans text-[10px] text-white font-bold">!</span>
                <div>
                  <p className="font-sans text-xs font-medium text-[#2A2421]">
                    {isFree ? 'Confirma tu asistencia' : 'Confirma tu pago'}
                  </p>
                  <p className="font-sans text-xs text-[#5B4638] leading-relaxed mt-1">
                    {isFree
                      ? 'Envíanos un mensaje por WhatsApp para confirmar tu lugar en el evento.'
                      : 'Luego de pagar, envía la captura de pantalla del pago al +1 (305) 525-2555 por WhatsApp para confirmar tu reserva.'}
                  </p>
                </div>
              </div>
              <a
                href={waConfirmUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full border border-[#25D366] bg-[#25D366] px-6 py-3.5 font-sans text-[11px] uppercase tracking-widest text-white hover:bg-[#1DA851] transition-colors"
              >
                <WhatsAppIcon />
                {isFree ? 'Confirmar por WhatsApp' : 'Enviar Captura por WhatsApp'}
              </a>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hover:text-[#2A2421] transition-colors"
            >
              Cerrar
            </button>
          </div>
        ) : (
          /* ── Paso 1: Formulario ── */
          <form onSubmit={handleSubmit} noValidate>
            <div className="px-6 py-6 space-y-4">
              {/* Evento */}
              <div className="border border-[#EAE1D6] bg-[#F7F3EE] px-4 py-3">
                <p className="font-sans text-[9px] uppercase tracking-widest text-[#5B4638]">Evento</p>
                <p className="font-sans text-sm text-[#2A2421] font-medium mt-0.5">{eventTitle}</p>
                <p className="font-sans text-[10px] text-[#5B4638] mt-0.5">
                  {formatDate(eventDate)} · {eventCity}, {eventState}
                </p>
              </div>

              <p className="font-sans text-xs leading-relaxed text-[#5B4638]">
                Ingresa tus datos para reservar
                {!isFree ? '. Luego te mostraremos cómo completar el pago por Zelle.' : '.'}
              </p>

              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Nombre completo <span className="text-[#A56E52]">*</span></label>
                  <input
                    ref={firstInputRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre completo"
                    className={inputCls}
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Email <span className="text-[#A56E52]">*</span></label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className={inputCls}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Teléfono <span className="text-[#A56E52]">*</span></label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (305) 000-0000"
                      className={inputCls}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Cantidad de tickets</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={qty}
                      onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className={inputCls}
                    />
                  </div>
                </div>

                {!isFree && (
                  <div className="flex justify-between items-center border-t border-[#EAE1D6] pt-3">
                    <span className="font-sans text-xs text-[#5B4638]">
                      {qty} ticket{qty > 1 ? 's' : ''} × ${eventPrice.toLocaleString('en-US')}
                    </span>
                    <span className="font-sans text-sm font-semibold text-[#A56E52]">
                      Total: ${total.toLocaleString('en-US')}
                    </span>
                  </div>
                )}
              </div>

              {error && (
                <p className="font-sans text-xs text-red-600 border border-red-200 bg-red-50 px-4 py-3">
                  {error}
                </p>
              )}
            </div>

            <div className="border-t border-[#EAE1D6] px-6 py-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="border border-[#D7C6B2] px-5 py-2.5 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="border border-[#A56E52] bg-[#A56E52] px-6 py-2.5 font-sans text-[9px] uppercase tracking-widest text-white hover:bg-[#8B5A42] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Procesando...' : isFree ? 'Reservar Lugar' : 'Continuar al Pago'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
