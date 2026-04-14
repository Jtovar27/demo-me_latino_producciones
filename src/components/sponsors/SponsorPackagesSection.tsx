'use client';

import { useState } from 'react';
import SponsorInquiryModal from './SponsorInquiryModal';

type SponsorTier = 'platinum' | 'silver' | 'blue' | 'pink';

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

export default function SponsorPackagesSection() {
  const [modalTier, setModalTier] = useState<SponsorTier>('platinum');
  const [modalOpen, setModalOpen] = useState(false);

  function openModal(tier: SponsorTier) {
    setModalTier(tier);
    setModalOpen(true);
  }

  const activeMeta = TIER_META[modalTier];
  const activePkg = TIER_PACKAGES.find((p) => p.tier === modalTier);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {TIER_PACKAGES.map((pkg) => {
          const meta = TIER_META[pkg.tier];
          const isDark = pkg.highlight;

          return (
            <div
              key={pkg.tier}
              className={[
                'flex flex-col gap-8 p-8 md:p-10',
                isDark
                  ? 'bg-[#2A2421]'
                  : `border ${meta.borderClass} ${meta.cardBg}`,
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

              {/* CTA */}
              <div className="pt-2">
                <button
                  onClick={() => openModal(pkg.tier)}
                  className={[
                    'w-full border px-6 py-3 font-sans text-[11px] uppercase tracking-widest transition-colors duration-200',
                    isDark
                      ? 'border-[#A56E52] bg-[#A56E52] text-[#F7F3EE] hover:bg-[#8B5A42] hover:border-[#8B5A42]'
                      : 'border-[#2A2421] text-[#2A2421] hover:bg-[#2A2421] hover:text-[#F7F3EE]',
                  ].join(' ')}
                >
                  Solicitar info — {meta.label}
                </button>
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
        <div className="shrink-0">
          <button
            onClick={() => openModal('pink')}
            className="border border-[#D7C6B2] px-5 py-2.5 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] transition-colors"
          >
            Conversemos
          </button>
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
