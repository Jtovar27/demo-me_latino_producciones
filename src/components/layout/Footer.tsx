import Link from 'next/link';

const navLinks = [
  { label: 'Inicio', href: '/' },
  { label: 'Nosotros', href: '/about' },
  { label: 'Eventos', href: '/events' },
  { label: 'Ponentes', href: '/speakers' },
  { label: 'Galería', href: '/gallery' },
  { label: 'Contacto', href: '/contact' },
];

const experienciasLinks = [
  { label: 'Cenas de Gala', href: '/experiences#cenas' },
  { label: 'Conferencias', href: '/experiences#conferencias' },
  { label: 'Retiros Ejecutivos', href: '/experiences#retiros' },
  { label: 'Lanzamientos', href: '/experiences#lanzamientos' },
  { label: 'Networking Premium', href: '/experiences#networking' },
];

export default function Footer() {
  const year = new Date().getFullYear();

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
            <Link
              href="/"
              className="font-sans text-xs font-semibold uppercase tracking-[0.3em] text-[#F7F3EE] transition-opacity hover:opacity-70"
            >
              ME Latino
            </Link>
            <p
              className="font-serif text-lg font-normal leading-snug text-[#D7C6B2]"

            >
              Eventos que inspiran.<br />Experiencias que perduran.
            </p>
            <p className="font-sans text-xs leading-relaxed text-[#5B4638]">
              Producción de eventos premium para la comunidad latina — con visión, elegancia y propósito.
            </p>
          </div>

          {/* Column 2 — Navigation */}
          <div className="flex flex-col gap-5">
            <p className="font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-[#A56E52]">
              Navegación
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
              Experiencias
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
              Contacto
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:hola@melatinopr.com"
                className="font-sans text-sm text-[#EAE1D6] transition-colors duration-200 hover:text-[#A56E52]"
              >
                hola@melatinopr.com
              </a>

              <div className="mt-2 flex flex-col gap-2">
                <p className="font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">
                  Redes Sociales
                </p>
                <div className="flex flex-col gap-2">
                  <a
                    href="#"
                    className="font-sans text-sm text-[#EAE1D6] transition-colors duration-200 hover:text-[#A56E52]"
                    aria-label="Instagram de ME Latino Producciones"
                  >
                    Instagram
                  </a>
                  <a
                    href="#"
                    className="font-sans text-sm text-[#EAE1D6] transition-colors duration-200 hover:text-[#A56E52]"
                    aria-label="LinkedIn de ME Latino Producciones"
                  >
                    LinkedIn
                  </a>
                  <a
                    href="#"
                    className="font-sans text-sm text-[#EAE1D6] transition-colors duration-200 hover:text-[#A56E52]"
                    aria-label="Facebook de ME Latino Producciones"
                  >
                    Facebook
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="h-px bg-[#5B4638]/40" />
        <div className="flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
          <p className="font-sans text-[11px] text-[#5B4638]">
            &copy; {year} ME Latino Producciones. Todos los derechos reservados.
          </p>
          <p className="font-sans text-[11px] uppercase tracking-widest text-[#5B4638]">
            ME Latino Producciones
          </p>
        </div>
      </div>
    </footer>
  );
}
