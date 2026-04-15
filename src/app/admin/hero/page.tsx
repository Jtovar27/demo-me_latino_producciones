'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  getHeroSlides,
  upsertHeroSlide,
  deleteHeroSlide,
  toggleHeroSlide,
  reorderHeroSlides,
} from '@/app/actions/hero';
import type { DBHeroSlide } from '@/types/supabase';

const inp  = 'w-full border border-[#D7C6B2] bg-transparent px-3 py-2.5 text-sm text-[#2A2421] placeholder-[#5B4638]/40 focus:border-[#2A2421] focus:outline-none transition-colors';
const lbl  = 'block text-[10px] tracking-widest uppercase text-[#5B4638] mb-1';

type SlideForm = {
  id: string;
  image_url: string;
  alt_es: string; alt_en: string;
  category_es: string; category_en: string;
  title_es: string; title_en: string;
  location: string;
  cta_label_es: string; cta_label_en: string; cta_href: string;
  sort_order: string;
  active: boolean;
};

const emptyForm = (): SlideForm => ({
  id: '', image_url: '',
  alt_es: '', alt_en: '',
  category_es: '', category_en: '',
  title_es: '', title_en: '',
  location: '',
  cta_label_es: '', cta_label_en: '', cta_href: '',
  sort_order: '0',
  active: true,
});

function slideToForm(s: DBHeroSlide): SlideForm {
  return {
    id: s.id,
    image_url: s.image_url,
    alt_es: s.alt_es, alt_en: s.alt_en,
    category_es: s.category_es, category_en: s.category_en,
    title_es: s.title_es, title_en: s.title_en,
    location: s.location,
    cta_label_es: s.cta_label_es ?? '', cta_label_en: s.cta_label_en ?? '', cta_href: s.cta_href ?? '',
    sort_order: String(s.sort_order),
    active: s.active,
  };
}

export default function AdminHeroPage() {
  const [slides,   setSlides]   = useState<DBHeroSlide[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [form,     setForm]     = useState<SlideForm>(emptyForm());
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState('');
  const [toastErr, setToastErr] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await getHeroSlides();
    setSlides(data);
    setLoading(false);
  }

  // Initial fetch: avoid sync setState inside effect body by using .then()
  useEffect(() => {
    getHeroSlides().then(({ data }) => {
      setSlides(data);
      setLoading(false);
    });
  }, []);

  function showToast(msg: string, isErr = false) {
    setToast(msg); setToastErr(isErr);
    setTimeout(() => setToast(''), 4000);
  }

  function openNew() { setForm(emptyForm()); setEditing(true); }
  function openEdit(s: DBHeroSlide) { setForm(slideToForm(s)); setEditing(true); }
  function closeForm() { setEditing(false); setForm(emptyForm()); }

  function set(key: keyof SlideForm, val: string | boolean) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  async function handleSave() {
    if (!form.title_es.trim()) { showToast('El título en español es obligatorio.', true); return; }
    if (!form.image_url.trim()) { showToast('La URL de imagen es obligatoria.', true); return; }
    setSaving(true);
    const fd = new FormData();
    for (const [k, v] of Object.entries(form)) fd.append(k, String(v));
    const res = await upsertHeroSlide(fd);
    setSaving(false);
    if (res.error) { showToast(res.error, true); return; }
    showToast(form.id ? 'Slide actualizado.' : 'Slide creado.');
    closeForm();
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este slide del carousel? Esta acción no se puede deshacer.')) return;
    setDeleting(id);
    const res = await deleteHeroSlide(id);
    setDeleting(null);
    if (res.error) showToast(res.error, true); else showToast('Slide eliminado.');
    load();
  }

  async function handleToggle(s: DBHeroSlide) {
    await toggleHeroSlide(s.id, !s.active);
    load();
  }

  async function handleMoveUp(index: number) {
    if (index === 0) return;
    const updated = [...slides];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setSlides(updated);
    await reorderHeroSlides(updated.map(s => s.id));
  }

  async function handleMoveDown(index: number) {
    if (index === slides.length - 1) return;
    const updated = [...slides];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setSlides(updated);
    await reorderHeroSlides(updated.map(s => s.id));
  }

  return (
    <AdminLayout>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 border px-6 py-4 shadow-lg text-xs font-sans uppercase tracking-widest ${toastErr ? 'border-red-300 bg-red-50 text-red-700' : 'border-[#A56E52] bg-[#FDFAF7] text-[#A56E52]'}`}>
          {toast}
        </div>
      )}

      <div className="max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl text-[#2A2421]">Carousel del Hero</h2>
            <p className="mt-1 text-sm text-[#5B4638]">
              Gestiona las imágenes y textos que aparecen en el carousel de la portada. Usa las flechas para reordenar.
            </p>
          </div>
          <button
            onClick={openNew}
            className="shrink-0 border border-[#2A2421] bg-[#2A2421] px-6 py-3 font-sans text-[10px] uppercase tracking-widest text-[#F7F3EE] transition-colors hover:bg-[#5B4638]"
          >
            + Nuevo slide
          </button>
        </div>

        {/* Slide list */}
        {loading ? (
          <p className="font-sans text-xs uppercase tracking-widest text-[#5B4638]/50 py-8">Cargando…</p>
        ) : slides.length === 0 ? (
          <div className="border border-dashed border-[#D7C6B2] py-16 text-center">
            <p className="font-sans text-sm text-[#5B4638]">No hay slides. Crea el primero.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#EAE1D6] border border-[#EAE1D6]">
            {slides.map((slide, index) => (
              <div key={slide.id} className={`flex items-center gap-4 px-5 py-4 bg-[#FDFAF7] transition-colors ${!slide.active ? 'opacity-50' : ''}`}>
                {/* Thumbnail */}
                <div className="relative w-20 h-14 shrink-0 overflow-hidden bg-[#EAE1D6]">
                  <Image src={slide.image_url} alt={slide.title_es} fill className="object-cover" unoptimized />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm font-medium text-[#2A2421] truncate">{slide.title_es}</p>
                  <p className="font-sans text-[10px] text-[#5B4638] truncate">{slide.location}</p>
                  <p className="font-sans text-[9px] uppercase tracking-widest text-[#A56E52] mt-0.5">{slide.category_es}</p>
                </div>

                {/* Order badge */}
                <span className="shrink-0 font-sans text-[10px] text-[#5B4638] tabular-nums w-6 text-center">
                  #{index + 1}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleMoveUp(index)} disabled={index === 0} className="px-2 py-1.5 text-[#5B4638] hover:text-[#2A2421] disabled:opacity-25 text-xs transition-colors" aria-label="Subir">↑</button>
                  <button onClick={() => handleMoveDown(index)} disabled={index === slides.length - 1} className="px-2 py-1.5 text-[#5B4638] hover:text-[#2A2421] disabled:opacity-25 text-xs transition-colors" aria-label="Bajar">↓</button>

                  <button
                    onClick={() => handleToggle(slide)}
                    className={`px-3 py-1.5 font-sans text-[9px] uppercase tracking-widest border transition-colors ${slide.active ? 'border-[#A56E52] text-[#A56E52] hover:bg-[#A56E52] hover:text-white' : 'border-[#D7C6B2] text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421]'}`}
                  >
                    {slide.active ? 'Activo' : 'Inactivo'}
                  </button>

                  <button onClick={() => openEdit(slide)} className="px-3 py-1.5 font-sans text-[9px] uppercase tracking-widest border border-[#D7C6B2] text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] transition-colors">
                    Editar
                  </button>

                  <button
                    onClick={() => handleDelete(slide.id)}
                    disabled={deleting === slide.id}
                    className="px-3 py-1.5 font-sans text-[9px] uppercase tracking-widest border border-transparent text-red-400 hover:border-red-300 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {deleting === slide.id ? '…' : 'Eliminar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SLIDE FORM MODAL ── */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-[2px] overflow-y-auto py-10">
          <div className="relative w-full max-w-2xl mx-4 bg-[#FDFAF7] border border-[#D7C6B2] shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-[#EAE1D6] px-7 py-5">
              <h3 className="font-serif text-lg text-[#2A2421]">
                {form.id ? 'Editar slide' : 'Nuevo slide'}
              </h3>
              <button onClick={closeForm} className="text-[#5B4638] hover:text-[#2A2421] text-lg leading-none">×</button>
            </div>

            <div className="px-7 py-6 space-y-6">
              {/* Image URL */}
              <div>
                <label className={lbl}>URL de imagen <span className="text-red-400">*</span></label>
                <input value={form.image_url} onChange={e => set('image_url', e.target.value)} className={inp} placeholder="https://..." />
                <p className="mt-1 text-[10px] text-[#5B4638]/55">URL de Supabase Storage o externa. Tamaño ideal: 1400×900px.</p>
                {form.image_url && (
                  <div className="relative mt-2 h-28 w-full overflow-hidden border border-[#EAE1D6]">
                    <Image src={form.image_url} alt="preview" fill className="object-cover" unoptimized />
                  </div>
                )}
              </div>

              {/* Titles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Título (ES) <span className="text-red-400">*</span></label>
                  <input value={form.title_es} onChange={e => set('title_es', e.target.value)} className={inp} placeholder="The Real Happiness" />
                </div>
                <div>
                  <label className={lbl}>Título (EN)</label>
                  <input value={form.title_en} onChange={e => set('title_en', e.target.value)} className={inp} placeholder="The Real Happiness" />
                </div>
              </div>

              {/* Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Categoría (ES)</label>
                  <input value={form.category_es} onChange={e => set('category_es', e.target.value)} className={inp} placeholder="Evento Insignia" />
                </div>
                <div>
                  <label className={lbl}>Categoría (EN)</label>
                  <input value={form.category_en} onChange={e => set('category_en', e.target.value)} className={inp} placeholder="Flagship Event" />
                </div>
              </div>

              {/* Alt texts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Texto alternativo (ES)</label>
                  <input value={form.alt_es} onChange={e => set('alt_es', e.target.value)} className={inp} placeholder="Descripción de la imagen para accesibilidad" />
                </div>
                <div>
                  <label className={lbl}>Texto alternativo (EN)</label>
                  <input value={form.alt_en} onChange={e => set('alt_en', e.target.value)} className={inp} placeholder="Image description for accessibility" />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className={lbl}>Ubicación / Fecha</label>
                <input value={form.location} onChange={e => set('location', e.target.value)} className={inp} placeholder="Miami, FL · 2026" />
              </div>

              {/* CTA */}
              <div className="border-t border-[#EAE1D6] pt-5 space-y-4">
                <p className={lbl}>CTA (opcional)</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={lbl}>Etiqueta (ES)</label>
                    <input value={form.cta_label_es} onChange={e => set('cta_label_es', e.target.value)} className={inp} placeholder="Ver evento" />
                  </div>
                  <div>
                    <label className={lbl}>Etiqueta (EN)</label>
                    <input value={form.cta_label_en} onChange={e => set('cta_label_en', e.target.value)} className={inp} placeholder="View event" />
                  </div>
                  <div>
                    <label className={lbl}>URL destino</label>
                    <input value={form.cta_href} onChange={e => set('cta_href', e.target.value)} className={inp} placeholder="/events/the-real-happiness" />
                  </div>
                </div>
              </div>

              {/* Sort + Active */}
              <div className="grid grid-cols-2 gap-4 border-t border-[#EAE1D6] pt-5">
                <div>
                  <label className={lbl}>Orden</label>
                  <input type="number" min={0} value={form.sort_order} onChange={e => set('sort_order', e.target.value)} className={inp} />
                  <p className="mt-1 text-[10px] text-[#5B4638]/55">Menor número = aparece primero.</p>
                </div>
                <div className="flex flex-col justify-center">
                  <label className="flex items-center gap-3 cursor-pointer mt-4">
                    <div
                      onClick={() => set('active', !form.active)}
                      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${form.active ? 'bg-[#A56E52]' : 'bg-[#D7C6B2]'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${form.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="font-sans text-xs text-[#2A2421]">{form.active ? 'Visible en el sitio' : 'Oculto'}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="border-t border-[#EAE1D6] px-7 py-5 flex items-center justify-between">
              <button onClick={closeForm} className="font-sans text-xs uppercase tracking-widest text-[#5B4638] hover:text-[#2A2421] transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="border border-[#2A2421] bg-[#2A2421] px-8 py-3 font-sans text-[10px] uppercase tracking-widest text-[#F7F3EE] hover:bg-[#5B4638] transition-colors disabled:opacity-50"
              >
                {saving ? 'Guardando…' : form.id ? 'Actualizar slide' : 'Crear slide'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
