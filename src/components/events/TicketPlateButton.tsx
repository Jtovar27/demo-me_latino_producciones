'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { t, tr } from '@/lib/i18n/translations';

interface Props {
  url: string | null | undefined;
  // Compact styling fits inside event cards; full styling stands alone (popup, detail page).
  variant?: 'full' | 'compact';
}

function TicketPlateLogo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  );
}

export default function TicketPlateButton({ url, variant = 'full' }: Props) {
  const { lang } = useLanguage();
  const pf = t.paymentFlow;

  const hasUrl = typeof url === 'string' && url.trim().length > 0;

  const sizeCls = variant === 'compact'
    ? 'px-4 py-3 text-[10px]'
    : 'px-5 py-3.5 text-[11px]';

  // TicketPlate link not set → don't render anything (Eventbrite shows a
  // "coming soon" placeholder, but TicketPlate is purely additive so we hide it).
  if (!hasUrl) return null;

  return (
    <a
      href={url!}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-center gap-2 w-full bg-[#1D4ED8] hover:bg-[#1E40AF] font-sans uppercase tracking-widest text-white transition-colors ${sizeCls}`}
    >
      <TicketPlateLogo />
      {tr(pf.ticketplateBuyBtn, lang)}
    </a>
  );
}
