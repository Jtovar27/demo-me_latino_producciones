'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { createClient } from '@/lib/supabase/client';

// ── Types ────────────────────────────────────────

type InquiryType =
  | ''
  | 'asistir'
  | 'patrocinio'
  | 'speaker'
  | 'produccion'
  | 'prensa'
  | 'otro';

interface FormState {
  name: string;
  email: string;
  phone: string;
  inquiryType: InquiryType;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  inquiryType?: string;
  message?: string;
}

// ── Options ──────────────────────────────────────

const INQUIRY_OPTIONS: { value: InquiryType; label: string }[] = [
  { value: '', label: 'Selecciona el tipo de consulta' },
  { value: 'asistir', label: 'Quiero asistir a un evento' },
  { value: 'patrocinio', label: 'Interés en patrocinio' },
  { value: 'speaker', label: 'Quiero ser speaker' },
  { value: 'produccion', label: 'Producción de evento a medida' },
  { value: 'prensa', label: 'Prensa y medios' },
  { value: 'otro', label: 'Otro' },
];

// ── Helpers ──────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form: FormState): FormErrors {
  const errs: FormErrors = {};
  if (!form.name.trim()) {
    errs.name = 'El nombre completo es requerido.';
  }
  if (!form.email.trim()) {
    errs.email = 'El correo electrónico es requerido.';
  } else if (!EMAIL_RE.test(form.email)) {
    errs.email = 'Ingresa una dirección de correo válida.';
  }
  if (!form.inquiryType) {
    errs.inquiryType = 'Selecciona el tipo de consulta.';
  }
  if (!form.message.trim()) {
    errs.message = 'El mensaje es requerido.';
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
      {error && (
        <p className="font-sans text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

const inputBase =
  'w-full border bg-[#FDFAF7] px-4 py-3.5 font-sans text-sm text-[#2A2421] placeholder-[#5B4638]/30 outline-none transition-colors duration-200 focus:border-[#2A2421] focus:ring-0';

function inputCls(error?: string): string {
  return [inputBase, error ? 'border-red-400 focus:border-red-500' : 'border-[#D7C6B2]'].join(' ');
}

// ── Main component ───────────────────────────────

export default function ContactForm() {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    inquiryType: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (name in errors) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: dbError } = await supabase.from('leads').insert({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        interest: form.inquiryType || null,
        message: form.message.trim(),
        source: 'website',
        status: 'new',
      });
      if (dbError) throw dbError;
      setSubmitted(true);
    } catch {
      setErrors({ message: 'Hubo un error al enviar tu mensaje. Intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  }

  // ── Success state ──────────────────────────────

  if (submitted) {
    return (
      <div className="flex flex-col gap-5 border border-[#A56E52] bg-[#F7F3EE] p-10">
        <div className="h-px w-8 bg-[#A56E52]" />
        <h3
          className="font-serif text-2xl font-normal text-[#2A2421]"

        >
          Gracias, recibimos tu mensaje.
        </h3>
        <p className="font-sans text-base leading-relaxed text-[#5B4638]">
          Nos pondremos en contacto en menos de 48 horas.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setForm({ name: '', email: '', phone: '', inquiryType: '', message: '' });
            setErrors({});
          }}
          className="mt-2 w-fit font-sans text-xs font-medium uppercase tracking-widest text-[#5B4638] underline underline-offset-4 transition-colors hover:text-[#A56E52]"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-7">

      {/* Name */}
      <FieldWrapper label="Nombre completo" required error={errors.name}>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Tu nombre completo"
          autoComplete="name"
          className={inputCls(errors.name)}
        />
      </FieldWrapper>

      {/* Email + Phone */}
      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
        <FieldWrapper label="Correo electrónico" required error={errors.email}>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="tú@ejemplo.com"
            autoComplete="email"
            className={inputCls(errors.email)}
          />
        </FieldWrapper>

        <FieldWrapper label="Teléfono (opcional)">
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+1 (305) 000-0000"
            autoComplete="tel"
            className={inputCls()}
          />
        </FieldWrapper>
      </div>

      {/* Inquiry type */}
      <FieldWrapper label="Tipo de consulta" required error={errors.inquiryType}>
        <div className="relative">
          <select
            name="inquiryType"
            value={form.inquiryType}
            onChange={handleChange}
            className={[
              inputCls(errors.inquiryType),
              'cursor-pointer appearance-none pr-10',
              form.inquiryType === '' ? 'text-[#5B4638]/30' : 'text-[#2A2421]',
            ].join(' ')}
          >
            {INQUIRY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
                {opt.label}
              </option>
            ))}
          </select>
          {/* Chevron icon */}
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
            <svg width="12" height="7" viewBox="0 0 12 7" fill="none" aria-hidden="true">
              <path
                d="M1 1L6 6L11 1"
                stroke="#5B4638"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </FieldWrapper>

      {/* Message */}
      <FieldWrapper label="Mensaje" required error={errors.message}>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={6}
          placeholder="Cuéntanos qué tienes en mente..."
          className={[inputCls(errors.message), 'resize-none'].join(' ')}
        />
      </FieldWrapper>

      {/* Submit */}
      <div className="flex items-center gap-6 pt-2">
        <button
          type="submit"
          disabled={loading}
          className={[
            'inline-flex items-center gap-2 bg-[#2A2421] px-8 py-4 font-sans text-xs font-medium uppercase tracking-widest text-[#F7F3EE] transition-all duration-200',
            loading
              ? 'cursor-not-allowed opacity-50'
              : 'hover:bg-[#5B4638] active:bg-[#2A2421]',
          ].join(' ')}
        >
          {loading ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Enviando...
            </>
          ) : (
            'Enviar mensaje'
          )}
        </button>
        <p className="font-sans text-xs text-[#A56E52]">* Campos requeridos</p>
      </div>

    </form>
  );
}
