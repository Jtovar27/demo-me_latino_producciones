import Image from 'next/image';

interface LogoProps {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: { width: 96,  height: 44 },
  md: { width: 128, height: 58 },
  lg: { width: 172, height: 78 },
};

// CSS filter chains that convert the monochrome PNG logo to brand colors.
// brightness(0) normalizes all pixels to black (preserving alpha),
// then subsequent filters build up the target hue.
const FILTER_DARK  = 'brightness(0) saturate(100%) invert(67%) sepia(38%) saturate(647%) hue-rotate(4deg) brightness(95%) contrast(100%)';
// → mustaza #C89B46 (primary brand color)
const FILTER_LIGHT = 'brightness(0) invert(1)';
// → blanco puro (para fondos oscuros)

export default function Logo({ variant = 'dark', size = 'md', className }: LogoProps) {
  const s = sizes[size];

  return (
    <Image
      src="/logo.png"
      alt="Mónica Espinoza Producciones"
      width={s.width}
      height={s.height}
      className={className}
      style={{ filter: variant === 'light' ? FILTER_LIGHT : FILTER_DARK }}
      priority
    />
  );
}
