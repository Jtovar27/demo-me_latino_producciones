'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { submitSponsorLead } from '@/app/actions/sponsors';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { t, tr } from '@/lib/i18n/translations';

type SponsorTier = 'platinum' | 'silver' | 'blue' | 'pink';

interface Props {
  tier: SponsorTier;
  tierLabel: string;
  price: string;
  onClose: () => void;
}

// This component is only mounted when the modal is open (parent renders it conditionally).
// Unmounting on close resets all form state automatically — no need for state reset in effects.
export default function SponsorInquiryModal({ tier, tierLabel, price, onClose }: Props) {
  const { lang } = useLanguage();
  const tf = t.sponsorForm;

  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [phone, setPhone]     = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('');

  const firstInputRef = useRef<HTMLInputElement>(null);

  // Lock body scroll while mounted; focus first input on mount.
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    setTimeout(() => firstInputRef.current?.focus(), 80);
    return () => { document.body.style.overflow = ''; };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError(tr(tf.errorName, lang)); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError(tr(tf.errorEmail, lang)); return; }

    setLoading(true);
    const fd = new FormData();
    fd.append('name', name);
    fd.append('email', email);
    fd.append('phone', phone);
    fd.append('company', company);
    fd.append('message', message);
    fd.append('tier', tier);

    const result = await submitSponsorLead(fd);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setRedirectUrl(result.redirectUrl ?? '/contact');
    setSuccess(true);

    // Auto-redirect after 2s
    setTimeout(() => {
      window.location.href = result.redirectUrl ?? '/contact';
    }, 2000);
  }

  const labelClass = 'block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2';
  const inputClass = 'w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-[#2A2421]/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={tr(tf.title, lang)}
        className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full border border-[#EAE1D6] bg-[#FDFAF7] shadow-2xl rounded-t-lg sm:rounded-none overflow-y-auto max-h-[92vh]"
      >
        {/* Header */}
        <div className="border-b border-[#EAE1D6] px-6 py-5 flex items-start justify-between gap-4">
          <div>
            <span className="font-sans text-[9px] uppercase tracking-[0.25em] text-[#A56E52]">
              {tierLabel} — {price}
            </span>
            <p className="mt-1 font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">
              {tr(tf.title, lang)}
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

        {success ? (
          <div className="px-6 py-12 text-center flex flex-col items-center gap-4">
            <div className="w-12 h-12 border border-[#A56E52] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A56E52" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-serif text-2xl text-[#2A2421]">{tr(tf.successTitle, lang)}</p>
            <p className="font-sans text-sm text-[#5B4638] leading-relaxed">{tr(tf.successBody, lang)}</p>
            <p className="font-sans text-xs text-[#5B4638]/60 mt-2">
              {tr(tf.redirecting, lang)}{' '}
              <a href={redirectUrl} className="underline text-[#A56E52]">{tr(tf.clickHere, lang)}</a>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="px-6 py-6 space-y-4">
              {/* Tier badge */}
              <div className="border border-[#EAE1D6] bg-[#F7F3EE] px-4 py-3 flex items-center justify-between">
                <span className="font-sans text-[9px] uppercase tracking-widest text-[#5B4638]">
                  {tr(tf.tierLbl, lang)}
                </span>
                <span className="font-sans text-[10px] uppercase tracking-widest text-[#2A2421] font-medium">
                  {tierLabel} — {price}
                </span>
              </div>

              <p className="font-sans text-xs leading-relaxed text-[#5B4638]">
                {tr(tf.subtitle, lang)}
              </p>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className={labelClass}>{tr(tf.nameLbl, lang)}</label>
                  <input
                    ref={firstInputRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={tr(tf.namePh, lang)}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>{tr(tf.emailLbl, lang)}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={tr(tf.emailPh, lang)}
                    className={inputClass}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{tr(tf.phoneLbl, lang)}</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={tr(tf.phonePh, lang)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>{tr(tf.companyLbl, lang)}</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder={tr(tf.companyPh, lang)}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{tr(tf.messageLbl, lang)}</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={tr(tf.messagePh, lang)}
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </div>
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
                {tr(tf.cancel, lang)}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="border border-[#2A2421] bg-[#2A2421] px-6 py-2.5 font-sans text-[9px] uppercase tracking-widest text-[#F7F3EE] hover:bg-[#5B4638] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? tr(tf.submitting, lang) : tr(tf.submit, lang)}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
