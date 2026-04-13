'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import { getBookings } from '@/app/actions/bookings';
import type { DBBooking } from '@/types/supabase';

type RegistrationStatus = 'confirmed' | 'pending' | 'cancelled' | 'attended';
type FilterStatus = 'all' | RegistrationStatus;

const statusConfig: Record<RegistrationStatus, { label: string; styles: string }> = {
  confirmed: { label: 'Confirmado', styles: 'border-[#A56E52] text-[#A56E52]' },
  pending:   { label: 'Pendiente',  styles: 'border-[#D7C6B2] text-[#5B4638]' },
  cancelled: { label: 'Cancelado',  styles: 'border-[#2A2421] text-[#2A2421]' },
  attended:  { label: 'Asistió',    styles: 'border-[#5B4638] bg-[#EAE1D6] text-[#5B4638]' },
};

const filterOptions: { value: FilterStatus; label: string }[] = [
  { value: 'all',       label: 'Todos' },
  { value: 'confirmed', label: 'Confirmados' },
  { value: 'pending',   label: 'Pendientes' },
  { value: 'attended',  label: 'Asistieron' },
  { value: 'cancelled', label: 'Cancelados' },
];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCurrency(n: number) {
  return n === 0
    ? 'Gratis'
    : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(n);
}

export default function AdminRegistrationsPage() {
  const [bookings, setBookings] = useState<DBBooking[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<FilterStatus>('all');

  useEffect(() => {
    getBookings().then(({ data }) => {
      setBookings(data as DBBooking[]);
      setLoading(false);
    });
  }, []);

  const filtered =
    filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  const total     = bookings.length;
  const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
  const pending   = bookings.filter((b) => b.status === 'pending').length;
  const totalRev  = bookings
    .filter((b) => b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.amount ?? 0), 0);

  return (
    <AdminLayout>
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h2 className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">
            Registros
          </h2>
          <p className="mt-1 font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">
            {loading ? 'Cargando...' : `${total} registros totales`}
          </p>
        </div>
        <Button variant="ghost" size="sm">Exportar CSV</Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        <div className="border border-[#EAE1D6] bg-[#FDFAF7] px-6 py-5">
          <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-[#5B4638]">Total Registros</p>
          <p className="mt-2 font-sans text-3xl font-light text-[#2A2421]">{total}</p>
        </div>
        <div className="border border-[#EAE1D6] bg-[#FDFAF7] px-6 py-5">
          <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-[#5B4638]">Confirmados</p>
          <p className="mt-2 font-sans text-3xl font-light text-[#A56E52]">{confirmed}</p>
        </div>
        <div className="border border-[#EAE1D6] bg-[#FDFAF7] px-6 py-5">
          <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-[#5B4638]">Pendientes</p>
          <p className="mt-2 font-sans text-3xl font-light text-[#2A2421]">{pending}</p>
        </div>
        <div className="border border-[#A56E52]/30 bg-[#A56E52]/5 px-6 py-5">
          <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-[#5B4638]">Ingresos</p>
          <p className="mt-2 font-sans text-3xl font-light text-[#2A2421]">{formatCurrency(totalRev)}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-0 mb-6">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={[
              'px-4 py-2.5 border font-sans text-[10px] uppercase tracking-widest transition-colors -ml-px first:ml-0',
              filter === opt.value
                ? 'border-[#2A2421] bg-[#2A2421] text-[#F7F3EE] z-10 relative'
                : 'border-[#D7C6B2] text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421]',
            ].join(' ')}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="border border-[#EAE1D6] bg-[#FDFAF7] overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#EAE1D6]">
              <th className="px-7 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">Nombre</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden md:table-cell">Email</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden md:table-cell">Evento</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden lg:table-cell">Fecha</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">Estado</th>
              <th className="px-7 py-5 text-right font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">Monto</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-7 py-14 text-center font-sans text-xs uppercase tracking-widest text-[#5B4638]/50">
                  Cargando registros...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-7 py-14 text-center font-sans text-xs uppercase tracking-widest text-[#5B4638]/50">
                  Sin registros para este filtro
                </td>
              </tr>
            ) : (
              filtered.map((b) => {
                const sc = statusConfig[(b.status as RegistrationStatus)] ?? statusConfig.pending;
                return (
                  <tr key={b.id} className="border-b border-[#EAE1D6]/60 hover:bg-[#F7F3EE]/30 transition-colors">
                    <td className="px-7 py-6">
                      <p className="font-sans text-sm text-[#2A2421] font-medium">{b.name}</p>
                    </td>
                    <td className="px-4 py-6 hidden md:table-cell">
                      <p className="font-sans text-xs text-[#5B4638]">{b.email}</p>
                    </td>
                    <td className="px-4 py-6 hidden md:table-cell">
                      <p className="font-sans text-xs text-[#2A2421] max-w-[200px] truncate">{b.event_name ?? '—'}</p>
                    </td>
                    <td className="px-4 py-6 hidden lg:table-cell">
                      <p className="font-sans text-xs text-[#5B4638]">{formatDate(b.submitted_at)}</p>
                    </td>
                    <td className="px-4 py-6">
                      <span className={`border px-2.5 py-1 font-sans text-[9px] uppercase tracking-widest ${sc.styles}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-7 py-6 text-right">
                      <p className="font-sans text-sm text-[#2A2421] font-medium">{formatCurrency(b.amount ?? 0)}</p>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 font-sans text-[10px] uppercase tracking-widest text-[#5B4638]/50">
        Mostrando {loading ? '…' : filtered.length} de {loading ? '…' : total} registros
      </p>
    </AdminLayout>
  );
}
