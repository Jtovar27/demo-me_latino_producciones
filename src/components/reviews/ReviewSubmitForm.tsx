'use client';

import { useState } from 'react';
import { submitPublicReview } from '@/app/actions/reviews';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function ReviewSubmitForm() {
  const { lang } = useLanguage();
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    const fd = new FormData(e.currentTarget);
    fd.set('rating', String(rating));

    const result = await submitPublicReview(fd);
    if (result.error) {
      setErrorMsg(result.error);
      setStatus('error');
    } else {
      setStatus('success');
    }
  }

  if (status === 'success') {
    return (
      <div className="border border-[#A56E52] bg-[#FDFAF7] px-8 py-10 text-center">
        <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#A56E52] mb-3">
          {lang === 'en' ? 'Thank you for your testimonial' : 'Gracias por tu testimonio'}
        </p>
        <p className="font-sans text-sm text-[#5B4638]">
          {lang === 'en'
            ? 'Your review was received and will be published once approved by our team.'
            : 'Tu review fue recibido y será publicado una vez aprobado por nuestro equipo.'}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-[#EAE1D6] bg-[#FDFAF7] p-8 flex flex-col gap-6">
      {/* Star rating */}
      <div>
        <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-3">
          {lang === 'en' ? 'Your rating' : 'Tu calificación'}
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = n <= (hovered || rating);
            return (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                className="transition-transform hover:scale-110 focus:outline-none"
                aria-label={lang === 'en' ? `${n} star${n !== 1 ? 's' : ''}` : `${n} estrella${n !== 1 ? 's' : ''}`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <polygon
                    points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                    fill={filled ? '#A56E52' : 'none'}
                    stroke="#A56E52"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            );
          })}
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">
          {lang === 'en' ? 'Full name' : 'Nombre completo'} <span className="text-[#A56E52]">*</span>
        </label>
        <input
          name="name"
          type="text"
          required
          maxLength={200}
          placeholder={lang === 'en' ? 'Your name' : 'Tu nombre'}
          className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors placeholder:text-[#D7C6B2]"
        />
      </div>

      {/* Role + Company */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">
            {lang === 'en' ? 'Title / Role' : 'Cargo / Rol'}
          </label>
          <input
            name="role"
            type="text"
            maxLength={200}
            placeholder={lang === 'en' ? 'CEO, Entrepreneur...' : 'CEO, Emprendedor...'}
            className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors placeholder:text-[#D7C6B2]"
          />
        </div>
        <div>
          <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">
            {lang === 'en' ? 'Company' : 'Empresa'}
          </label>
          <input
            name="company"
            type="text"
            maxLength={200}
            placeholder={lang === 'en' ? 'Your company' : 'Tu empresa'}
            className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors placeholder:text-[#D7C6B2]"
          />
        </div>
      </div>

      {/* Event name */}
      <div>
        <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">
          {lang === 'en' ? 'Event you attended' : 'Evento al que asististe'}
        </label>
        <input
          name="event_name"
          type="text"
          maxLength={300}
          placeholder="The Real Happiness, Fuerza Latina..."
          className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors placeholder:text-[#D7C6B2]"
        />
      </div>

      {/* Review text */}
      <div>
        <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">
          {lang === 'en' ? 'Your testimonial' : 'Tu testimonio'}
        </label>
        <textarea
          name="text"
          rows={4}
          maxLength={2000}
          placeholder={lang === 'en'
            ? 'Share your experience with our community...'
            : 'Comparte tu experiencia con nuestra comunidad...'}
          className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors resize-none placeholder:text-[#D7C6B2]"
        />
      </div>

      {errorMsg && (
        <p className="font-sans text-[10px] uppercase tracking-widest text-red-500">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="self-start border border-[#2A2421] bg-[#2A2421] px-8 py-3 font-sans text-[10px] uppercase tracking-widest text-[#F7F3EE] transition-colors hover:bg-[#A56E52] hover:border-[#A56E52] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'sending'
          ? (lang === 'en' ? 'Sending...' : 'Enviando...')
          : (lang === 'en' ? 'Submit testimonial' : 'Enviar testimonio')}
      </button>
    </form>
  );
}
