'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import { getLeads, updateLeadStatus } from '@/app/actions/leads';
import type { DBLead } from '@/types/supabase';

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const statusConfig: Record<LeadStatus, { label: string; styles: string }> = {
  new:       { label: 'Nuevo',      styles: 'border-[#A56E52] text-[#A56E52]' },
  contacted: { label: 'Contactado', styles: 'border-[#D7C6B2] text-[#5B4638] bg-[#EAE1D6]' },
  qualified: { label: 'Calificado', styles: 'border-[#5B4638] text-[#5B4638]' },
  converted: { label: 'Convertido', styles: 'border-[#2A2421] bg-[#2A2421] text-[#F7F3EE]' },
};

type FilterStatus = 'all' | LeadStatus;

const filterOptions: { value: FilterStatus; label: string }[] = [
  { value: 'all',       label: 'Todos' },
  { value: 'new',       label: 'Nuevo' },
  { value: 'contacted', label: 'Contactado' },
  { value: 'qualified', label: 'Calificado' },
  { value: 'converted', label: 'Convertido' },
];

export default function AdminLeadsPage() {
  const [leads, setLeads]           = useState<DBLead[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState<FilterStatus>('all');
  const [detailLead, setDetailLead] = useState<DBLead | null>(null);
  const [panelStatus, setPanelStatus] = useState<LeadStatus>('new');
  const [panelNotes, setPanelNotes]   = useState('');
  const [saving, setSaving]           = useState(false);
  const [toast, setToast]             = useState('');

  useEffect(() => {
    getLeads().then(({ data }) => {
      setLeads(data as DBLead[]);
      setLoading(false);
    });
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  }

  const filtered = filter === 'all' ? leads : leads.filter((l) => l.status === filter);

  const counts: Record<LeadStatus, number> = {
    new:       leads.filter((l) => l.status === 'new').length,
    contacted: leads.filter((l) => l.status === 'contacted').length,
    qualified: leads.filter((l) => l.status === 'qualified').length,
    converted: leads.filter((l) => l.status === 'converted').length,
  };

  function openDetail(lead: DBLead) {
    setDetailLead(lead);
    setPanelStatus((lead.status as LeadStatus) || 'new');
    setPanelNotes(lead.internal_notes ?? '');
  }

  async function applyStatusChange() {
    if (!detailLead) return;
    setSaving(true);
    const result = await updateLeadStatus(detailLead.id, panelStatus, panelNotes);
    if (result?.error) {
      showToast('Error al actualizar');
    } else {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === detailLead.id
            ? { ...l, status: panelStatus, internal_notes: panelNotes }
            : l
        )
      );
      setDetailLead(null);
      showToast('Lead actualizado');
    }
    setSaving(false);
  }

  return (
    <AdminLayout>
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 border border-[#A56E52] bg-[#FDFAF7] px-6 py-4 shadow-lg">
          <p className="font-sans text-xs uppercase tracking-widest text-[#A56E52]">{toast}</p>
        </div>
      )}

      {/* Slide-in detail panel */}
      {detailLead && (
        <>
          <div className="fixed inset-0 z-40 bg-[#2A2421]/30" onClick={() => setDetailLead(null)} />
          <div className="fixed right-0 top-0 z-50 h-full w-80 bg-[#FDFAF7] shadow-2xl border-l border-[#EAE1D6] overflow-y-auto">
            <div className="border-b border-[#EAE1D6] px-6 py-5 flex items-center justify-between">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#2A2421]">Detalle del Lead</p>
              <button onClick={() => setDetailLead(null)} className="font-sans text-[#5B4638] hover:text-[#2A2421] transition-colors text-xl leading-none">×</button>
            </div>
            <div className="px-6 py-6 space-y-5">
              <div>
                <span className={`border px-2.5 py-1 font-sans text-[9px] uppercase tracking-widest ${statusConfig[(detailLead.status as LeadStatus) ?? 'new'].styles}`}>
                  {statusConfig[(detailLead.status as LeadStatus) ?? 'new'].label}
                </span>
              </div>
              {[
                { label: 'Nombre',   value: detailLead.name },
                { label: 'Email',    value: detailLead.email },
                { label: 'Teléfono', value: detailLead.phone ?? '—' },
                { label: 'Interés',  value: detailLead.interest ?? '—' },
                { label: 'Fuente',   value: detailLead.source ?? '—' },
                { label: 'Fecha',    value: formatDate(detailLead.created_at) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-1">{label}</p>
                  <p className="font-sans text-xs text-[#2A2421]">{value}</p>
                </div>
              ))}
              {detailLead.message && (
                <div>
                  <p className="font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-1">Mensaje</p>
                  <p className="font-sans text-xs text-[#2A2421] italic">{detailLead.message}</p>
                </div>
              )}
              <div className="pt-4 border-t border-[#EAE1D6] space-y-3">
                <div>
                  <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">Cambiar estado</label>
                  <select
                    value={panelStatus}
                    onChange={(e) => setPanelStatus(e.target.value as LeadStatus)}
                    className="w-full border border-[#D7C6B2] bg-white px-3 py-2.5 font-sans text-xs text-[#2A2421] outline-none focus:border-[#5B4638] transition-colors mb-3"
                  >
                    <option value="new">Nuevo</option>
                    <option value="contacted">Contactado</option>
                    <option value="qualified">Calificado</option>
                    <option value="converted">Convertido</option>
                  </select>
                </div>
                <div>
                  <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">Notas internas</label>
                  <textarea
                    value={panelNotes}
                    onChange={(e) => setPanelNotes(e.target.value)}
                    rows={3}
                    placeholder="Notas del equipo..."
                    className="w-full border border-[#D7C6B2] bg-white px-3 py-2.5 font-sans text-xs text-[#2A2421] outline-none focus:border-[#5B4638] transition-colors resize-none"
                  />
                </div>
                <button
                  onClick={applyStatusChange}
                  disabled={saving}
                  className="w-full border border-[#2A2421] bg-[#2A2421] py-2.5 font-sans text-[9px] uppercase tracking-widest text-[#F7F3EE] hover:bg-[#5B4638] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Aplicar cambio'}
                </button>
                <button
                  onClick={() => setDetailLead(null)}
                  className="w-full border border-[#D7C6B2] py-2.5 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h2 className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">Leads</h2>
          <p className="mt-1 font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">
            {loading ? 'Cargando...' : `${leads.length} leads en total`}
          </p>
        </div>
        <Button variant="ghost" size="sm">Exportar CSV</Button>
      </div>

      {/* Status count cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        {(Object.entries(counts) as [LeadStatus, number][]).map(([status, count]) => (
          <div
            key={status}
            onClick={() => setFilter(filter === status ? 'all' : status)}
            className={`border bg-[#FDFAF7] px-6 py-5 cursor-pointer transition-colors ${
              filter === status ? 'border-[#2A2421]' : 'border-[#EAE1D6] hover:border-[#D7C6B2]'
            }`}
          >
            <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-[#5B4638]">
              {statusConfig[status].label}
            </p>
            <p className="mt-2 font-sans text-3xl font-light text-[#2A2421]">{count}</p>
          </div>
        ))}
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
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden lg:table-cell">Teléfono</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden lg:table-cell">Interés</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">Estado</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden xl:table-cell">Fecha</th>
              <th className="px-7 py-5 text-right font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-7 py-14 text-center font-sans text-xs uppercase tracking-widest text-[#5B4638]/50">
                  Cargando leads...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-7 py-14 text-center font-sans text-xs uppercase tracking-widest text-[#5B4638]/50">
                  Sin leads para este filtro
                </td>
              </tr>
            ) : (
              filtered.map((lead) => {
                const sc = statusConfig[(lead.status as LeadStatus) ?? 'new'];
                const isSelected = detailLead?.id === lead.id;
                return (
                  <tr
                    key={lead.id}
                    className={`border-b border-[#EAE1D6]/60 transition-colors ${
                      isSelected ? 'bg-[#EAE1D6]' : 'hover:bg-[#F7F3EE]'
                    }`}
                  >
                    <td className="px-7 py-6">
                      <p className="font-sans text-sm text-[#2A2421] font-medium">{lead.name}</p>
                    </td>
                    <td className="px-4 py-6 hidden md:table-cell">
                      <p className="font-sans text-xs text-[#5B4638]">{lead.email}</p>
                    </td>
                    <td className="px-4 py-6 hidden lg:table-cell">
                      <p className="font-sans text-xs text-[#2A2421]">{lead.phone ?? '—'}</p>
                    </td>
                    <td className="px-4 py-6 hidden lg:table-cell">
                      <p className="font-sans text-xs text-[#2A2421] max-w-[160px] truncate">{lead.interest ?? '—'}</p>
                    </td>
                    <td className="px-4 py-6">
                      <span className={`border px-2.5 py-1 font-sans text-[9px] uppercase tracking-widest ${sc.styles}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-6 hidden xl:table-cell">
                      <p className="font-sans text-xs text-[#5B4638]">{formatDate(lead.created_at)}</p>
                    </td>
                    <td className="px-7 py-6 text-right">
                      <button
                        onClick={() => (isSelected ? setDetailLead(null) : openDetail(lead))}
                        className={`border px-3 py-1.5 font-sans text-[9px] uppercase tracking-widest transition-colors ${
                          isSelected
                            ? 'border-[#2A2421] bg-[#2A2421] text-[#F7F3EE]'
                            : 'border-[#D7C6B2] text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421]'
                        }`}
                      >
                        {isSelected ? 'Cerrar' : 'Ver detalle'}
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
        {filtered.length} lead{filtered.length !== 1 ? 's' : ''} mostrados
      </p>
    </AdminLayout>
  );
}
