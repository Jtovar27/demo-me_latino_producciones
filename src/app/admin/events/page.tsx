'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/layout/AdminLayout';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import MediaPicker from '@/components/admin/MediaPicker';
import { getEvents, upsertEvent, deleteEvent, setFeaturedForPopup } from '@/app/actions/events';
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
  title: '', slug: '', date: '', end_date: '', city: '', state: '',
  venue: '', category: 'flagship', capacity: '', status: 'upcoming', price: '',
  description: '', featured: 'false', image_url: '', tags: '',
};

type FormState = typeof emptyForm;

export default function AdminEventsPage() {
  const [events, setEvents]       = useState<DBEvent[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<DBEvent | null>(null);
  const [form, setForm]           = useState<FormState>(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState('');

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
      title:       ev.title,
      slug:        ev.slug,
      date:        ev.date,
      end_date:    ev.end_date ?? '',
      city:        ev.city,
      state:       ev.state,
      venue:       ev.venue,
      category:    ev.category,
      capacity:    String(ev.capacity),
      status:      ev.status,
      price:       String(ev.price),
      description: ev.description ?? '',
      featured:    String(ev.featured),
      image_url:   ev.image_url ?? '',
      tags:        (ev.tags ?? []).join(', '),
    });
    setModalOpen(true);
  }

  async function handleFeature(id: string) {
    const result = await setFeaturedForPopup(id);
    if (result?.error) {
      showToast('Error al actualizar popup');
    } else {
      const { data } = await getEvents();
      setEvents(data as DBEvent[]);
      showToast('Popup de inicio actualizado');
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const fd = new FormData();
      if (editEvent) fd.append('id', editEvent.id);
      fd.append('title',       form.title);
      fd.append('slug',        form.slug);
      fd.append('date',        form.date);
      fd.append('end_date',    form.end_date);
      fd.append('city',        form.city);
      fd.append('state',       form.state);
      fd.append('venue',       form.venue);
      fd.append('category',    form.category);
      fd.append('capacity',    form.capacity);
      fd.append('status',      form.status);
      fd.append('price',       form.price);
      fd.append('description', form.description);
      fd.append('featured',    form.featured);
      fd.append('image_url',   form.image_url);
      fd.append('tags',        form.tags);

      const result = await upsertEvent(fd);
      if (result?.error) {
        showToast(`Error: ${result.error}`);
      } else {
        const { data } = await getEvents();
        setEvents(data as DBEvent[]);
        showToast(editEvent ? 'Evento actualizado' : 'Evento creado');
        setModalOpen(false);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Excepción: ${msg}`);
    } finally {
      setSaving(false);
    }
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

      {/* Mobile cards (visible < md) */}
      <div className="md:hidden space-y-3 mb-4">
        {loading ? (
          <p className="py-10 text-center font-sans text-xs uppercase tracking-widest text-[#5B4638]/50">Cargando eventos...</p>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center font-sans text-xs uppercase tracking-widest text-[#5B4638]/50">No se encontraron eventos</p>
        ) : filtered.map((ev) => (
          <div key={ev.id} className="border border-[#EAE1D6] bg-[#FDFAF7] p-4">
            <div className="flex items-start gap-3 mb-3">
              {ev.image_url ? (
                <div className="relative w-14 h-14 shrink-0 overflow-hidden">
                  <Image src={ev.image_url} alt={ev.title} fill className="object-cover" sizes="56px" unoptimized />
                </div>
              ) : (
                <div className="w-14 h-14 shrink-0 bg-[#EAE1D6] flex items-center justify-center">
                  <span className="font-sans text-[9px] uppercase tracking-wider text-[#5B4638]">
                    {categoryLabels[ev.category]?.[0] ?? 'E'}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="font-sans text-sm font-medium text-[#2A2421] leading-snug">{ev.title}</p>
                  {ev.featured && (
                    <span className="inline-block px-1.5 py-0.5 font-sans text-[8px] font-semibold uppercase tracking-widest text-white bg-[#A56E52]">
                      Popup
                    </span>
                  )}
                </div>
                <p className="font-sans text-[10px] text-[#5B4638] mt-0.5">{ev.city}, {ev.state} · {formatDate(ev.date)}</p>
                <p className="font-sans text-[10px] text-[#A56E52] mt-0.5">{ev.venue}</p>
              </div>
              <Badge variant={ev.status as 'upcoming' | 'sold-out' | 'past'} />
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleFeature(ev.id)}
                className={['flex-1 border py-2.5 font-sans text-[9px] uppercase tracking-widest transition-colors',
                  ev.featured ? 'border-[#A56E52] text-[#A56E52] bg-[#A56E52]/5' : 'border-[#D7C6B2] text-[#5B4638] hover:border-[#A56E52] hover:text-[#A56E52]'].join(' ')}>
                {ev.featured ? '★ Popup' : '☆ Popup'}
              </button>
              <button onClick={() => openEdit(ev)}
                className="flex-1 border border-[#D7C6B2] py-2.5 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] transition-colors">
                Editar
              </button>
              <button onClick={() => handleDelete(ev.id)}
                className="flex-1 border border-[#D7C6B2] py-2.5 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-red-400 hover:text-red-500 transition-colors">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table (visible >= md) */}
      <div className="hidden md:block border border-[#EAE1D6] bg-[#FDFAF7] overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#EAE1D6]">
              <th className="px-7 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">Evento</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">Fecha</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden lg:table-cell">Ciudad</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden lg:table-cell">Categoría</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">Estado</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden xl:table-cell">Precio</th>
              <th className="px-7 py-5 text-right font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-7 py-14 text-center font-sans text-xs uppercase tracking-widest text-[#5B4638]/50">
                  Cargando eventos...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-7 py-14 text-center font-sans text-xs uppercase tracking-widest text-[#5B4638]/50">
                  No se encontraron eventos
                </td>
              </tr>
            ) : (
              filtered.map((ev) => (
                <tr key={ev.id} className="border-b border-[#EAE1D6]/60 hover:bg-[#F7F3EE] transition-colors">
                  <td className="px-7 py-5">
                    <div className="flex items-center gap-3">
                      {ev.image_url ? (
                        <div className="relative w-10 h-10 shrink-0 overflow-hidden">
                          <Image src={ev.image_url} alt={ev.title} fill className="object-cover" sizes="40px" unoptimized />
                        </div>
                      ) : (
                        <div className="w-10 h-10 shrink-0 bg-[#EAE1D6] flex items-center justify-center">
                          <span className="font-sans text-[9px] text-[#5B4638]">{categoryLabels[ev.category]?.[0] ?? 'E'}</span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-sans text-sm text-[#2A2421] font-medium">{ev.title}</p>
                          {ev.featured && (
                            <span className="shrink-0 inline-block px-1.5 py-0.5 font-sans text-[8px] font-semibold uppercase tracking-widest text-white bg-[#A56E52]">
                              Popup
                            </span>
                          )}
                        </div>
                        <p className="font-sans text-[10px] uppercase tracking-wider text-[#5B4638] mt-0.5 max-w-[160px] truncate">{ev.venue}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <p className="font-sans text-xs text-[#2A2421]">{formatDate(ev.date)}</p>
                    {ev.end_date && ev.end_date !== ev.date && (
                      <p className="font-sans text-[10px] text-[#5B4638]">– {formatDate(ev.end_date)}</p>
                    )}
                  </td>
                  <td className="px-4 py-5 hidden lg:table-cell">
                    <p className="font-sans text-xs text-[#2A2421]">{ev.city}, {ev.state}</p>
                  </td>
                  <td className="px-4 py-5 hidden lg:table-cell">
                    <p className="font-sans text-[10px] uppercase tracking-wider text-[#5B4638]">
                      {categoryLabels[ev.category] ?? ev.category}
                    </p>
                  </td>
                  <td className="px-4 py-5">
                    <Badge variant={ev.status as 'upcoming' | 'sold-out' | 'past'} />
                  </td>
                  <td className="px-4 py-5 hidden xl:table-cell">
                    <p className="font-sans text-xs text-[#2A2421]">{formatCurrency(ev.price)}</p>
                  </td>
                  <td className="px-7 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleFeature(ev.id)} title={ev.featured ? 'Quitar del popup' : 'Destacar en popup'}
                        className={['border px-3 py-1.5 font-sans text-[9px] uppercase tracking-widest transition-colors',
                          ev.featured ? 'border-[#A56E52] text-[#A56E52] bg-[#A56E52]/5' : 'border-[#D7C6B2] text-[#5B4638] hover:border-[#A56E52] hover:text-[#A56E52]'].join(' ')}>
                        {ev.featured ? '★ Popup' : '☆ Popup'}
                      </button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(ev)}>Editar</Button>
                      <button onClick={() => handleDelete(ev.id)}
                        className="border border-[#D7C6B2] px-3 py-1.5 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-red-400 hover:text-red-500 transition-colors">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-[#2A2421]/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full sm:max-w-2xl border border-[#EAE1D6] bg-[#FDFAF7] shadow-2xl mx-0 sm:mx-4 max-h-[92vh] overflow-y-auto rounded-t-lg sm:rounded-none">
            <div className="border-b border-[#EAE1D6] px-6 py-5 flex items-center justify-between">
              <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">
                {editEvent ? 'Editar Evento' : 'Nuevo Evento'}
              </p>
              <button onClick={() => setModalOpen(false)} className="font-sans text-[#5B4638] hover:text-[#2A2421] transition-colors text-xl leading-none p-1">×</button>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                {/* Image picker — full width */}
                <div className="sm:col-span-2">
                  <MediaPicker
                    value={form.image_url}
                    onChange={(url) => updateForm('image_url', url)}
                    accept="image"
                    label="Imagen del evento"
                  />
                </div>

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

                {([
                  { field: 'date',     label: 'Fecha inicio',  type: 'date',  placeholder: '' },
                  { field: 'end_date', label: 'Fecha fin',     type: 'date',  placeholder: '' },
                  { field: 'city',     label: 'Ciudad',        type: 'text',  placeholder: 'Miami' },
                  { field: 'state',    label: 'Estado / País', type: 'text',  placeholder: 'FL' },
                  { field: 'venue',    label: 'Venue',         type: 'text',  placeholder: 'Nombre del venue' },
                ] as const).map(({ field, label, type, placeholder }) => (
                  <div key={field}>
                    <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">{label}</label>
                    <input type={type} value={form[field as keyof FormState]}
                      onChange={(e) => updateForm(field as keyof FormState, e.target.value)}
                      placeholder={placeholder || undefined}
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

                <div className="sm:col-span-2">
                  <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">Etiquetas (separadas por coma)</label>
                  <input type="text" value={form.tags} onChange={(e) => updateForm('tags', e.target.value)}
                    placeholder="wellness, latinx, miami, summit"
                    className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors" />
                </div>

                {/* Popup toggle */}
                <div className="sm:col-span-2 border border-[#EAE1D6] bg-[#F7F3EE] px-5 py-4">
                  <button type="button"
                    onClick={() => updateForm('featured', form.featured === 'true' ? 'false' : 'true')}
                    className="flex items-center gap-4 w-full text-left">
                    <div className="relative shrink-0 w-10 h-5 rounded-full transition-colors duration-200"
                      style={{ background: form.featured === 'true' ? '#A56E52' : '#D7C6B2' }}>
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
                        style={{ transform: form.featured === 'true' ? 'translateX(20px)' : 'translateX(0)' }} />
                    </div>
                    <div>
                      <p className="font-sans text-xs font-medium text-[#2A2421]">Mostrar en popup de inicio</p>
                      <p className="font-sans text-[10px] text-[#5B4638] mt-0.5">
                        Solo un evento puede estar destacado a la vez.
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            <div className="border-t border-[#EAE1D6] px-6 py-5 flex items-center justify-end gap-3">
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
