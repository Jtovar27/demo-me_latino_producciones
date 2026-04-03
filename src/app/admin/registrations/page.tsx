'use client';

import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import { adminData, type RegistrationStatus } from '@/lib/data';

const allRegs = adminData.recentRegistrations;

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

const statusConfig: Record<RegistrationStatus, { label: string; styles: string }> = {
  confirmed: { label: 'Confirmado', styles: 'border-[#A56E52] text-[#A56E52]' },
  pending: { label: 'Pendiente', styles: 'border-[#D7C6B2] text-[#5B4638]' },
  cancelled: { label: 'Cancelado', styles: 'border-[#2A2421] text-[#2A2421]' },
};

type FilterStatus = 'all' | RegistrationStatus;

const filterOptions: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'confirmed', label: 'Confirmados' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'cancelled', label: 'Cancelados' },
];

export default function AdminRegistrationsPage() {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [exporting, setExporting] = useState(false);

  const filtered =
    filter === 'all' ? allRegs : allRegs.filter((r) => r.status === filter);

  const total = allRegs.length;
  const confirmed = allRegs.filter((r) => r.status === 'confirmed').length;
  const pending = allRegs.filter((r) => r.status === 'pending').length;
  const totalRev = allRegs
    .filter((r) => r.status === 'confirmed')
    .reduce((sum, r) => sum + r.amount, 0);

  function handleExport() {
    setExporting(true);
    setTimeout(() => setExporting(false), 1500);
  }

  return (
    <AdminLayout>
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h2 className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">
            Registros
          </h2>
          <p className="mt-1 font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">
            {total} registros totales
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          loading={exporting}
          onClick={handleExport}
        >
          {exporting ? 'Exportando...' : 'Exportar CSV'}
        </Button>
      </div>

      {/* 3 Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        <div className="border border-[#EAE1D6] bg-[#FDFAF7] px-6 py-5">
          <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-[#5B4638]">
            Total Registros
          </p>
          <p className="mt-2 font-sans text-3xl font-light text-[#2A2421]">{total}</p>
        </div>
        <div className="border border-[#EAE1D6] bg-[#FDFAF7] px-6 py-5">
          <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-[#5B4638]">
            Confirmados
          </p>
          <p className="mt-2 font-sans text-3xl font-light text-[#A56E52]">{confirmed}</p>
        </div>
        <div className="border border-[#EAE1D6] bg-[#FDFAF7] px-6 py-5">
          <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-[#5B4638]">
            Pendientes
          </p>
          <p className="mt-2 font-sans text-3xl font-light text-[#2A2421]">{pending}</p>
        </div>
        <div className="border border-[#A56E52]/30 bg-[#A56E52]/5 px-6 py-5">
          <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-[#5B4638]">
            Ingresos
          </p>
          <p className="mt-2 font-sans text-3xl font-light text-[#2A2421]">
            {formatCurrency(totalRev)}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-0 mb-6">
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
              <th className="px-7 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">
                Nombre
              </th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden md:table-cell">
                Email
              </th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden md:table-cell">
                Evento
              </th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden lg:table-cell">
                Fecha
              </th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">
                Estado
              </th>
              <th className="px-7 py-5 text-right font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">
                Monto
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-7 py-14 text-center font-sans text-xs uppercase tracking-widest text-[#5B4638]/50"
                >
                  Sin registros para este filtro
                </td>
              </tr>
            ) : (
              filtered.map((reg, i) => {
                const status = statusConfig[reg.status];
                return (
                  <tr
                    key={i}
                    className="border-b border-[#EAE1D6]/60 hover:bg-[#F7F3EE]/30 transition-colors"
                  >
                    <td className="px-7 py-6">
                      <p className="font-sans text-sm text-[#2A2421] font-medium">{reg.name}</p>
                    </td>
                    <td className="px-4 py-6 hidden md:table-cell">
                      <p className="font-sans text-xs text-[#5B4638]">{reg.email}</p>
                    </td>
                    <td className="px-4 py-6 hidden md:table-cell">
                      <p className="font-sans text-xs text-[#2A2421] max-w-[200px] truncate">
                        {reg.event}
                      </p>
                    </td>
                    <td className="px-4 py-6 hidden lg:table-cell">
                      <p className="font-sans text-xs text-[#5B4638]">{formatDate(reg.date)}</p>
                    </td>
                    <td className="px-4 py-6">
                      <span
                        className={`border px-2.5 py-1 font-sans text-[9px] uppercase tracking-widest ${status.styles}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-7 py-6 text-right">
                      <p className="font-sans text-sm text-[#2A2421] font-medium">
                        {formatCurrency(reg.amount)}
                      </p>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 font-sans text-[10px] uppercase tracking-widest text-[#5B4638]/50">
        Mostrando {filtered.length} de {total} registros
      </p>
    </AdminLayout>
  );
}
