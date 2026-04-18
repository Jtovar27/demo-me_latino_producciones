'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import MediaPicker from '@/components/admin/MediaPicker';
import { getExperiences, upsertExperience, deleteExperience } from '@/app/actions/experiences';
import type { DBExperience } from '@/types/supabase';

const categoryLabels: Record<string, string> = {
  flagship:  'Experiencia Insignia',
  summit:    'Summit',
  wellness:  'Bienestar',
  community: 'Comunidad',
  branded:   'Experiencia de Marca',
};

const emptyForm = {
  title: '', slug: '', category: 'flagship', short_desc: '',
  description: '', image_url: '', featured: 'false', tags: '',
};

type FormState = typeof emptyForm;

export default function AdminExperiencesPage() {
  const [experiences, setExperiences] = useState<DBExperience[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [modalOpen, setModalOpen]     = useState(false);
  const [editExp, setEditExp]         = useState<DBExperience | null>(null);
  const [form, setForm]               = useState<FormState>(emptyForm);
  const [saving, setSaving]           = useState(false);
  const [toast, setToast]             = useState('');

  useEffect(() => {
    getExperiences().then(({ data }) => {
      setExperiences(data as DBExperience[]);
      setLoading(false);
    });
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  }

  const filtered = experiences.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    (e.category ?? '').toLowerCase().includes(search.toLowerCase())
  );

  function openNew() {
    setEditExp(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(exp: DBExperience) {
    setEditExp(exp);
    setForm({
      title:       exp.title,
      slug:        exp.slug,
      category:    exp.category,
      short_desc:  exp.short_desc ?? '',
      description: exp.description ?? '',
      image_url:   exp.image_url ?? '',
      featured:    String(exp.featured),
      tags:        (exp.tags ?? []).join(', '),
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const fd = new FormData();
      if (editExp) fd.append('id', editExp.id);
      fd.append('title',       form.title);
      fd.append('slug',        form.slug);
      fd.append('category',    form.category);
      fd.append('short_desc',  form.short_desc);
      fd.append('description', form.description);
      fd.append('image_url',   form.image_url);
      fd.append('featured',    form.featured);
      fd.append('tags',        form.tags);

      const result = await upsertExperience(fd);
      if (result?.error) {
        showToast(`Error: ${result.error}`);
      } else {
        const { data } = await getExperiences();
        setExperiences(data as DBExperience[]);
        showToast(editExp ? 'Experiencia actualizada' : 'Experiencia creada');
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
    if (!confirm('¿Eliminar esta experiencia? Esta acción no se puede deshacer.')) return;
    await deleteExperience(id);
    setExperiences((prev) => prev.filter((e) => e.id !== id));
    showToast('Experiencia eliminada');
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
          <h2 className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">Gestión de Experiencias</h2>
          <p className="mt-1 font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">
            {loading ? 'Cargando...' : `${experiences.length} experiencias en total — ${filtered.length} mostradas`}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openNew}>+ Nueva Experiencia</Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar experiencias..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm border border-[#D7C6B2] bg-[#FDFAF7] px-4 py-2.5 font-sans text-xs text-[#2A2421] placeholder-[#5B4638]/50 outline-none focus:border-[#A56E52] transition-colors"
        />
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3 mb-4">
        {loading ? (
          <p className="py-10 text-center font-sans text-xs uppercase tracking-widest text-[#5B4638]/50">Cargando experiencias...</p>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center font-sans text-xs uppercase tracking-widest text-[#5B4638]/50">No se encontraron experiencias</p>
        ) : filtered.map((exp) => (
          <div key={exp.id} className="border border-[#EAE1D6] bg-[#FDFAF7] p-4">
            <div className="flex items-start gap-3 mb-3">
              {exp.image_url ? (
                <div className="relative w-14 h-14 shrink-0 overflow-hidden">
                  <Image src={exp.image_url} alt={exp.title} fill className="object-cover" sizes="56px" unoptimized />
                </div>
              ) : (
                <div className="w-14 h-14 shrink-0 bg-[#EAE1D6] flex items-center justify-center">
                  <span className="font-sans text-[9px] uppercase tracking-wider text-[#5B4638]">
                    {categoryLabels[exp.category]?.[0] ?? 'E'}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="font-sans text-sm font-medium text-[#2A2421] leading-snug">{exp.title}</p>
                  {exp.featured && (
                    <span className="inline-block px-1.5 py-0.5 font-sans text-[8px] font-semibold uppercase tracking-widest text-white bg-[#A56E52]">
                      Destacada
                    </span>
                  )}
                </div>
                <p className="font-sans text-[10px] text-[#A56E52] mt-0.5 uppercase tracking-wider">
                  {categoryLabels[exp.category] ?? exp.category}
                </p>
                {exp.short_desc && (
                  <p className="font-sans text-[10px] text-[#5B4638] mt-1 line-clamp-2">{exp.short_desc}</p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => openEdit(exp)}
                className="flex-1 border border-[#D7C6B2] py-2.5 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] transition-colors">
                Editar
              </button>
              <button onClick={() => handleDelete(exp.id)}
                className="flex-1 border border-[#D7C6B2] py-2.5 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-red-400 hover:text-red-500 transition-colors">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block border border-[#EAE1D6] bg-[#FDFAF7] overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#EAE1D6]">
              <th className="px-7 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">Experiencia</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">Categoría</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden lg:table-cell">Descripción corta</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">Estado</th>
              <th className="px-7 py-5 text-right font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-7 py-14 text-center font-sans text-xs uppercase tracking-widest text-[#5B4638]/50">
                  Cargando experiencias...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-7 py-14 text-center font-sans text-xs uppercase tracking-widest text-[#5B4638]/50">
                  No se encontraron experiencias
                </td>
              </tr>
            ) : filtered.map((exp) => (
              <tr key={exp.id} className="border-b border-[#EAE1D6]/60 hover:bg-[#F7F3EE] transition-colors">
                <td className="px-7 py-5">
                  <div className="flex items-center gap-3">
                    {exp.image_url ? (
                      <div className="relative w-10 h-10 shrink-0 overflow-hidden">
                        <Image src={exp.image_url} alt={exp.title} fill className="object-cover" sizes="40px" unoptimized />
                      </div>
                    ) : (
                      <div className="w-10 h-10 shrink-0 bg-[#EAE1D6] flex items-center justify-center">
                        <span className="font-sans text-[9px] text-[#5B4638]">{categoryLabels[exp.category]?.[0] ?? 'E'}</span>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-sans text-sm text-[#2A2421] font-medium">{exp.title}</p>
                        {exp.featured && (
                          <span className="shrink-0 inline-block px-1.5 py-0.5 font-sans text-[8px] font-semibold uppercase tracking-widest text-white bg-[#A56E52]">
                            Destacada
                          </span>
                        )}
                      </div>
                      <p className="font-sans text-[10px] uppercase tracking-wider text-[#5B4638] mt-0.5">/{exp.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-5">
                  <p className="font-sans text-[10px] uppercase tracking-wider text-[#5B4638]">
                    {categoryLabels[exp.category] ?? exp.category}
                  </p>
                </td>
                <td className="px-4 py-5 hidden lg:table-cell">
                  <p className="font-sans text-xs text-[#5B4638] max-w-[240px] truncate">
                    {exp.short_desc ?? '—'}
                  </p>
                </td>
                <td className="px-4 py-5">
                  <span className={[
                    'inline-block border px-2 py-0.5 font-sans text-[9px] uppercase tracking-widest',
                    exp.featured
                      ? 'border-[#A56E52] text-[#A56E52]'
                      : 'border-[#D7C6B2] text-[#5B4638]',
                  ].join(' ')}>
                    {exp.featured ? 'Destacada' : 'Normal'}
                  </span>
                </td>
                <td className="px-7 py-5">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(exp)}>Editar</Button>
                    <button onClick={() => handleDelete(exp.id)}
                      className="border border-[#D7C6B2] px-3 py-1.5 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-red-400 hover:text-red-500 transition-colors">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
                {editExp ? 'Editar Experiencia' : 'Nueva Experiencia'}
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
                    label="Imagen de la experiencia"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">Nombre de la experiencia</label>
                  <input type="text" value={form.title} onChange={(e) => updateForm('title', e.target.value)}
                    placeholder="Ej. The Real Happiness — Experiencia Insignia"
                    className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors" />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">Slug (URL)</label>
                  <input type="text" value={form.slug} onChange={(e) => updateForm('slug', e.target.value)}
                    placeholder="the-real-happiness"
                    className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors" />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">Categoría</label>
                  <select value={form.category} onChange={(e) => updateForm('category', e.target.value)}
                    className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors">
                    {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">Descripción corta</label>
                  <input type="text" value={form.short_desc} onChange={(e) => updateForm('short_desc', e.target.value)}
                    placeholder="Una línea que resume la experiencia..."
                    className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors" />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">Descripción completa</label>
                  <textarea value={form.description} onChange={(e) => updateForm('description', e.target.value)} rows={4}
                    placeholder="Descripción detallada de la experiencia..."
                    className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors resize-none" />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">Etiquetas (separadas por coma)</label>
                  <input type="text" value={form.tags} onChange={(e) => updateForm('tags', e.target.value)}
                    placeholder="flagship, transformación, comunidad"
                    className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors" />
                </div>

                {/* Featured toggle */}
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
                      <p className="font-sans text-xs font-medium text-[#2A2421]">Experiencia destacada</p>
                      <p className="font-sans text-[10px] text-[#5B4638] mt-0.5">
                        Las experiencias destacadas aparecen primero en la página pública.
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            <div className="border-t border-[#EAE1D6] px-6 py-5 flex items-center justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
                {saving ? 'Guardando...' : 'Guardar experiencia'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
