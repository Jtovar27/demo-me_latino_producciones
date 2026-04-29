import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { getSiteConfig } from '@/app/actions/settings';
import { getLang } from '@/lib/i18n/getLang';

export default async function Footer() {
  const year = new Date().getFullYear();
  const [{ data: config }, lang] = await Promise.all([getSiteConfig(), getLang()]);

  const email        = config?.contact_email || 'hola@melatinopr.com';
  const instagramUrl = config?.instagram_url  || null;
  const linkedinUrl  = config?.linkedin_url   || null;
  const facebookUrl  = config?.facebook_url   || null;
  const tagline      = config?.site_tagline   || '+ Talentos\n+ Experiencias\n+ Conexiones';

  const navLinks = [
    { label: lang === 'en' ? 'Home'    : 'Inicio',   href: '/' },
    { label: lang === 'en' ? 'About'   : 'Nosotros', href: '/about' },
    { label: lang === 'en' ? 'Events'  : 'Eventos',  href: '/events' },
    { label: 'Speakers',                              href: '/speakers' },
    { label: lang === 'en' ? 'Gallery' : 'Galería',  href: '/gallery' },
    { label: lang === 'en' ? 'Contact' : 'Contacto', href: '/contact' },
  ];

  const experienciasLinks = [
    { label: 'Personal Happiness',                href: '/experiences#personal-happiness' },
    { label: 'Corporate Happiness',               href: '/experiences#corporate-happiness' },
    { label: 'Experience & Business Summit',      href: '/experiences#summit' },
    { label: 'The Real Happiness MasterClass',    href: '/the-real-happiness' },
    { label: lang === 'en' ? 'Speakers & Community' : 'Speakers & Comunidad', href: '/speakers' },
  ];

  return (
    <footer
      className="bg-[#2A2421]"
      aria-label="Footer"
    >
      {/* Top rule */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="h-px bg-[#5B4638]/40" />
      </div>

      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Column 1 — Brand */}
          <div className="flex flex-col gap-5">
            <Link href="/" className="transition-opacity hover:opacity-70 self-start">
              <Logo variant="light" size="md" />
            </Link>
            <p className="font-serif text-lg font-normal leading-snug text-[#D7C6B2]">
              {tagline.split('\n').map((line, i) => (
                <span key={i}>{line}{i < tagline.split('\n').length - 1 && <br />}</span>
              ))}
            </p>
            <p className="font-sans text-xs leading-relaxed text-[#5B4638]">
              {lang === 'en'
                ? 'We support the Latino community at every stage of growth — personal, business, and cultural — through experiences that inspire and connect.'
                : 'Apoyamos a la comunidad latina en cada etapa de su crecimiento — personal, empresarial y cultural — a través de experiencias que inspiran y conectan.'}
            </p>
          </div>

          {/* Column 2 — Navigation */}
          <div className="flex flex-col gap-5">
            <p className="font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-[#A56E52]">
              {lang === 'en' ? 'Navigation' : 'Navegación'}
            </p>
            <nav className="flex flex-col gap-3" aria-label="Footer navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-sans text-sm text-[#EAE1D6] transition-colors duration-200 hover:text-[#A56E52]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3 — Experiencias */}
          <div className="flex flex-col gap-5">
            <p className="font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-[#A56E52]">
              {lang === 'en' ? 'Experiences' : 'Experiencias'}
            </p>
            <nav className="flex flex-col gap-3" aria-label="Experiencias navigation">
              {experienciasLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-sans text-sm text-[#EAE1D6] transition-colors duration-200 hover:text-[#A56E52]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 4 — Contacto */}
          <div className="flex flex-col gap-5">
            <p className="font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-[#A56E52]">
              {lang === 'en' ? 'Contact' : 'Contacto'}
            </p>
            <div className="flex flex-col gap-3">
              <a
                href={`mailto:${email}`}
                className="font-sans text-sm text-[#EAE1D6] transition-colors duration-200 hover:text-[#A56E52]"
              >
                {email}
              </a>

              {(instagramUrl || linkedinUrl || facebookUrl) && (
                <div className="mt-2 flex flex-col gap-2">
                  <p className="font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">
                    {lang === 'en' ? 'Social Media' : 'Redes Sociales'}
                  </p>
                  <div className="flex flex-col gap-2">
                    {instagramUrl && (
                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-sans text-sm text-[#EAE1D6] transition-colors duration-200 hover:text-[#A56E52]"
                        aria-label={lang === 'en' ? 'ME Producciones on Instagram' : 'Instagram de ME Producciones'}
                      >
                        Instagram
                      </a>
                    )}
                    {linkedinUrl && (
                      <a
                        href={linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-sans text-sm text-[#EAE1D6] transition-colors duration-200 hover:text-[#A56E52]"
                        aria-label={lang === 'en' ? 'ME Producciones on LinkedIn' : 'LinkedIn de ME Producciones'}
                      >
                        LinkedIn
                      </a>
                    )}
                    {facebookUrl && (
                      <a
                        href={facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-sans text-sm text-[#EAE1D6] transition-colors duration-200 hover:text-[#A56E52]"
                        aria-label={lang === 'en' ? 'ME Producciones on Facebook' : 'Facebook de ME Producciones'}
                      >
                        Facebook
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="h-px bg-[#5B4638]/40" />
        <div className="flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
          <p className="font-sans text-[11px] text-[#5B4638]">
            &copy; {year} ME Producciones. {lang === 'en' ? 'All rights reserved.' : 'Todos los derechos reservados.'}
          </p>
          <div className="flex items-center gap-6">
            <p className="font-sans text-[11px] uppercase tracking-widest text-[#5B4638]">
              ME Producciones
            </p>
            <Link
              href="/admin"
              className="font-sans text-[9px] uppercase tracking-widest text-[#5B4638]/40 hover:text-[#5B4638] transition-colors"
              aria-label={lang === 'en' ? 'Admin portal' : 'Portal administrativo'}
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
