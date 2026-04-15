'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const NAV = [
  { es: 'Inicio',       en: 'Home',        href: '/' },
  { es: 'Nosotros',     en: 'About',       href: '/about' },
  { es: 'Experiencias', en: 'Experiences', href: '/experiences' },
  { es: 'Eventos',      en: 'Events',      href: '/events' },
  { es: 'Speakers',     en: 'Speakers',    href: '/speakers' },
  { es: 'Galería',      en: 'Gallery',     href: '/gallery' },
  { es: 'Sponsors',     en: 'Sponsors',    href: '/sponsors' },
  { es: 'Contacto',     en: 'Contact',     href: '/contact' },
];

export default function Header() {
  const { lang } = useLanguage();
  const navLinks = NAV.map((n) => ({ label: lang === 'en' ? n.en : n.es, href: n.href }));
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      {/* ── Top bar ─────────────────────────────── */}
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
            className="transition-opacity hover:opacity-70"
            aria-label="Mónica Espinoza Producciones — Inicio"
          >
            <Logo variant="dark" size="md" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-underline font-sans text-[11px] font-medium uppercase tracking-widest text-[#5B4638] transition-colors duration-200 hover:text-[#A56E52]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex">
            <Button variant="primary" size="sm" href="/contact">
              {lang === 'en' ? 'Book Now' : 'Reservar'}
            </Button>
          </div>

          {/* Mobile — hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            className="flex flex-col gap-[5px] p-2 lg:hidden group"
          >
            <span className="block h-[1.5px] w-6 bg-[#2A2421] transition-all duration-200 group-hover:w-5" />
            <span className="block h-[1.5px] w-5 bg-[#2A2421] transition-all duration-200 group-hover:w-6" />
            <span className="block h-[1.5px] w-6 bg-[#2A2421] transition-all duration-200 group-hover:w-4" />
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ───────────────────────── */}

      {/* Backdrop */}
      <div
        onClick={() => setMenuOpen(false)}
        aria-hidden
        className={[
          'fixed inset-0 z-40 bg-[#2A2421]/60 backdrop-blur-[2px] lg:hidden transition-opacity duration-500',
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* Panel slides in from the right */}
      <div
        aria-hidden={!menuOpen}
        className={[
          'fixed top-0 right-0 z-50 h-full w-[min(88vw,380px)] bg-[#FDFAF7] flex flex-col lg:hidden',
          'transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]',
          menuOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-8 h-16 border-b border-[#EAE1D6] shrink-0">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="transition-opacity hover:opacity-70"
            aria-label="Mónica Espinoza Producciones — Inicio"
          >
            <Logo variant="dark" size="sm" />
          </Link>

          {/* Close — animated X */}
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Cerrar menú"
            className="relative flex h-8 w-8 items-center justify-center"
          >
            <span
              className={[
                'absolute block h-[1.5px] w-5 bg-[#2A2421] transition-all duration-300',
                menuOpen ? 'rotate-45' : '',
              ].join(' ')}
            />
            <span
              className={[
                'absolute block h-[1.5px] w-5 bg-[#2A2421] transition-all duration-300',
                menuOpen ? '-rotate-45' : '',
              ].join(' ')}
            />
          </button>
        </div>

        {/* Nav links — staggered entrance */}
        <nav className="flex-1 overflow-y-auto px-8 pt-4" aria-label="Mobile navigation">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="group flex items-center justify-between border-b border-[#EAE1D6] py-5 transition-colors duration-200 hover:border-[#A56E52]"
              style={{
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? 'translateX(0)' : 'translateX(16px)',
                transition: `opacity 400ms ease ${120 + i * 55}ms, transform 400ms ease ${120 + i * 55}ms, color 200ms`,
              }}
            >
              <span className="font-serif text-[1.6rem] font-normal leading-none text-[#2A2421] group-hover:text-[#A56E52] transition-colors duration-200">
                {link.label}
              </span>
              <svg
                width="16" height="16" viewBox="0 0 16 16" fill="none"
                className="text-[#D7C6B2] group-hover:text-[#A56E52] group-hover:translate-x-0.5 transition-all duration-200"
              >
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}
        </nav>

        {/* Panel footer */}
        <div
          className="shrink-0 px-8 py-8 border-t border-[#EAE1D6]"
          style={{
            opacity: menuOpen ? 1 : 0,
            transform: menuOpen ? 'translateY(0)' : 'translateY(10px)',
            transition: `opacity 400ms ease ${120 + navLinks.length * 55}ms, transform 400ms ease ${120 + navLinks.length * 55}ms`,
          }}
        >
          <Button
            variant="primary"
            size="md"
            href="/contact"
            onClick={() => setMenuOpen(false)}
            className="w-full justify-center"
          >
            {lang === 'en' ? 'Book experience' : 'Reservar experiencia'}
          </Button>
          <p className="mt-5 font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-[#A56E52]">
            {lang === 'en' ? 'Events that transform.' : 'Eventos que transforman.'}
          </p>
        </div>
      </div>
    </>
  );
}
