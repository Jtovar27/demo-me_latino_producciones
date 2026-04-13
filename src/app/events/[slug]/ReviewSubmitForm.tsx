'use client';

import { useState } from 'react';
import { submitPublicReview } from '@/app/actions/reviews';

interface Props {
  eventName: string;
}

export default function ReviewSubmitForm({ eventName }: Props) {
  const [rating,  setRating]  = useState(5);
  const [hover,   setHover]   = useState(0);
  const [saving,  setSaving]  = useState(false);
  const [sent,    setSent]    = useState(false);
  const [errMsg,  setErrMsg]  = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setErrMsg('');
    const fd = new FormData(e.currentTarget);
    fd.set('rating',     String(rating));
    fd.set('event_name', eventName);
    const res = await submitPublicReview(fd);
    setSaving(false);
    if (res?.error) {
      setErrMsg(res.error);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="border border-[#A56E52] bg-[#A56E52]/5 px-8 py-10 flex flex-col items-center gap-4 text-center">
        <div className="h-px w-8 bg-[#A56E52]" />
        <p className="font-serif text-xl text-[#2A2421]">¡Gracias por compartir!</p>
        <p className="font-sans text-sm text-[#5B4638]">
          Tu testimonio será revisado y publicado pronto. Lo apreciamos mucho.
        </p>
      </div>
    );
  }

  const inputClass =
    'w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors';
  const labelClass =
    'block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Star rating */}
      <div>
        <label className={labelClass}>Calificación</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              aria-label={`${n} estrella${n !== 1 ? 's' : ''}`}
              className="p-1 focus:outline-none"
            >
              <svg width="20" height="20" viewBox="0 0 24 24"
                fill={(hover || rating) >= n ? '#A56E52' : 'none'}
                stroke="#A56E52" strokeWidth="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Nombre completo *</label>
          <input name="name" type="text" required className={inputClass} placeholder="Ana García" />
        </div>
        <div>
          <label className={labelClass}>Email (opcional)</label>
          <input name="email" type="email" className={inputClass} placeholder="ana@email.com" />
        </div>
        <div>
          <label className={labelClass}>Cargo / Rol</label>
          <input name="role" type="text" className={inputClass} placeholder="CEO, Directora..." />
        </div>
        <div>
          <label className={labelClass}>Empresa</label>
          <input name="company" type="text" className={inputClass} placeholder="Nombre de empresa" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Tu experiencia</label>
        <textarea
          name="text"
          rows={4}
          required
          className={`${inputClass} resize-none`}
          placeholder="Comparte cómo fue tu experiencia en este evento..."
        />
      </div>

      {errMsg && (
        <p className="font-sans text-xs text-red-600">{errMsg}</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="border border-[#2A2421] bg-[#2A2421] px-8 py-3 font-sans text-[10px] uppercase tracking-widest text-[#F7F3EE] hover:bg-[#5B4638] transition-colors disabled:opacity-50"
      >
        {saving ? 'Enviando...' : 'Enviar testimonio'}
      </button>
    </form>
  );
}
