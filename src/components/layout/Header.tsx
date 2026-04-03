'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Experiencias', href: '/experiences' },
  { label: 'Eventos', href: '/events' },
  { label: 'Speakers', href: '/speakers' },
  { label: 'Galería', href: '/gallery' },
  { label: 'Contacto', href: '/contact' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={[
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-[#FDFAF7]/95 backdrop-blur-md shadow-sm border-b border-[#EAE1D6]'
            : 'bg-transparent',
        ].join(' ')}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Wordmark */}
          <Link
            href="/"
            className="font-sans text-xs font-semibold uppercase tracking-[0.3em] text-[#2A2421] transition-opacity hover:opacity-70"
            aria-label="ME Latino Producciones — Home"
          >
            ME Latino
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans text-[11px] font-medium uppercase tracking-widest text-[#5B4638] transition-colors duration-200 hover:text-[#A56E52]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex">
            <Button variant="primary" size="sm" href="/contact">
              Reservar
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex flex-col items-center justify-center gap-1.5 p-2 lg:hidden"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
          >
            <span
              className={[
                'block h-px w-6 bg-[#2A2421] transition-all duration-300',
                menuOpen ? 'translate-y-[7px] rotate-45' : '',
              ].join(' ')}
            />
            <span
              className={[
                'block h-px w-6 bg-[#2A2421] transition-all duration-300',
                menuOpen ? 'opacity-0' : '',
              ].join(' ')}
            />
            <span
              className={[
                'block h-px w-6 bg-[#2A2421] transition-all duration-300',
                menuOpen ? '-translate-y-[7px] -rotate-45' : '',
              ].join(' ')}
            />
          </button>
        </div>
      </header>

      {/* Mobile full-screen overlay */}
      <div
        className={[
          'fixed inset-0 z-40 flex flex-col bg-[#2A2421] transition-all duration-500 lg:hidden',
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        aria-hidden={!menuOpen}
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-8">
          <p className="mb-4 font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-[#A56E52]">
            ME Latino Producciones
          </p>
          <nav className="flex flex-col items-center gap-6" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-serif text-2xl font-normal text-[#EAE1D6] transition-colors duration-200 hover:text-[#A56E52]"

              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8">
            <Button variant="terracotta" size="md" href="/contact" onClick={() => setMenuOpen(false)}>
              Reservar
            </Button>
          </div>
        </div>

        <div className="px-8 pb-10 text-center">
          <p className="font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">
            Eventos que inspiran
          </p>
        </div>
      </div>
    </>
  );
}
