'use client';

import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import { getBookings, updateBooking } from '@/app/actions/bookings';
import type { DBBooking } from '@/types/supabase';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { t, tr } from '@/lib/i18n/translations';

// ── Config ───────────────────────────────────────

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'attended';

const statusStyles: Record<BookingStatus, string> = {
  pending:   'border-[#D7C6B2] text-[#5B4638]',
  confirmed: 'border-[#A56E52] text-[#A56E52]',
  cancelled: 'border-[#2A2421] text-[#2A2421]',
  attended:  'border-[#5B4638] bg-[#EAE1D6] text-[#5B4638]',
};

type FilterStatus = 'all' | BookingStatus;

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Page ─────────────────────────────────────────

export default function AdminBookingsPage() {
  const [bookings, setBookings]         = useState<DBBooking[]>([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState<FilterStatus>('all');
  const [detail, setDetail]             = useState<DBBooking | null>(null);
  const [panelStatus, setPanelStatus]   = useState<BookingStatus>('pending');
  const [internalNote, setInternalNote] = useState('');
  const [saving, setSaving]             = useState(false);
  const [toast, setToast]               = useState('');
  const { lang } = useLanguage();
  const ab = t.adminBookings;

  useEffect(() => {
    getBookings().then(({ data }) => {
      setBookings(data as DBBooking[]);
      setLoading(false);
    });
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  }

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  const counts = {
    pending:   bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    attended:  bookings.filter((b) => b.status === 'attended').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };

  const statusLabels: Record<BookingStatus, string> = {
    pending:   tr(ab.statusPending, lang),
    confirmed: tr(ab.statusConfirmed, lang),
    cancelled: tr(ab.statusCancelled, lang),
    attended:  tr(ab.statusAttended, lang),
  };

  const filterOptions: { value: FilterStatus; label: string }[] = [
    { value: 'all',       label: tr(ab.all, lang) },
    { value: 'pending',   label: tr(ab.filterPending, lang) },
    { value: 'confirmed', label: tr(ab.filterConfirmed, lang) },
    { value: 'attended',  label: tr(ab.filterAttended, lang) },
    { value: 'cancelled', label: tr(ab.filterCancelled, lang) },
  ];

  function openDetail(b: DBBooking) {
    setDetail(b);
    setPanelStatus((b.status as BookingStatus) || 'pending');
    setInternalNote(b.internal_notes ?? '');
  }

  async function applyChanges() {
    if (!detail) return;
    setSaving(true);
    const result = await updateBooking(detail.id, {
      status: panelStatus,
      internal_notes: internalNote,
    });
    if (result.error) {
      showToast(tr(ab.toastError, lang));
    } else {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === detail.id
            ? { ...b, status: panelStatus, internal_notes: internalNote }
            : b
        )
      );
      setDetail(null);
      showToast(tr(ab.toastSaved, lang));
    }
    setSaving(false);
  }

  function exportCSV() {
    const headers = ['Nombre', 'Email', 'Teléfono', 'Evento', 'Tipo', 'Personas', 'Fuente', 'Estado', 'Fecha', 'Notas'];
    const rows = bookings.map((b) => [
      b.name,
      b.email,
      b.phone ?? '',
      b.event_name ?? '',
      b.booking_type ?? '',
      String(b.guests),
      b.source ?? '',
      b.status,
      new Date(b.submitted_at).toISOString().split('T')[0],
      (b.notes ?? '').replace(/"/g, '""'),
    ].map((v) => `"${v}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservas-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function toggleFollowUp(id: string) {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return;
    const newVal = !booking.follow_up;
    await updateBooking(id, { follow_up: newVal });
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, follow_up: newVal } : b));
  }

  return (
    <AdminLayout>
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 border border-[#A56E52] bg-[#FDFAF7] px-6 py-4 shadow-lg">
          <p className="font-sans text-xs uppercase tracking-widest text-[#A56E52]">{toast}</p>
        </div>
      )}

      {/* Detail panel */}
      {detail && (
        <>
          <div className="fixed inset-0 z-40 bg-[#2A2421]/30" onClick={() => setDetail(null)} />
          <div className="fixed right-0 top-0 z-50 h-full w-full max-w-[320px] bg-[#FDFAF7] shadow-2xl border-l border-[#EAE1D6] overflow-y-auto">
            <div className="border-b border-[#EAE1D6] px-6 py-5 flex items-center justify-between">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#2A2421]">{tr(ab.detailTitle, lang)}</p>
              <button onClick={() => setDetail(null)} className="text-[#5B4638] hover:text-[#2A2421] text-xl leading-none">×</button>
            </div>
            <div className="px-6 py-6 space-y-4">
              {[
                { label: 'Nombre',   value: detail.name },
                { label: 'Email',    value: detail.email },
                { label: 'Teléfono', value: detail.phone ?? '—' },
                { label: 'Evento',   value: detail.event_name ?? '—' },
                { label: 'Tipo',     value: detail.booking_type ?? '—' },
                { label: 'Personas', value: String(detail.guests) },
                { label: 'Fuente',   value: detail.source ?? '—' },
                { label: 'Fecha',    value: formatDate(detail.submitted_at) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-0.5">{label}</p>
                  <p className="font-sans text-xs text-[#2A2421]">{value}</p>
                </div>
              ))}
              {detail.notes && (
                <div>
                  <p className="font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-0.5">Notas del cliente</p>
                  <p className="font-sans text-xs text-[#2A2421] italic">{detail.notes}</p>
                </div>
              )}
              <div className="pt-4 border-t border-[#EAE1D6] space-y-3">
                <div>
                  <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">{tr(ab.changeStatus, lang)}</label>
                  <select
                    value={panelStatus}
                    onChange={(e) => setPanelStatus(e.target.value as BookingStatus)}
                    className="w-full border border-[#D7C6B2] bg-white px-3 py-2.5 font-sans text-xs text-[#2A2421] outline-none focus:border-[#5B4638] transition-colors"
                  >
                    <option value="pending">{tr(ab.statusPending, lang)}</option>
                    <option value="confirmed">{tr(ab.statusConfirmed, lang)}</option>
                    <option value="attended">{tr(ab.statusAttended, lang)}</option>
                    <option value="cancelled">{tr(ab.statusCancelled, lang)}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">{tr(ab.internalNotes, lang)}</label>
                  <textarea
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    rows={3}
                    placeholder="Notas del equipo..."
                    className="w-full border border-[#D7C6B2] bg-white px-3 py-2.5 font-sans text-xs text-[#2A2421] outline-none focus:border-[#5B4638] transition-colors resize-none"
                  />
                </div>
                <button
                  onClick={applyChanges}
                  disabled={saving}
                  className="w-full border border-[#2A2421] bg-[#2A2421] py-2.5 font-sans text-[9px] uppercase tracking-widest text-[#F7F3EE] hover:bg-[#5B4638] transition-colors disabled:opacity-50"
                >
                  {saving ? tr(ab.saving, lang) : tr(ab.saveChanges, lang)}
                </button>
                <button
                  onClick={() => setDetail(null)}
                  className="w-full border border-[#D7C6B2] py-2.5 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] transition-colors"
                >
                  {tr(ab.close, lang)}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h2 className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">{tr(ab.pageTitle, lang)}</h2>
          <p className="mt-1 font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">
            {loading ? tr(ab.loading, lang) : `${bookings.length} ${tr(ab.totalBookings, lang)}`}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={exportCSV}>{tr(ab.exportCsv, lang)}</Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        {(Object.entries(counts) as [BookingStatus, number][]).map(([status, count]) => (
          <div
            key={status}
            onClick={() => setFilter(filter === status ? 'all' : status)}
            className={`border bg-[#FDFAF7] px-6 py-5 cursor-pointer transition-colors ${
              filter === status ? 'border-[#2A2421]' : 'border-[#EAE1D6] hover:border-[#D7C6B2]'
            }`}
          >
            <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-[#5B4638]">
              {statusLabels[status]}
            </p>
            <p className="mt-2 font-sans text-3xl font-light text-[#2A2421]">{count}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-0 mb-6">
        {filterOptions.map((opt) => {
          const count = opt.value === 'all' ? bookings.length : counts[opt.value as BookingStatus];
          return (
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
              <span className="ml-1.5 opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="border border-[#EAE1D6] bg-[#FDFAF7] overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#EAE1D6]">
              <th className="px-7 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">{tr(ab.personCol, lang)}</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden md:table-cell">{tr(ab.eventCol, lang)}</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden lg:table-cell">{tr(ab.dateCol, lang)}</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden lg:table-cell">{tr(ab.sourceCol, lang)}</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">{tr(ab.statusCol, lang)}</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden xl:table-cell">Seguim.</th>
              <th className="px-7 py-5 text-right font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-7 py-14 text-center font-sans text-xs uppercase tracking-widest text-[#5B4638]/50">
                  {tr(ab.loadingBookings, lang)}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-7 py-14 text-center font-sans text-xs uppercase tracking-widest text-[#5B4638]/50">
                  {tr(ab.noResults, lang)}
                </td>
              </tr>
            ) : (
              filtered.map((b) => {
                const styles = statusStyles[(b.status as BookingStatus)] ?? statusStyles.pending;
                const label = statusLabels[(b.status as BookingStatus)] ?? statusLabels.pending;
                const isOpen = detail?.id === b.id;
                return (
                  <tr key={b.id} className={`border-b border-[#EAE1D6]/60 transition-colors ${isOpen ? 'bg-[#EAE1D6]' : 'hover:bg-[#F7F3EE]'}`}>
                    <td className="px-7 py-6">
                      <p className="font-sans text-sm text-[#2A2421] font-medium">{b.name}</p>
                      <p className="font-sans text-[10px] text-[#5B4638]">{b.email}</p>
                      <p className="font-sans text-[10px] text-[#A56E52]">{b.guests} persona{b.guests !== 1 ? 's' : ''}</p>
                    </td>
                    <td className="px-4 py-6 hidden md:table-cell">
                      <p className="font-sans text-xs text-[#2A2421] max-w-[180px] truncate">{b.event_name ?? '—'}</p>
                      <p className="font-sans text-[10px] text-[#5B4638]">{b.booking_type ?? '—'}</p>
                    </td>
                    <td className="px-4 py-6 hidden lg:table-cell">
                      <p className="font-sans text-xs text-[#5B4638]">{formatDate(b.submitted_at)}</p>
                    </td>
                    <td className="px-4 py-6 hidden lg:table-cell">
                      <p className="font-sans text-[10px] uppercase tracking-wider text-[#5B4638]">{b.source ?? '—'}</p>
                    </td>
                    <td className="px-4 py-6">
                      <span className={`border px-2.5 py-1 font-sans text-[9px] uppercase tracking-widest ${styles}`}>
                        {label}
                      </span>
                    </td>
                    <td className="px-4 py-6 hidden xl:table-cell">
                      <button
                        onClick={() => toggleFollowUp(b.id)}
                        className={`font-sans text-[9px] uppercase tracking-widest border px-2 py-1 transition-colors ${
                          b.follow_up
                            ? 'border-[#A56E52] text-[#A56E52]'
                            : 'border-[#D7C6B2] text-[#5B4638] hover:border-[#A56E52] hover:text-[#A56E52]'
                        }`}
                      >
                        {b.follow_up ? 'Activo' : 'Marcar'}
                      </button>
                    </td>
                    <td className="px-7 py-6 text-right">
                      <button
                        onClick={() => isOpen ? setDetail(null) : openDetail(b)}
                        className={`inline-flex items-center gap-1.5 border px-3 py-1.5 font-sans text-[9px] uppercase tracking-widest transition-colors ${
                          isOpen
                            ? 'border-[#2A2421] bg-[#2A2421] text-[#F7F3EE]'
                            : 'border-[#D7C6B2] text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421]'
                        }`}
                      >
                        <Eye size={11} strokeWidth={1.5} />
                        {isOpen ? tr(ab.close, lang) : 'Ver'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 font-sans text-[10px] uppercase tracking-widest text-[#5B4638]/50">
        {filtered.length} {tr(ab.shown, lang)}
      </p>
    </AdminLayout>
  );
}
