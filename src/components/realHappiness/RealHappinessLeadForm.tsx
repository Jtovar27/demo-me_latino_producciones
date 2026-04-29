'use client';

import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react';
import { submitContact } from '@/app/actions/leads';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type Interest = 'sponsor' | 'speaker' | 'attendee' | 'general';
type SponsorPackage = '' | 'exclusive' | 'platinum' | 'silver' | 'blue' | 'pink' | 'speaker_package';

interface FormState {
  name: string;
  email: string;
  phone: string;
  company: string;
  interest: Interest;
  sponsorPackage: SponsorPackage;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL: FormState = {
  name: '',
  email: '',
  phone: '',
  company: '',
  interest: 'general',
  sponsorPackage: '',
  message: '',
};

function captureUtm(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid']) {
    const v = params.get(k);
    if (v) out[k] = v;
  }
  return out;
}

export default function RealHappinessLeadForm() {
  const { lang } = useLanguage();
  const [form, setForm]           = useState<FormState>(INITIAL);
  const [errors, setErrors]       = useState<FormErrors>({});
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverErr, setServerErr] = useState('');
  const [utm, setUtm]             = useState<Record<string, string>>({});

  useEffect(() => {
    setUtm(captureUtm());
  }, []);

  const labels = lang === 'en'
    ? {
        eyebrow: 'Get more information',
        title: 'Be part of The Real Happiness Experience.',
        sub: 'Tell us how you would like to participate. Our team will reply within 48 business hours.',
        name: 'Full name',
        namePh: 'Your full name',
        email: 'Email',
        emailPh: 'you@example.com',
        phone: 'Phone (optional)',
        phonePh: '+1 (305) 000-0000',
        company: 'Company / brand (optional)',
        companyPh: 'Your company',
        interest: 'I am interested as',
        attendee: 'Attendee',
        sponsor: 'Sponsor / brand',
        speaker: 'Speaker',
        general: 'General inquiry',
        sponsorPkg: 'Sponsor package (optional)',
        sponsorPkgChoose: 'Select a package',
        speakerPkg: 'Speaker / sponsor package — $2,500',
        message: 'Message',
        messagePh: 'Tell us a little about your goals or questions...',
        submit: 'Send my request',
        sending: 'Sending...',
        successTitle: 'Thank you — we received your request.',
        successBody: 'A team member will be in touch within 48 business hours.',
        sendAnother: 'Send another request',
        consent: 'By submitting this form you agree to be contacted by ME Producciones about The Real Happiness Experience. We will not share your information with third parties.',
        errorName: 'Full name is required.',
        errorEmail: 'Enter a valid email address.',
        errorMessage: 'A short message is required.',
        errorServer: 'Something went wrong. Please try again or write us at melatinoevents@gmail.com.',
        privacy: 'Privacy',
        privacyHref: '/about',
      }
    : {
        eyebrow: 'Solicitar más información',
        title: 'Sé parte de The Real Happiness Experience.',
        sub: 'Cuéntanos cómo te gustaría participar. Nuestro equipo te responderá en menos de 48 horas hábiles.',
        name: 'Nombre completo',
        namePh: 'Tu nombre completo',
        email: 'Correo electrónico',
        emailPh: 'tu@ejemplo.com',
        phone: 'Teléfono (opcional)',
        phonePh: '+1 (305) 000-0000',
        company: 'Empresa / marca (opcional)',
        companyPh: 'Nombre de tu empresa',
        interest: 'Mi interés es',
        attendee: 'Asistir al evento',
        sponsor: 'Patrocinar / marca',
        speaker: 'Ser speaker',
        general: 'Consulta general',
        sponsorPkg: 'Paquete de patrocinio (opcional)',
        sponsorPkgChoose: 'Selecciona un paquete',
        speakerPkg: 'Paquete Speaker / Sponsor — $2,500',
        message: 'Mensaje',
        messagePh: 'Cuéntanos un poco sobre tus objetivos o preguntas...',
        submit: 'Enviar solicitud',
        sending: 'Enviando...',
        successTitle: 'Gracias — recibimos tu solicitud.',
        successBody: 'Un miembro de nuestro equipo te contactará en menos de 48 horas hábiles.',
        sendAnother: 'Enviar otra solicitud',
        consent: 'Al enviar este formulario aceptas que ME Producciones te contacte sobre The Real Happiness Experience. No compartiremos tu información con terceros.',
        errorName: 'El nombre completo es requerido.',
        errorEmail: 'Ingresa un correo electrónico válido.',
        errorMessage: 'Un mensaje breve es requerido.',
        errorServer: 'Algo salió mal. Intenta nuevamente o escríbenos a melatinoevents@gmail.com.',
        privacy: 'Privacidad',
        privacyHref: '/about',
      };

  const interestOptions: { value: Interest; label: string }[] = [
    { value: 'attendee', label: labels.attendee },
    { value: 'sponsor',  label: labels.sponsor },
    { value: 'speaker',  label: labels.speaker },
    { value: 'general',  label: labels.general },
  ];

  const sponsorPackageOptions: { value: SponsorPackage; label: string }[] = [
    { value: '',                 label: labels.sponsorPkgChoose },
    { value: 'exclusive',        label: 'Exclusive — $10,000' },
    { value: 'platinum',         label: 'Platinum — $5,000' },
    { value: 'silver',           label: 'Silver — $3,000' },
    { value: 'blue',             label: 'Blue — $1,500' },
    { value: 'pink',             label: 'Pink — $500' },
    { value: 'speaker_package',  label: labels.speakerPkg },
  ];

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name in errors) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerErr('');
    const errs: FormErrors = {};
    if (!form.name.trim())               errs.name = labels.errorName;
    if (!EMAIL_RE.test(form.email))      errs.email = labels.errorEmail;
    if (!form.message.trim())            errs.message = labels.errorMessage;
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('email', form.email.trim().toLowerCase());
      fd.append('phone', form.phone.trim());
      // The leads.interest column accepts arbitrary text — encode the channel
      fd.append('inquiryType', `the-real-happiness:${form.interest}`);

      // Compose a richer message body — preserves company, package, UTM data
      const lines: string[] = [];
      if (form.company.trim())   lines.push(`Company / Empresa: ${form.company.trim()}`);
      if (form.sponsorPackage)   lines.push(`Sponsor package: ${form.sponsorPackage}`);
      lines.push('— Message —');
      lines.push(form.message.trim());
      const utmKeys = Object.keys(utm);
      if (utmKeys.length > 0) {
        lines.push('— Campaign attribution —');
        for (const k of utmKeys) lines.push(`${k}=${utm[k]}`);
      }
      fd.append('message', lines.join('\n'));

      const res = await submitContact(fd);
      if (res.error) throw new Error(res.error);
      setSubmitted(true);
    } catch {
      setServerErr(labels.errorServer);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col gap-5 border border-[#A56E52] bg-[#F7F3EE] p-8 md:p-10">
        <div className="h-px w-8 bg-[#A56E52]" />
        <h3 className="font-serif text-2xl md:text-3xl font-normal text-[#2A2421]">
          {labels.successTitle}
        </h3>
        <p className="font-sans text-base leading-relaxed text-[#5B4638]">
          {labels.successBody}
        </p>
        <button
          type="button"
          onClick={() => { setSubmitted(false); setForm(INITIAL); setErrors({}); }}
          className="mt-2 w-fit font-sans text-xs font-medium uppercase tracking-widest text-[#5B4638] underline underline-offset-4 transition-colors hover:text-[#A56E52]"
        >
          {labels.sendAnother}
        </button>
      </div>
    );
  }

  const inputBase =
    'w-full border bg-[#FDFAF7] px-4 py-3.5 font-sans text-sm text-[#2A2421] placeholder-[#5B4638]/30 outline-none transition-colors duration-200 focus:border-[#2A2421] min-h-[44px]';

  function inputCls(error?: string) {
    return [inputBase, error ? 'border-red-400 focus:border-red-500' : 'border-[#D7C6B2]'].join(' ');
  }

  const labelCls =
    'font-sans text-[11px] font-medium uppercase tracking-widest text-[#5B4638]';

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#A56E52]">
          {labels.eyebrow}
        </span>
        <div className="h-px w-8 bg-[#A56E52]" />
        <h3 className="mt-2 font-serif text-2xl md:text-3xl font-normal leading-snug text-[#2A2421]">
          {labels.title}
        </h3>
        <p className="font-sans text-sm leading-relaxed text-[#5B4638]">
          {labels.sub}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className={labelCls}>{labels.name} <span className="text-[#A56E52]">*</span></label>
          <input
            type="text" name="name" autoComplete="name"
            value={form.name} onChange={handleChange}
            placeholder={labels.namePh}
            className={inputCls(errors.name)}
          />
          {errors.name && <p className="font-sans text-xs text-red-600">{errors.name}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <label className={labelCls}>{labels.email} <span className="text-[#A56E52]">*</span></label>
          <input
            type="email" name="email" autoComplete="email"
            value={form.email} onChange={handleChange}
            placeholder={labels.emailPh}
            className={inputCls(errors.email)}
          />
          {errors.email && <p className="font-sans text-xs text-red-600">{errors.email}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <label className={labelCls}>{labels.phone}</label>
          <input
            type="tel" name="phone" autoComplete="tel"
            value={form.phone} onChange={handleChange}
            placeholder={labels.phonePh}
            className={inputCls()}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className={labelCls}>{labels.company}</label>
          <input
            type="text" name="company" autoComplete="organization"
            value={form.company} onChange={handleChange}
            placeholder={labels.companyPh}
            className={inputCls()}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className={labelCls}>{labels.interest} <span className="text-[#A56E52]">*</span></label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {interestOptions.map((opt) => {
            const checked = form.interest === opt.value;
            return (
              <label
                key={opt.value}
                className={[
                  'cursor-pointer border px-3 py-3 font-sans text-xs text-center transition-colors min-h-[44px] flex items-center justify-center',
                  checked
                    ? 'border-[#2A2421] bg-[#2A2421] text-[#F7F3EE]'
                    : 'border-[#D7C6B2] text-[#5B4638] hover:border-[#2A2421]',
                ].join(' ')}
              >
                <input
                  type="radio"
                  name="interest"
                  value={opt.value}
                  checked={checked}
                  onChange={handleChange}
                  className="sr-only"
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      </div>

      {form.interest === 'sponsor' && (
        <div className="flex flex-col gap-2 border-l-2 border-[#A56E52] pl-5">
          <label className={labelCls}>{labels.sponsorPkg}</label>
          <select
            name="sponsorPackage"
            value={form.sponsorPackage}
            onChange={handleChange}
            className={inputCls()}
          >
            {sponsorPackageOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className={labelCls}>{labels.message} <span className="text-[#A56E52]">*</span></label>
        <textarea
          name="message" rows={5}
          value={form.message} onChange={handleChange}
          placeholder={labels.messagePh}
          className={[inputCls(errors.message), 'resize-none'].join(' ')}
        />
        {errors.message && <p className="font-sans text-xs text-red-600">{errors.message}</p>}
      </div>

      {serverErr && (
        <p className="font-sans text-xs text-red-700 border border-red-200 bg-red-50 px-4 py-3">
          {serverErr}
        </p>
      )}

      <p className="font-sans text-[11px] leading-relaxed text-[#5B4638]/70">
        {labels.consent}
      </p>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={loading}
          className={[
            'inline-flex items-center justify-center gap-2 px-8 py-4 font-sans text-xs font-medium uppercase tracking-widest text-[#F7F3EE] bg-[#A56E52] hover:bg-[#5B4638] transition-colors duration-200 min-h-[48px]',
            loading ? 'cursor-not-allowed opacity-60' : '',
          ].join(' ')}
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {labels.sending}
            </>
          ) : labels.submit}
        </button>
        <a
          href={labels.privacyHref}
          className="font-sans text-[11px] uppercase tracking-widest text-[#5B4638] underline underline-offset-4 hover:text-[#A56E52] transition-colors"
        >
          {labels.privacy}
        </a>
      </div>
    </form>
  );
}
