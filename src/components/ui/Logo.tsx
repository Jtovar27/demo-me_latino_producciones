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

export default function Logo({ variant = 'dark', size = 'md', className }: LogoProps) {
  const s = sizes[size];

  return (
    <Image
      src="/logo-me.png"
      alt="Mónica Espinoza Producciones"
      width={s.width}
      height={s.height}
      className={className}
      priority
    />
  );
}
