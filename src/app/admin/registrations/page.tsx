'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import { getBookings } from '@/app/actions/bookings';
import type { DBBooking } from '@/types/supabase';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { t, tr } from '@/lib/i18n/translations';

type RegistrationStatus = 'confirmed' | 'pending' | 'cancelled' | 'attended';
type FilterStatus = 'all' | RegistrationStatus;

const statusStyles: Record<RegistrationStatus, string> = {
  confirmed: 'border-[#A56E52] text-[#A56E52]',
  pending:   'border-[#D7C6B2] text-[#5B4638]',
  cancelled: 'border-[#2A2421] text-[#2A2421]',
  attended:  'border-[#5B4638] bg-[#EAE1D6] text-[#5B4638]',
};

const filterValues: FilterStatus[] = ['all', 'confirmed', 'pending', 'attended', 'cancelled'];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AdminRegistrationsPage() {
  const { lang } = useLanguage();
  const ar = t.adminRegistrations;

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

  function formatCurrency(n: number) {
    return n === 0
      ? tr(ar.free, lang)
      : new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(n);
  }

  function getStatusLabel(status: RegistrationStatus): string {
    const map: Record<RegistrationStatus, typeof ar.statusConfirmed> = {
      confirmed: ar.statusConfirmed,
      pending:   ar.statusPending,
      cancelled: ar.statusCancelled,
      attended:  ar.statusAttended,
    };
    return tr(map[status], lang);
  }

  function getFilterLabel(value: FilterStatus): string {
    if (value === 'all') return lang === 'es' ? 'Todos' : 'All';
    return getStatusLabel(value as RegistrationStatus);
  }

  return (
    <AdminLayout>
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h2 className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">
            {tr(ar.pageTitle, lang)}
          </h2>
          <p className="mt-1 font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">
            {loading ? tr(ar.loading, lang) : `${total} ${tr(ar.totalRegistrations, lang)}`}
          </p>
        </div>
        <Button variant="ghost" size="sm">{tr(ar.exportCsv, lang)}</Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        <div className="border border-[#EAE1D6] bg-[#FDFAF7] px-6 py-5">
          <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-[#5B4638]">{tr(ar.totalCard, lang)}</p>
          <p className="mt-2 font-sans text-3xl font-light text-[#2A2421]">{total}</p>
        </div>
        <div className="border border-[#EAE1D6] bg-[#FDFAF7] px-6 py-5">
          <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-[#5B4638]">{tr(ar.confirmedCard, lang)}</p>
          <p className="mt-2 font-sans text-3xl font-light text-[#A56E52]">{confirmed}</p>
        </div>
        <div className="border border-[#EAE1D6] bg-[#FDFAF7] px-6 py-5">
          <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-[#5B4638]">{tr(ar.pendingCard, lang)}</p>
          <p className="mt-2 font-sans text-3xl font-light text-[#2A2421]">{pending}</p>
        </div>
        <div className="border border-[#A56E52]/30 bg-[#A56E52]/5 px-6 py-5">
          <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-[#5B4638]">{tr(ar.revenueCard, lang)}</p>
          <p className="mt-2 font-sans text-3xl font-light text-[#2A2421]">{formatCurrency(totalRev)}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-0 mb-6">
        {filterValues.map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={[
              'px-4 py-2.5 border font-sans text-[10px] uppercase tracking-widest transition-colors -ml-px first:ml-0',
              filter === value
                ? 'border-[#2A2421] bg-[#2A2421] text-[#F7F3EE] z-10 relative'
                : 'border-[#D7C6B2] text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421]',
            ].join(' ')}
          >
            {getFilterLabel(value)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="border border-[#EAE1D6] bg-[#FDFAF7] overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#EAE1D6]">
              <th className="px-7 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">{tr(ar.nameCol, lang)}</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden md:table-cell">{tr(ar.emailCol, lang)}</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden md:table-cell">{tr(ar.eventCol, lang)}</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden lg:table-cell">{tr(ar.dateCol, lang)}</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">{tr(ar.statusCol, lang)}</th>
              <th className="px-7 py-5 text-right font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">{tr(ar.amountCol, lang)}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-7 py-14 text-center font-sans text-xs uppercase tracking-widest text-[#5B4638]/50">
                  {tr(ar.loadingReg, lang)}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-7 py-14 text-center font-sans text-xs uppercase tracking-widest text-[#5B4638]/50">
                  {tr(ar.noResults, lang)}
                </td>
              </tr>
            ) : (
              filtered.map((b) => {
                const status = (b.status as RegistrationStatus) ?? 'pending';
                const styles = statusStyles[status] ?? statusStyles.pending;
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
                      <span className={`border px-2.5 py-1 font-sans text-[9px] uppercase tracking-widest ${styles}`}>
                        {getStatusLabel(status)}
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
        {tr({ es: 'Mostrando', en: 'Showing' }, lang)} {loading ? '…' : filtered.length} {tr({ es: 'de', en: 'of' }, lang)} {loading ? '…' : total} {tr(ar.totalRegistrations, lang)}
      </p>
    </AdminLayout>
  );
}
