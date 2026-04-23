'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { t, tr } from '@/lib/i18n/translations';

interface Props {
  url: string | null | undefined;
  // Compact styling fits inside event cards; full styling stands alone (popup, detail page).
  variant?: 'full' | 'compact';
}

function EventbriteLogo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15.5v-11l7 5.5-7 5.5z" />
    </svg>
  );
}

export default function EventbriteButton({ url, variant = 'full' }: Props) {
  const { lang } = useLanguage();
  const pf = t.paymentFlow;

  const hasUrl = typeof url === 'string' && url.trim().length > 0;

  const sizeCls = variant === 'compact'
    ? 'px-4 py-3 text-[10px]'
    : 'px-5 py-3.5 text-[11px]';

  if (!hasUrl) {
    return (
      <div
        className={`flex items-center justify-center gap-2 w-full border border-dashed border-[#D7C6B2] bg-[#F7F3EE] font-sans uppercase tracking-widest text-[#8A7865] ${sizeCls}`}
        aria-live="polite"
      >
        <EventbriteLogo />
        {tr(pf.eventbriteSoon, lang)}
      </div>
    );
  }

  return (
    <a
      href={url!}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-center gap-2 w-full bg-[#F05537] hover:bg-[#D1410C] font-sans uppercase tracking-widest text-white transition-colors ${sizeCls}`}
    >
      <EventbriteLogo />
      {tr(pf.eventbriteBuyBtn, lang)}
    </a>
  );
}
