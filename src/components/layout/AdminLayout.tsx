'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode, useState } from 'react';
import Logo from '@/components/ui/Logo';
import { logoutAction } from '@/app/actions/auth';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Mic,
  Building2,
  Image,
  Inbox,
  Settings,
  Menu,
  X,
  Star,
  BookOpen,
  Sparkles,
  GalleryHorizontal,
  Trophy,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard',    href: '/admin',                icon: LayoutDashboard },
  { label: 'Sitio',        href: '/admin/settings',       icon: Settings },
  { label: 'Hero',         href: '/admin/hero',           icon: GalleryHorizontal },
  { label: 'Insignia',     href: '/admin/flagship',       icon: Trophy },
  { label: 'Eventos',      href: '/admin/events',         icon: Calendar },
  { label: 'Experiencias', href: '/admin/experiences',    icon: Sparkles },
  { label: 'Reservas',     href: '/admin/bookings',       icon: BookOpen },
  { label: 'Registros',    href: '/admin/registrations',  icon: Users },
  { label: 'Speakers',     href: '/admin/speakers',       icon: Mic },
  { label: 'Reviews',      href: '/admin/reviews',        icon: Star },
  { label: 'Sponsors',     href: '/admin/sponsors',       icon: Building2 },
  { label: 'Media',        href: '/admin/media',          icon: Image },
  { label: 'Leads',        href: '/admin/leads',          icon: Inbox },
];

function pageTitleFromPath(pathname: string): string {
  const match = navItems.find((item) => item.href === pathname);
  if (match) return match.label;
  const segment = pathname.split('/').filter(Boolean).pop() ?? 'Dashboard';
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

/**
 * Defined outside AdminLayout so the component identity is stable across renders.
 * Creating components inside render resets their state on every parent re-render.
 */
function SidebarContent({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-[#5B4638]/30 px-6">
        <Link
          href="/admin"
          className="transition-opacity hover:opacity-70"
          onClick={onClose}
          aria-label="Mónica Espinoza Producciones — Admin"
        >
          <Logo variant="light" size="sm" />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4" aria-label="Admin navigation">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={[
                'group flex items-center gap-3 rounded-none px-3 py-2.5 font-sans text-[11px] font-medium uppercase tracking-widest transition-colors duration-150',
                isActive
                  ? 'border-l-2 border-[#A56E52] bg-[#5B4638]/20 pl-[10px] text-[#A56E52]'
                  : 'border-l-2 border-transparent text-[#D7C6B2] hover:border-[#5B4638] hover:bg-[#5B4638]/10 hover:text-[#EAE1D6]',
              ].join(' ')}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                size={14}
                strokeWidth={1.75}
                className={isActive ? 'text-[#A56E52]' : 'text-[#5B4638] group-hover:text-[#EAE1D6]'}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar footer */}
      <div className="border-t border-[#5B4638]/30 px-6 py-4 flex flex-col gap-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:text-[#D7C6B2] transition-colors"
        >
          ↗ Ver sitio web
        </a>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full text-left font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:text-[#A56E52] transition-colors"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageTitle = pageTitleFromPath(pathname);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-[#FDFAF7]">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 bg-[#2A2421] lg:flex lg:flex-col">
        <SidebarContent onClose={closeSidebar} />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 w-56 bg-[#2A2421] transition-transform duration-300 lg:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        aria-label="Mobile admin navigation"
      >
        <button
          className="absolute right-4 top-4 p-1 text-[#D7C6B2] hover:text-[#F7F3EE]"
          onClick={closeSidebar}
          aria-label="Cerrar menú"
        >
          <X size={16} strokeWidth={1.5} />
        </button>
        <SidebarContent onClose={closeSidebar} />
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-[#EAE1D6] bg-[#FDFAF7] px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              className="p-1 text-[#5B4638] hover:text-[#2A2421] lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu size={18} strokeWidth={1.5} />
            </button>
            <h1 className="font-sans text-sm font-medium uppercase tracking-widest text-[#2A2421]">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center bg-[#2A2421] font-sans text-[10px] font-semibold uppercase tracking-widest text-[#F7F3EE]"
              aria-label="Avatar de usuario"
            >
              MP
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
