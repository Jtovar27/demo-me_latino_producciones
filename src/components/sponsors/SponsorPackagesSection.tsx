'use client';

import { useState } from 'react';
import SponsorInquiryModal from './SponsorInquiryModal';

type SponsorTier = 'platinum' | 'silver' | 'blue' | 'pink';

const WA_NUMBER = '13055252555';

const TIER_META: Record<SponsorTier, { label: string; borderClass: string; pillClass: string; cardBg: string }> = {
  platinum: {
    label: 'Platinum',
    borderClass: 'border-[#2A2421]',
    pillClass: 'bg-[#2A2421] text-[#F7F3EE]',
    cardBg: 'bg-[#FDFAF7]',
  },
  silver: {
    label: 'Silver',
    borderClass: 'border-[#D7C6B2]',
    pillClass: 'bg-[#EAE1D6] text-[#5B4638]',
    cardBg: 'bg-[#FDFAF7]',
  },
  blue: {
    label: 'Blue',
    borderClass: 'border-[#4A7FA5]',
    pillClass: 'bg-[#E8F1F7] text-[#4A7FA5]',
    cardBg: 'bg-[#F7F3EE]',
  },
  pink: {
    label: 'Pink',
    borderClass: 'border-[#C4758A]',
    pillClass: 'bg-[#FAF0F3] text-[#C4758A]',
    cardBg: 'bg-[#F7F3EE]',
  },
};

const TIER_PACKAGES = [
  {
    tier: 'platinum' as SponsorTier,
    price: '$5,000',
    highlight: true,
    benefits: [
      'Presencia completa en todos los eventos de la temporada',
      'Tiempo en escena (introducción de keynote o segmento de marca)',
      'Espacio de activación exclusivo',
      'Logotipo en todo el material del evento',
      'Campaña digital co-brandada (redes + email)',
      'Acceso VIP para 10 personas (todos los eventos)',
      'Oportunidad de speaker o panel',
      'Reporte de impacto post-evento',
    ],
  },
  {
    tier: 'silver' as SponsorTier,
    price: '$2,500',
    highlight: false,
    benefits: [
      'Patrocinador nombrado para un evento o track específico',
      'Señalización en escenario',
      'Stand o booth premium',
      '20 entradas de acceso general',
      'Co-promoción en redes sociales (3 publicaciones)',
      'Reporte de impacto post-evento',
    ],
  },
  {
    tier: 'blue' as SponsorTier,
    price: '$1,000',
    highlight: false,
    benefits: [
      'Logotipo en programa del evento y materiales digitales',
      'Mención en redes sociales (1 publicación)',
      '10 entradas de acceso general',
      'Listado en directorio de patrocinadores',
    ],
  },
];

function TierPill({ tier }: { tier: SponsorTier }) {
  const { label, pillClass } = TIER_META[tier];
  return (
    <span className={`inline-block px-3 py-1 font-sans text-[9px] uppercase tracking-[0.2em] font-medium ${pillClass}`}>
      {label}
    </span>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function waInfoUrl(tier: SponsorTier, label: string, price: string) {
  const msg = encodeURIComponent(
    `Hola! Me interesa el paquete de sponsorship ${label} (${price}) de ME Producciones. ¿Pueden darme más información?`
  );
  return `https://wa.me/${WA_NUMBER}?text=${msg}`;
}

export default function SponsorPackagesSection() {
  const [modalTier, setModalTier] = useState<SponsorTier>('platinum');
  const [modalOpen, setModalOpen] = useState(false);

  function openModal(tier: SponsorTier) {
    setModalTier(tier);
    setModalOpen(true);
  }

  const activeMeta = TIER_META[modalTier];
  const activePkg  = TIER_PACKAGES.find((p) => p.tier === modalTier);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {TIER_PACKAGES.map((pkg) => {
          const meta  = TIER_META[pkg.tier];
          const isDark = pkg.highlight;

          return (
            <div
              key={pkg.tier}
              className={[
                'flex flex-col gap-8 p-8 md:p-10',
                isDark ? 'bg-[#2A2421]' : `border ${meta.borderClass} ${meta.cardBg}`,
              ].join(' ')}
            >
              {/* Header */}
              <div className="flex flex-col gap-3">
                <TierPill tier={pkg.tier} />
                <p className={['font-serif text-4xl font-normal', isDark ? 'text-[#F7F3EE]' : 'text-[#2A2421]'].join(' ')}>
                  {pkg.price}
                </p>
                <p className={['font-sans text-[10px] uppercase tracking-widest', isDark ? 'text-[#D7C6B2]' : 'text-[#5B4638]'].join(' ')}>
                  Inversión inicial
                </p>
              </div>

              {/* Benefits */}
              <ul className="flex flex-col gap-3 flex-1">
                {pkg.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#A56E52]" />
                    <span className={['font-sans text-sm leading-relaxed', isDark ? 'text-[#D7C6B2]' : 'text-[#5B4638]'].join(' ')}>
                      {b}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTAs — dos botones */}
              <div className="pt-2 flex flex-col gap-2">
                {/* Botón 1: Convertirse en Sponsor */}
                <button
                  onClick={() => openModal(pkg.tier)}
                  className={[
                    'w-full border px-6 py-3 font-sans text-[11px] uppercase tracking-widest transition-colors duration-200',
                    isDark
                      ? 'border-[#A56E52] bg-[#A56E52] text-[#F7F3EE] hover:bg-[#8B5A42] hover:border-[#8B5A42]'
                      : 'border-[#2A2421] bg-[#2A2421] text-[#F7F3EE] hover:bg-[#5B4638] hover:border-[#5B4638]',
                  ].join(' ')}
                >
                  Convertirse en Sponsor
                </button>

                {/* Botón 2: Más Información */}
                <a
                  href={waInfoUrl(pkg.tier, meta.label, pkg.price)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={[
                    'flex items-center justify-center gap-2 w-full border px-6 py-3 font-sans text-[11px] uppercase tracking-widest transition-colors duration-200',
                    isDark
                      ? 'border-[#D7C6B2]/40 text-[#D7C6B2] hover:border-[#D7C6B2] hover:text-white'
                      : 'border-[#D7C6B2] text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421]',
                  ].join(' ')}
                >
                  <WhatsAppIcon />
                  Más Información
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pink tier note */}
      <div className="mt-8 border border-[#EAE1D6] bg-[#F7F3EE] p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <TierPill tier="pink" />
          <p className="mt-2 font-sans text-sm text-[#5B4638] leading-relaxed">
            ¿Buscas una colaboración más pequeña o a medida? El nivel Pink ($500) está disponible
            para organizaciones con objetivos específicos.
          </p>
        </div>
        <div className="shrink-0 flex flex-col gap-2 sm:items-end">
          <button
            onClick={() => openModal('pink')}
            className="border border-[#C4758A] bg-[#C4758A] px-5 py-2.5 font-sans text-[9px] uppercase tracking-widest text-white hover:bg-[#a85f73] hover:border-[#a85f73] transition-colors"
          >
            Convertirse en Sponsor
          </button>
          <a
            href={waInfoUrl('pink', 'Pink', '$500')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-[#D7C6B2] px-5 py-2.5 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] transition-colors"
          >
            <WhatsAppIcon />
            Más Información
          </a>
        </div>
      </div>

      {modalOpen && (
        <SponsorInquiryModal
          tier={modalTier}
          tierLabel={activeMeta.label}
          price={activePkg?.price ?? ''}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
