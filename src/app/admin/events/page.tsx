'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getEvents, upsertEvent, deleteEvent } from '@/app/actions/events';
import type { DBEvent } from '@/types/supabase';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(n: number) {
  return n === 0
    ? 'Gratis'
    : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

const categoryLabels: Record<string, string> = {
  flagship:  'Flagship',
  wellness:  'Wellness',
  summit:    'Summit',
  community: 'Comunidad',
  branded:   'Branded',
};

const emptyForm = {
  title: '', slug: '', date: '', endDate: '', city: '', state: '',
  venue: '', category: 'flagship', capacity: '', status: 'upcoming', price: '',
  description: '',
};

type FormState = typeof emptyForm;

export default function AdminEventsPage() {
  const [events, setEvents]     = useState<DBEvent[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<DBEvent | null>(null);
  const [form, setForm]         = useState<FormState>(emptyForm);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState('');

  useEffect(() => {
    getEvents().then(({ data }) => {
      setEvents(data as DBEvent[]);
      setLoading(false);
    });
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  }

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.city.toLowerCase().includes(search.toLowerCase())
  );

  function openNew() {
    setEditEvent(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(ev: DBEvent) {
    setEditEvent(ev);
    setForm({
      title: ev.title,
      slug: ev.slug,
      date: ev.date,
      endDate: ev.end_date ?? '',
      city: ev.city,
      state: ev.state,
      venue: ev.venue,
      category: ev.category,
      capacity: String(ev.capacity),
      status: ev.status,
      price: String(ev.price),
      description: ev.description ?? '',
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const fd = new FormData();
    if (editEvent) fd.append('id', editEvent.id);
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));

    const result = await upsertEvent(fd);
    if (result?.error) {
      showToast('Error al guardar');
    } else {
      const { data } = await getEvents();
      setEvents(data as DBEvent[]);
      showToast(editEvent ? 'Evento actualizado' : 'Evento creado');
      setModalOpen(false);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await deleteEvent(id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
    showToast('Evento eliminado');
  }

  function updateForm(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <AdminLayout>
      {toast && (
        <div className="fixed top-6 right-6 z-50 border border-[#A56E52] bg-[#FDFAF7] px-6 py-4 shadow-lg">
          <p className="font-sans text-xs uppercase tracking-widest text-[#A56E52]">{toast}</p>
        </div>
      )}

      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <h2 className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">Gestión de Eventos</h2>
          <p className="mt-1 font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">
            {loading ? 'Cargando...' : `${events.length} eventos en total — ${filtered.length} mostrados`}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openNew}>+ Nuevo Evento</Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar eventos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm border border-[#D7C6B2] bg-[#FDFAF7] px-4 py-2.5 font-sans text-xs text-[#2A2421] placeholder-[#5B4638]/50 outline-none focus:border-[#A56E52] transition-colors"
        />
      </div>

      {/* Table */}
      <div className="border border-[#EAE1D6] bg-[#FDFAF7] overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#EAE1D6]">
              <th className="px-7 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">Evento</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden md:table-cell">Fecha</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden lg:table-cell">Ciudad</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden lg:table-cell">Categoría</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">Estado</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden xl:table-cell">Cap.</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden xl:table-cell">Precio</th>
              <th className="px-7 py-5 text-right font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-7 py-14 text-center font-sans text-xs uppercase tracking-widest text-[#5B4638]/50">
                  Cargando eventos...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-7 py-14 text-center font-sans text-xs uppercase tracking-widest text-[#5B4638]/50">
                  No se encontraron eventos
                </td>
              </tr>
            ) : (
              filtered.map((ev) => {
                const pct = ev.capacity > 0 ? Math.round((ev.registered / ev.capacity) * 100) : 0;
                return (
                  <tr key={ev.id} className="border-b border-[#EAE1D6]/60 hover:bg-[#F7F3EE] transition-colors">
                    <td className="px-7 py-6">
                      <p className="font-sans text-sm text-[#2A2421] font-medium">{ev.title}</p>
                      <p className="font-sans text-[10px] uppercase tracking-wider text-[#5B4638] mt-0.5 max-w-[180px] truncate">{ev.venue}</p>
                    </td>
                    <td className="px-4 py-6 hidden md:table-cell">
                      <p className="font-sans text-xs text-[#2A2421]">{formatDate(ev.date)}</p>
                      {ev.end_date && ev.end_date !== ev.date && (
                        <p className="font-sans text-[10px] text-[#5B4638]">– {formatDate(ev.end_date)}</p>
                      )}
                    </td>
                    <td className="px-4 py-6 hidden lg:table-cell">
                      <p className="font-sans text-xs text-[#2A2421]">{ev.city}, {ev.state}</p>
                    </td>
                    <td className="px-4 py-6 hidden lg:table-cell">
                      <p className="font-sans text-[10px] uppercase tracking-wider text-[#5B4638]">
                        {categoryLabels[ev.category] ?? ev.category}
                      </p>
                    </td>
                    <td className="px-4 py-6">
                      <Badge variant={ev.status as 'upcoming' | 'sold-out' | 'past'} />
                    </td>
                    <td className="px-4 py-6 hidden xl:table-cell">
                      <p className="font-sans text-xs text-[#2A2421]">
                        {ev.registered.toLocaleString()} / {ev.capacity.toLocaleString()}
                      </p>
                      <div className="mt-1.5 h-1 w-20 bg-[#EAE1D6]">
                        <div className="h-1 bg-[#A56E52]" style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-6 hidden xl:table-cell">
                      <p className="font-sans text-xs text-[#2A2421]">{formatCurrency(ev.price)}</p>
                    </td>
                    <td className="px-7 py-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(ev)}>Editar</Button>
                        <button
                          onClick={() => handleDelete(ev.id)}
                          className="border border-[#D7C6B2] px-3 py-1.5 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-red-400 hover:text-red-500 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#2A2421]/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl border border-[#EAE1D6] bg-[#FDFAF7] shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-[#EAE1D6] px-8 py-6 flex items-center justify-between">
              <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">
                {editEvent ? 'Editar Evento' : 'Nuevo Evento'}
              </p>
              <button onClick={() => setModalOpen(false)} className="font-sans text-[#5B4638] hover:text-[#2A2421] transition-colors text-lg leading-none">×</button>
            </div>
            <div className="px-8 py-7">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">Nombre del evento</label>
                  <input type="text" value={form.title} onChange={(e) => updateForm('title', e.target.value)}
                    placeholder="Ej. The Real Happiness — Miami 2026"
                    className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">Slug (URL)</label>
                  <input type="text" value={form.slug} onChange={(e) => updateForm('slug', e.target.value)}
                    placeholder="the-real-happiness-miami-2026"
                    className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors" />
                </div>
                {[
                  { field: 'date',    label: 'Fecha inicio', type: 'date' },
                  { field: 'endDate', label: 'Fecha fin',    type: 'date' },
                  { field: 'city',    label: 'Ciudad',       type: 'text', placeholder: 'Miami' },
                  { field: 'state',   label: 'Estado/País',  type: 'text', placeholder: 'FL' },
                  { field: 'venue',   label: 'Venue',        type: 'text', placeholder: 'Nombre del venue' },
                ].map(({ field, label, type, placeholder }) => (
                  <div key={field}>
                    <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">{label}</label>
                    <input type={type} value={form[field as keyof FormState]} onChange={(e) => updateForm(field as keyof FormState, e.target.value)}
                      placeholder={placeholder}
                      className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors" />
                  </div>
                ))}
                <div>
                  <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">Categoría</label>
                  <select value={form.category} onChange={(e) => updateForm('category', e.target.value)}
                    className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors">
                    {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">Estado</label>
                  <select value={form.status} onChange={(e) => updateForm('status', e.target.value)}
                    className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors">
                    <option value="upcoming">Próximo</option>
                    <option value="sold-out">Agotado</option>
                    <option value="past">Finalizado</option>
                  </select>
                </div>
                <div>
                  <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">Capacidad</label>
                  <input type="number" value={form.capacity} onChange={(e) => updateForm('capacity', e.target.value)} placeholder="500"
                    className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors" />
                </div>
                <div>
                  <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">Precio (USD)</label>
                  <input type="number" value={form.price} onChange={(e) => updateForm('price', e.target.value)} placeholder="397"
                    className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">Descripción</label>
                  <textarea value={form.description} onChange={(e) => updateForm('description', e.target.value)} rows={3}
                    placeholder="Descripción del evento..."
                    className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors resize-none" />
                </div>
              </div>
            </div>
            <div className="border-t border-[#EAE1D6] px-8 py-5 flex items-center justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
                {saving ? 'Guardando...' : 'Guardar evento'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
