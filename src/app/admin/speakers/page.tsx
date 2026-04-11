'use client';

import { useState, useEffect } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import { getSpeakers, upsertSpeaker, deleteSpeaker } from '@/app/actions/speakers';
import type { DBSpeaker } from '@/types/supabase';

type ViewMode = 'grid' | 'list';

const emptyForm = { name: '', title: '', organization: '', bio: '', expertise: '', instagram: '', featured: false };
type FormState = typeof emptyForm;

const bgColors = [
  'bg-[#A56E52]', 'bg-[#5B4638]', 'bg-[#2A2421]', 'bg-[#D7C6B2]',
  'bg-[#EAE1D6]', 'bg-[#A56E52]/70', 'bg-[#5B4638]/70', 'bg-[#2A2421]/80',
];

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

export default function AdminSpeakersPage() {
  const [speakers, setSpeakers]     = useState<DBSpeaker[]>([]);
  const [loading, setLoading]       = useState(true);
  const [view, setView]             = useState<ViewMode>('grid');
  const [modalOpen, setModalOpen]   = useState(false);
  const [editSpeaker, setEditSpeaker] = useState<DBSpeaker | null>(null);
  const [form, setForm]             = useState<FormState>(emptyForm);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState('');

  useEffect(() => {
    getSpeakers().then(({ data }) => {
      setSpeakers(data as DBSpeaker[]);
      setLoading(false);
    });
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  }

  function openNew() {
    setEditSpeaker(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(sp: DBSpeaker) {
    setEditSpeaker(sp);
    setForm({
      name: sp.name,
      title: sp.title ?? '',
      organization: sp.organization ?? '',
      bio: sp.bio ?? '',
      expertise: (sp.expertise ?? []).join(', '),
      instagram: sp.instagram ?? '',
      featured: sp.featured,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const fd = new FormData();
    if (editSpeaker) fd.append('id', editSpeaker.id);
    fd.append('name', form.name);
    fd.append('title', form.title);
    fd.append('organization', form.organization);
    fd.append('bio', form.bio);
    fd.append('expertise', form.expertise);
    fd.append('instagram', form.instagram);
    fd.append('featured', String(form.featured));

    const result = await upsertSpeaker(fd);
    if (result?.error) {
      showToast('Error al guardar');
    } else {
      const { data } = await getSpeakers();
      setSpeakers(data as DBSpeaker[]);
      showToast(editSpeaker ? 'Speaker actualizado' : 'Speaker agregado');
      setModalOpen(false);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await deleteSpeaker(id);
    setSpeakers((prev) => prev.filter((s) => s.id !== id));
    showToast('Speaker eliminado');
  }

  function updateForm(field: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <AdminLayout>
      {toast && (
        <div className="fixed top-6 right-6 z-50 border border-[#A56E52] bg-[#FDFAF7] px-6 py-4 shadow-lg">
          <p className="font-sans text-xs uppercase tracking-widest text-[#A56E52]">{toast}</p>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">Speakers</h2>
          <p className="mt-1 font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">
            {loading ? 'Cargando...' : `${speakers.length} speakers registrados`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border border-[#D7C6B2]">
            <button
              onClick={() => setView('grid')}
              aria-label="Vista cuadrícula"
              className={`flex items-center justify-center px-3 py-2 transition-colors ${
                view === 'grid' ? 'bg-[#2A2421] text-[#F7F3EE]' : 'text-[#5B4638] hover:text-[#2A2421]'
              }`}
            >
              <LayoutGrid size={14} strokeWidth={1.75} />
            </button>
            <button
              onClick={() => setView('list')}
              aria-label="Vista lista"
              className={`flex items-center justify-center px-3 py-2 transition-colors border-l border-[#D7C6B2] ${
                view === 'list' ? 'bg-[#2A2421] text-[#F7F3EE]' : 'text-[#5B4638] hover:text-[#2A2421]'
              }`}
            >
              <List size={14} strokeWidth={1.75} />
            </button>
          </div>
          <Button variant="primary" size="sm" onClick={openNew}>
            + Agregar Speaker
          </Button>
        </div>
      </div>

      {loading && (
        <p className="font-sans text-xs uppercase tracking-widest text-[#5B4638]/50 py-14 text-center">
          Cargando speakers...
        </p>
      )}

      {/* Grid view */}
      {!loading && view === 'grid' && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {speakers.length === 0 ? (
            <p className="col-span-3 font-sans text-xs uppercase tracking-widest text-[#5B4638]/50 py-14 text-center">
              Sin speakers registrados
            </p>
          ) : speakers.map((sp, i) => (
            <div key={sp.id} className="border border-[#EAE1D6] bg-[#FDFAF7] p-6 hover:border-[#D7C6B2] transition-colors">
              <div className={`h-16 w-16 ${bgColors[i % bgColors.length]} flex items-center justify-center mb-5`}>
                <span className="font-sans text-lg font-medium text-[#F7F3EE]">{initials(sp.name)}</span>
              </div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm font-medium text-[#2A2421] leading-snug">{sp.name}</p>
                  <p className="font-sans text-[10px] uppercase tracking-wider text-[#5B4638] mt-0.5">{sp.title ?? ''}</p>
                  <p className="font-sans text-[10px] text-[#A56E52] mt-0.5">{sp.organization ?? ''}</p>
                </div>
                {sp.featured && (
                  <span className="border border-[#A56E52] px-2 py-0.5 font-sans text-[8px] uppercase tracking-widest text-[#A56E52] shrink-0">
                    Dest.
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(sp.expertise ?? []).slice(0, 3).map((tag) => (
                  <span key={tag} className="border border-[#D7C6B2] px-2 py-0.5 font-sans text-[8px] uppercase tracking-wider text-[#5B4638]">
                    {tag}
                  </span>
                ))}
                {(sp.expertise ?? []).length > 3 && (
                  <span className="px-2 py-0.5 font-sans text-[8px] uppercase tracking-wider text-[#5B4638]/50">
                    +{(sp.expertise ?? []).length - 3}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(sp)}
                  className="flex-1 border border-[#D7C6B2] py-2 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(sp.id)}
                  className="flex-1 border border-[#D7C6B2] py-2 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-red-400 hover:text-red-500 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {!loading && view === 'list' && (
        <div className="border border-[#EAE1D6] bg-[#FDFAF7] overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EAE1D6]">
                <th className="px-7 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">Nombre</th>
                <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden md:table-cell">Título</th>
                <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden lg:table-cell">Organización</th>
                <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden lg:table-cell">Expertise</th>
                <th className="px-7 py-5 text-right font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {speakers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-7 py-14 text-center font-sans text-xs uppercase tracking-widest text-[#5B4638]/50">
                    Sin speakers registrados
                  </td>
                </tr>
              ) : speakers.map((sp, i) => (
                <tr key={sp.id} className="border-b border-[#EAE1D6]/60 hover:bg-[#F7F3EE] transition-colors">
                  <td className="px-7 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`h-9 w-9 ${bgColors[i % bgColors.length]} flex items-center justify-center shrink-0`}>
                        <span className="font-sans text-[10px] font-medium text-[#F7F3EE]">{initials(sp.name)}</span>
                      </div>
                      <div>
                        <p className="font-sans text-sm text-[#2A2421] font-medium">{sp.name}</p>
                        <p className="font-sans text-[10px] text-[#5B4638]">{sp.organization ?? ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-6 hidden md:table-cell">
                    <p className="font-sans text-xs text-[#2A2421]">{sp.title ?? '—'}</p>
                  </td>
                  <td className="px-4 py-6 hidden lg:table-cell">
                    <p className="font-sans text-xs text-[#2A2421]">{sp.organization ?? '—'}</p>
                  </td>
                  <td className="px-4 py-6 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(sp.expertise ?? []).slice(0, 2).map((tag) => (
                        <span key={tag} className="border border-[#D7C6B2] px-2 py-0.5 font-sans text-[8px] uppercase tracking-wider text-[#5B4638]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-7 py-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(sp)}
                        className="border border-[#D7C6B2] px-3 py-1.5 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(sp.id)}
                        className="border border-[#D7C6B2] px-3 py-1.5 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-red-400 hover:text-red-500 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#2A2421]/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg border border-[#EAE1D6] bg-[#FDFAF7] shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-[#EAE1D6] px-8 py-6 flex items-center justify-between">
              <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">
                {editSpeaker ? 'Editar Speaker' : 'Agregar Speaker'}
              </p>
              <button onClick={() => setModalOpen(false)} className="font-sans text-[#5B4638] hover:text-[#2A2421] transition-colors text-lg leading-none">×</button>
            </div>
            <div className="px-8 py-7 space-y-5">
              {[
                { field: 'name',         label: 'Nombre completo',            placeholder: 'Ana García' },
                { field: 'title',        label: 'Cargo / Título',             placeholder: 'CEO, Directora...' },
                { field: 'organization', label: 'Organización',               placeholder: 'Nombre de organización' },
                { field: 'instagram',    label: 'Instagram (@handle)',        placeholder: '@handle' },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">{label}</label>
                  <input
                    type="text"
                    value={form[field as keyof FormState] as string}
                    onChange={(e) => updateForm(field as keyof FormState, e.target.value)}
                    placeholder={placeholder}
                    className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => updateForm('bio', e.target.value)}
                  rows={3}
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">
                  Expertise (separados por coma)
                </label>
                <input
                  type="text"
                  value={form.expertise}
                  onChange={(e) => updateForm('expertise', e.target.value)}
                  placeholder="Liderazgo, Wellness, Innovación"
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => updateForm('featured', e.target.checked)}
                  className="w-4 h-4 accent-[#A56E52]"
                />
                <span className="font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">Destacar en el sitio</span>
              </label>
            </div>
            <div className="border-t border-[#EAE1D6] px-8 py-5 flex items-center justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>Guardar</Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
