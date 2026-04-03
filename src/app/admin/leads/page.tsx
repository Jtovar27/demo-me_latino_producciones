'use client';

import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import { adminData, type Lead, type LeadStatus } from '@/lib/data';

const leads = adminData.leads;

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const statusConfig: Record<LeadStatus, { label: string; styles: string }> = {
  new: {
    label: 'Nuevo',
    styles: 'border-[#A56E52] text-[#A56E52]',
  },
  contacted: {
    label: 'Contactado',
    styles: 'border-[#D7C6B2] text-[#5B4638] bg-[#EAE1D6]',
  },
  qualified: {
    label: 'Calificado',
    styles: 'border-[#5B4638] text-[#5B4638]',
  },
  converted: {
    label: 'Convertido',
    styles: 'border-[#2A2421] bg-[#2A2421] text-[#F7F3EE]',
  },
};

type FilterStatus = 'all' | LeadStatus;

const filterOptions: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'converted', label: 'Converted' },
];

export default function AdminLeadsPage() {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [exporting, setExporting] = useState(false);
  const [leadStatuses, setLeadStatuses] = useState<Record<string, LeadStatus>>(
    Object.fromEntries(leads.map((l) => [l.email, l.status]))
  );
  const [panelStatus, setPanelStatus] = useState<LeadStatus>('new');

  const resolved = leads.map((l) => ({ ...l, status: leadStatuses[l.email] ?? l.status }));
  const filtered = filter === 'all' ? resolved : resolved.filter((l) => l.status === filter);

  const counts: Record<LeadStatus, number> = {
    new: resolved.filter((l) => l.status === 'new').length,
    contacted: resolved.filter((l) => l.status === 'contacted').length,
    qualified: resolved.filter((l) => l.status === 'qualified').length,
    converted: resolved.filter((l) => l.status === 'converted').length,
  };

  function handleExport() {
    setExporting(true);
    setTimeout(() => setExporting(false), 1500);
  }

  function openDetail(lead: Lead) {
    setDetailLead(lead);
    setPanelStatus(leadStatuses[lead.email] ?? lead.status);
  }

  function applyStatusChange() {
    if (!detailLead) return;
    setLeadStatuses((prev) => ({ ...prev, [detailLead.email]: panelStatus }));
    setDetailLead(null);
  }

  return (
    <AdminLayout>
      {/* Slide-in detail panel */}
      {detailLead && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-[#2A2421]/30"
            onClick={() => setDetailLead(null)}
          />
          {/* Panel */}
          <div className="fixed right-0 top-0 z-50 h-full w-80 bg-[#FDFAF7] shadow-2xl border-l border-[#EAE1D6] overflow-y-auto">
            {/* Panel header */}
            <div className="border-b border-[#EAE1D6] px-6 py-5 flex items-center justify-between">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#2A2421]">
                Detalle del Lead
              </p>
              <button
                onClick={() => setDetailLead(null)}
                className="font-sans text-[#5B4638] hover:text-[#2A2421] transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Panel content */}
            <div className="px-6 py-6 space-y-5">
              {/* Current status badge */}
              <div>
                <span
                  className={`border px-2.5 py-1 font-sans text-[9px] uppercase tracking-widest ${statusConfig[leadStatuses[detailLead.email] ?? detailLead.status].styles}`}
                >
                  {statusConfig[leadStatuses[detailLead.email] ?? detailLead.status].label}
                </span>
              </div>

              <div>
                <p className="font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-1">Nombre</p>
                <p className="font-sans text-sm font-medium text-[#2A2421]">{detailLead.name}</p>
              </div>
              <div>
                <p className="font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-1">Email</p>
                <p className="font-sans text-xs text-[#2A2421]">{detailLead.email}</p>
              </div>
              <div>
                <p className="font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-1">Teléfono</p>
                <p className="font-sans text-xs text-[#2A2421]">{detailLead.phone}</p>
              </div>
              <div>
                <p className="font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-1">Interés</p>
                <p className="font-sans text-xs text-[#2A2421]">{detailLead.interest}</p>
              </div>
              <div>
                <p className="font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-1">Fecha</p>
                <p className="font-sans text-xs text-[#2A2421]">{formatDate(detailLead.date)}</p>
              </div>

              {/* Cambiar estado */}
              <div className="pt-4 border-t border-[#EAE1D6]">
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">
                  Cambiar estado
                </label>
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
                <button
                  onClick={applyStatusChange}
                  className="w-full border border-[#2A2421] bg-[#2A2421] py-2.5 font-sans text-[9px] uppercase tracking-widest text-[#F7F3EE] hover:bg-[#5B4638] transition-colors"
                >
                  Aplicar cambio
                </button>
              </div>

              {/* Close */}
              <button
                onClick={() => setDetailLead(null)}
                className="w-full border border-[#D7C6B2] py-2.5 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </>
      )}

      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h2 className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">Leads</h2>
          <p className="mt-1 font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">
            {leads.length} leads en total
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          loading={exporting}
          onClick={handleExport}
        >
          {exporting ? 'Exportando...' : 'Exportar'}
        </Button>
      </div>

      {/* Status count row */}
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

      {/* Filter tabs + export */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-0">
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-7 py-14 text-center font-sans text-xs uppercase tracking-widest text-[#5B4638]/50">
                  Sin leads para este filtro
                </td>
              </tr>
            ) : (
              filtered.map((lead, i) => {
                const currentStatus = leadStatuses[lead.email] ?? lead.status;
                const status = statusConfig[currentStatus];
                const isSelected = detailLead?.email === lead.email;
                return (
                  <tr
                    key={i}
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
                      <p className="font-sans text-xs text-[#2A2421]">{lead.phone}</p>
                    </td>
                    <td className="px-4 py-6 hidden lg:table-cell">
                      <p className="font-sans text-xs text-[#2A2421] max-w-[160px] truncate">{lead.interest}</p>
                    </td>
                    <td className="px-4 py-6">
                      <span
                        className={`border px-2.5 py-1 font-sans text-[9px] uppercase tracking-widest ${status.styles}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-6 hidden xl:table-cell">
                      <p className="font-sans text-xs text-[#5B4638]">{formatDate(lead.date)}</p>
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
