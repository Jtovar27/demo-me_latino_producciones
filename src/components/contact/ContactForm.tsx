'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { submitBooking } from '@/app/actions/bookings';
import { submitContact } from '@/app/actions/leads';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type UpcomingEvent = { id: string; title: string; date: string; city: string; venue: string };

// ── Types ────────────────────────────────────────

type InquiryType =
  | ''
  | 'reservar'
  | 'asistir'
  | 'patrocinio'
  | 'speaker'
  | 'produccion'
  | 'prensa'
  | 'otro';

interface FormState {
  name:        string;
  email:       string;
  phone:       string;
  inquiryType: InquiryType;
  message:     string;
  event_name:  string;
  guests:      string;
}

interface FormErrors {
  name?:        string;
  email?:       string;
  inquiryType?: string;
  message?:     string;
  event_name?:  string;
  guests?:      string;
}

// ── Helpers ──────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form: FormState, lang: 'es' | 'en'): FormErrors {
  const errs: FormErrors = {};
  if (!form.name.trim())  errs.name = lang === 'en' ? 'Full name is required.' : 'El nombre completo es requerido.';
  if (!form.email.trim()) errs.email = lang === 'en' ? 'Email address is required.' : 'El correo electrónico es requerido.';
  else if (!EMAIL_RE.test(form.email)) errs.email = lang === 'en' ? 'Enter a valid email address.' : 'Ingresa una dirección de correo válida.';
  if (!form.inquiryType)  errs.inquiryType = lang === 'en' ? 'Select the inquiry type.' : 'Selecciona el tipo de consulta.';
  if (!form.message.trim()) errs.message = lang === 'en' ? 'Message is required.' : 'El mensaje es requerido.';

  if (form.inquiryType === 'reservar') {
    if (!form.event_name.trim()) errs.event_name = lang === 'en' ? 'Indicate the event name.' : 'Indica el nombre del evento.';
    const g = parseInt(form.guests, 10);
    if (!form.guests || isNaN(g) || g < 1) errs.guests = lang === 'en' ? 'Indicate the number of people.' : 'Indica el número de personas.';
  }

  return errs;
}

// ── Sub-components ───────────────────────────────

function FieldWrapper({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-sans text-[11px] font-medium uppercase tracking-widest text-[#5B4638]">
        {label}
        {required && <span className="ml-1 text-[#A56E52]">*</span>}
      </label>
      {children}
      {error && <p className="font-sans text-xs text-red-600">{error}</p>}
    </div>
  );
}

const inputBase =
  'w-full border bg-[#FDFAF7] px-4 py-3.5 font-sans text-sm text-[#2A2421] placeholder-[#5B4638]/30 outline-none transition-colors duration-200 focus:border-[#2A2421] focus:ring-0';

function inputCls(error?: string): string {
  return [inputBase, error ? 'border-red-400 focus:border-red-500' : 'border-[#D7C6B2]'].join(' ');
}

// ── Main component ───────────────────────────────

const EMPTY_FORM: FormState = {
  name: '', email: '', phone: '', inquiryType: '',
  message: '', event_name: '', guests: '',
};

export default function ContactForm({ upcomingEvents = [] }: { upcomingEvents?: UpcomingEvent[] }) {
  const { lang } = useLanguage();
  const [form,      setForm]      = useState<FormState>(EMPTY_FORM);
  const [errors,    setErrors]    = useState<FormErrors>({});
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isBooking = form.inquiryType === 'reservar';

  const inquiryOptions: { value: InquiryType; label: string }[] = lang === 'en'
    ? [
        { value: '',           label: 'Select inquiry type' },
        { value: 'reservar',   label: 'I want to make a reservation' },
        { value: 'asistir',    label: 'I want to attend an event' },
        { value: 'patrocinio', label: 'Interest in sponsorship' },
        { value: 'speaker',    label: 'I want to be a speaker' },
        { value: 'produccion', label: 'Custom event production' },
        { value: 'prensa',     label: 'Press and media' },
        { value: 'otro',       label: 'Other' },
      ]
    : [
        { value: '',           label: 'Selecciona el tipo de consulta' },
        { value: 'reservar',   label: 'Quiero hacer una reserva' },
        { value: 'asistir',    label: 'Quiero asistir a un evento' },
        { value: 'patrocinio', label: 'Interés en patrocinio' },
        { value: 'speaker',    label: 'Quiero ser speaker' },
        { value: 'produccion', label: 'Producción de evento a medida' },
        { value: 'prensa',     label: 'Prensa y medios' },
        { value: 'otro',       label: 'Otro' },
      ];

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name in errors) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate(form, lang);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      if (isBooking) {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        const res = await submitBooking(fd);
        if (res.error) throw new Error(res.error);
      } else {
        const fd = new FormData();
        fd.append('name',        form.name.trim());
        fd.append('email',       form.email.trim().toLowerCase());
        fd.append('phone',       form.phone.trim());
        fd.append('inquiryType', form.inquiryType);
        fd.append('message',     form.message.trim());
        const res = await submitContact(fd);
        if (res.error) throw new Error(res.error);
      }
      setSubmitted(true);
    } catch {
      setErrors({ message: lang === 'en' ? 'There was an error sending your message. Please try again.' : 'Hubo un error al enviar tu mensaje. Intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  }

  // ── Success ──────────────────────────────────────

  if (submitted) {
    return (
      <div className="flex flex-col gap-5 border border-[#A56E52] bg-[#F7F3EE] p-10">
        <div className="h-px w-8 bg-[#A56E52]" />
        <h3 className="font-serif text-2xl font-normal text-[#2A2421]">
          {isBooking
            ? (lang === 'en' ? 'Reservation received.' : 'Reserva recibida.')
            : (lang === 'en' ? 'Thank you, we received your message.' : 'Gracias, recibimos tu mensaje.')}
        </h3>
        <p className="font-sans text-base leading-relaxed text-[#5B4638]">
          {isBooking
            ? (lang === 'en' ? 'Your reservation request was sent. We will be in touch to confirm the details.' : 'Tu solicitud de reserva fue enviada. Nos pondremos en contacto para confirmar los detalles.')
            : (lang === 'en' ? 'We will be in touch within 48 hours.' : 'Nos pondremos en contacto en menos de 48 horas.')}
        </p>
        <button
          type="button"
          onClick={() => { setSubmitted(false); setForm(EMPTY_FORM); setErrors({}); }}
          className="mt-2 w-fit font-sans text-xs font-medium uppercase tracking-widest text-[#5B4638] underline underline-offset-4 transition-colors hover:text-[#A56E52]"
        >
          {lang === 'en' ? 'Send another message' : 'Enviar otro mensaje'}
        </button>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-7">

      {/* Name */}
      <FieldWrapper label={lang === 'en' ? 'Full name' : 'Nombre completo'} required error={errors.name}>
        <input
          type="text" name="name" value={form.name}
          onChange={handleChange} placeholder={lang === 'en' ? 'Your full name' : 'Tu nombre completo'}
          autoComplete="name" className={inputCls(errors.name)}
        />
      </FieldWrapper>

      {/* Email + Phone */}
      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
        <FieldWrapper label={lang === 'en' ? 'Email address' : 'Correo electrónico'} required error={errors.email}>
          <input
            type="email" name="email" value={form.email}
            onChange={handleChange} placeholder={lang === 'en' ? 'you@example.com' : 'tú@ejemplo.com'}
            autoComplete="email" className={inputCls(errors.email)}
          />
        </FieldWrapper>
        <FieldWrapper label={lang === 'en' ? 'Phone (optional)' : 'Teléfono (opcional)'}>
          <input
            type="tel" name="phone" value={form.phone}
            onChange={handleChange} placeholder="+1 (305) 000-0000"
            autoComplete="tel" className={inputCls()}
          />
        </FieldWrapper>
      </div>

      {/* Inquiry type */}
      <FieldWrapper label={lang === 'en' ? 'Inquiry type' : 'Tipo de consulta'} required error={errors.inquiryType}>
        <div className="relative">
          <select
            name="inquiryType" value={form.inquiryType} onChange={handleChange}
            className={[
              inputCls(errors.inquiryType),
              'cursor-pointer appearance-none pr-10',
              form.inquiryType === '' ? 'text-[#5B4638]/30' : 'text-[#2A2421]',
            ].join(' ')}
          >
            {inquiryOptions.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
            <svg width="12" height="7" viewBox="0 0 12 7" fill="none" aria-hidden="true">
              <path d="M1 1L6 6L11 1" stroke="#5B4638" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </FieldWrapper>

      {/* ── Booking-only fields ─────────────────── */}
      {isBooking && (
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 border-l-2 border-[#A56E52] pl-5">
          <FieldWrapper label={lang === 'en' ? 'Event' : 'Evento'} required error={errors.event_name}>
            <div className="relative">
              <select
                name="event_name"
                value={form.event_name}
                onChange={handleChange}
                className={[
                  inputCls(errors.event_name),
                  'cursor-pointer appearance-none pr-10',
                  form.event_name === '' ? 'text-[#5B4638]/30' : 'text-[#2A2421]',
                ].join(' ')}
              >
                <option value="" disabled>{lang === 'en' ? 'Select an event' : 'Selecciona un evento'}</option>
                {upcomingEvents.length === 0 && (
                  <option value="" disabled>{lang === 'en' ? 'No events available' : 'No hay eventos disponibles'}</option>
                )}
                {upcomingEvents.map((ev) => {
                  const date = new Date(ev.date + 'T00:00:00').toLocaleDateString('es-US', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  });
                  return (
                    <option key={ev.id} value={ev.title}>
                      {ev.title} — {date} · {ev.city}
                    </option>
                  );
                })}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                <svg width="12" height="7" viewBox="0 0 12 7" fill="none" aria-hidden="true">
                  <path d="M1 1L6 6L11 1" stroke="#5B4638" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </FieldWrapper>
          <FieldWrapper label={lang === 'en' ? 'Number of guests' : 'Número de personas'} required error={errors.guests}>
            <input
              type="number" name="guests" value={form.guests}
              onChange={handleChange} placeholder="1" min="1"
              className={inputCls(errors.guests)}
            />
          </FieldWrapper>
        </div>
      )}

      {/* Message */}
      <FieldWrapper
        label={isBooking
          ? (lang === 'en' ? 'Additional notes (optional)' : 'Notas adicionales (opcional)')
          : (lang === 'en' ? 'Message' : 'Mensaje')}
        required={!isBooking}
        error={errors.message}
      >
        <textarea
          name="message" value={form.message} onChange={handleChange}
          rows={6}
          placeholder={isBooking
            ? (lang === 'en' ? 'Any special details, dietary restrictions, etc.' : 'Algún detalle especial, restricciones dietéticas, etc.')
            : (lang === 'en' ? 'Tell us what you have in mind...' : 'Cuéntanos qué tienes en mente...')}
          className={[inputCls(errors.message), 'resize-none'].join(' ')}
        />
      </FieldWrapper>

      {/* Submit */}
      <div className="flex items-center gap-6 pt-2">
        <button
          type="submit" disabled={loading}
          className={[
            'inline-flex items-center gap-2 px-8 py-4 font-sans text-xs font-medium uppercase tracking-widest text-[#F7F3EE] transition-all duration-200',
            isBooking ? 'bg-[#A56E52] hover:bg-[#5B4638]' : 'bg-[#2A2421] hover:bg-[#5B4638]',
            loading ? 'cursor-not-allowed opacity-50' : '',
          ].join(' ')}
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {lang === 'en' ? 'Sending...' : 'Enviando...'}
            </>
          ) : isBooking
            ? (lang === 'en' ? 'Request reservation' : 'Solicitar reserva')
            : (lang === 'en' ? 'Send message' : 'Enviar mensaje')}
        </button>
        <p className="font-sans text-xs text-[#A56E52]">* {lang === 'en' ? 'Required fields' : 'Campos requeridos'}</p>
      </div>

    </form>
  );
}
