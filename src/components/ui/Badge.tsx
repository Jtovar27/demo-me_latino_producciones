type BadgeVariant =
  | 'upcoming'
  | 'active'
  | 'sold-out'
  | 'past'
  | 'platinum'
  | 'silver'
  | 'blue'
  | 'pink';

interface BadgeProps {
  variant: BadgeVariant;
  lang?: 'es' | 'en';
  className?: string;
}

const variantConfig: Record<BadgeVariant, { es: string; en: string; styles: string }> = {
  upcoming: {
    es: 'Próximo',
    en: 'Upcoming',
    styles: 'border-[#A56E52] text-[#A56E52] bg-transparent',
  },
  active: {
    es: 'Activo',
    en: 'Active',
    styles: 'border-[#5B4638] text-[#5B4638] bg-[#EAE1D6]',
  },
  'sold-out': {
    es: 'Agotado',
    en: 'Sold Out',
    styles: 'border-[#2A2421] text-[#F7F3EE] bg-[#2A2421]',
  },
  past: {
    es: 'Finalizado',
    en: 'Past',
    styles: 'border-[#D7C6B2] text-[#5B4638] bg-transparent',
  },
  platinum: {
    es: 'Platinum',
    en: 'Platinum',
    styles: 'border-[#2A2421] text-[#2A2421] bg-transparent',
  },
  silver: {
    es: 'Silver',
    en: 'Silver',
    styles: 'border-[#5B4638] text-[#5B4638] bg-transparent',
  },
  blue: {
    es: 'Blue',
    en: 'Blue',
    styles: 'border-[#4A7FA5] text-[#4A7FA5] bg-transparent',
  },
  pink: {
    es: 'Pink',
    en: 'Pink',
    styles: 'border-[#C4758A] text-[#C4758A] bg-transparent',
  },
};

export default function Badge({ variant, lang = 'es', className = '' }: BadgeProps) {
  const { es, en, styles } = variantConfig[variant];
  const label = lang === 'en' ? en : es;

  return (
    <span
      className={[
        'inline-block border px-3 py-1 text-[10px] font-sans font-medium uppercase tracking-widest',
        styles,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {label}
    </span>
  );
}
