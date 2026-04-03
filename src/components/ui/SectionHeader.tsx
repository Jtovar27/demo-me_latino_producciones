interface SectionHeaderProps {
  label: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export default function SectionHeader({
  label,
  title,
  subtitle,
  centered = false,
  className = '',
}: SectionHeaderProps) {
  const alignment = centered ? 'items-center text-center' : 'items-start text-left';

  return (
    <div className={['flex flex-col gap-4', alignment, className].filter(Boolean).join(' ')}>
      <div className={['flex flex-col gap-2', centered ? 'items-center' : 'items-start'].join(' ')}>
        <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#A56E52]">
          {label}
        </span>
        <div
          className={[
            'h-px w-8 bg-[#A56E52]',
            centered ? 'self-center' : 'self-start',
          ].join(' ')}
        />
      </div>

      <h2
        className="font-serif text-3xl font-normal leading-tight text-[#2A2421] md:text-4xl lg:text-5xl"

      >
        {title}
      </h2>

      {subtitle && (
        <p className="max-w-xl font-sans text-base leading-relaxed text-[#5B4638]">{subtitle}</p>
      )}
    </div>
  );
}
