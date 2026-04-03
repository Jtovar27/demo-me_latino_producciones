type BadgeVariant =
  | 'upcoming'
  | 'active'
  | 'sold-out'
  | 'past'
  | 'platinum'
  | 'gold'
  | 'silver'
  | 'partner';

interface BadgeProps {
  variant: BadgeVariant;
  className?: string;
}

const variantConfig: Record<BadgeVariant, { label: string; styles: string }> = {
  upcoming: {
    label: 'Próximo',
    styles: 'border-[#A56E52] text-[#A56E52] bg-transparent',
  },
  active: {
    label: 'Activo',
    styles: 'border-[#5B4638] text-[#5B4638] bg-[#EAE1D6]',
  },
  'sold-out': {
    label: 'Agotado',
    styles: 'border-[#2A2421] text-[#F7F3EE] bg-[#2A2421]',
  },
  past: {
    label: 'Finalizado',
    styles: 'border-[#D7C6B2] text-[#5B4638] bg-transparent',
  },
  platinum: {
    label: 'Platinum',
    styles: 'border-[#2A2421] text-[#2A2421] bg-transparent',
  },
  gold: {
    label: 'Gold',
    styles: 'border-[#A56E52] text-[#A56E52] bg-transparent',
  },
  silver: {
    label: 'Silver',
    styles: 'border-[#5B4638] text-[#5B4638] bg-transparent',
  },
  partner: {
    label: 'Partner',
    styles: 'border-[#D7C6B2] text-[#5B4638] bg-[#EAE1D6]',
  },
};

export default function Badge({ variant, className = '' }: BadgeProps) {
  const { label, styles } = variantConfig[variant];

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
