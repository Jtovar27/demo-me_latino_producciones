'use client';

import Link from 'next/link';
import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'terracotta';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  href?: string;
  className?: string;
  children: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-[#2A2421] text-[#F7F3EE] border border-[#2A2421] hover:bg-[#5B4638] hover:border-[#5B4638] active:bg-[#2A2421]',
  secondary:
    'bg-transparent text-[#2A2421] border border-[#2A2421] hover:bg-[#2A2421] hover:text-[#F7F3EE] active:bg-[#5B4638]',
  ghost:
    'bg-transparent text-[#5B4638] border border-transparent hover:border-[#D7C6B2] hover:bg-[#EAE1D6] active:bg-[#D7C6B2]',
  terracotta:
    'bg-[#A56E52] text-[#F7F3EE] border border-[#A56E52] hover:bg-[#5B4638] hover:border-[#5B4638] active:bg-[#2A2421]',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs tracking-widest',
  md: 'px-6 py-3 text-xs tracking-widest',
  lg: 'px-8 py-4 text-sm tracking-widest',
};

const Spinner = () => (
  <svg
    className="animate-spin h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  href,
  className = '',
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 uppercase font-sans font-medium transition-all duration-200 cursor-pointer select-none';
  const disabledStyles =
    disabled || loading ? 'opacity-40 cursor-not-allowed pointer-events-none' : '';

  const classes = [base, variantStyles[variant], sizeStyles[size], disabledStyles, className]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {loading && <Spinner />}
      {children}
    </>
  );

  if (href && !disabled && !loading) {
    const { onClick } = rest;
    return (
      <Link
        href={href}
        className={classes}
        onClick={onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>}
      >
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  );
}
