'use client';

import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import { speakers, type Speaker } from '@/lib/data';

type ViewMode = 'grid' | 'list';

const emptyForm = { name: '', title: '', organization: '', bio: '', expertise: '' };
type FormState = typeof emptyForm;

const bgColors = [
  'bg-[#A56E52]',
  'bg-[#5B4638]',
  'bg-[#2A2421]',
  'bg-[#D7C6B2]',
  'bg-[#EAE1D6]',
  'bg-[#A56E52]/70',
  'bg-[#5B4638]/70',
  'bg-[#2A2421]/80',
];

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function AdminSpeakersPage() {
  const [view, setView] = useState<ViewMode>('grid');
  const [modalOpen, setModalOpen] = useState(false);
  const [editSpeaker, setEditSpeaker] = useState<Speaker | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [toast, setToast] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  }

  function openNew() {
    setEditSpeaker(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(sp: Speaker) {
    setEditSpeaker(sp);
    setForm({
      name: sp.name,
      title: sp.title,
      organization: sp.organization,
      bio: sp.bio,
      expertise: sp.expertise.join(', '),
    });
    setModalOpen(true);
  }

  function handleSave() {
    setModalOpen(false);
    showToast(editSpeaker ? 'Speaker actualizado (demo)' : 'Speaker agregado (demo)');
  }

  function updateForm(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <AdminLayout>
      {/* Toast */}
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
            {speakers.length} speakers registrados
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex border border-[#D7C6B2]">
            <button
              onClick={() => setView('grid')}
              title="Vista cuadrícula"
              className={`px-4 py-2 font-sans text-[10px] uppercase tracking-widest transition-colors ${
                view === 'grid'
                  ? 'bg-[#2A2421] text-[#F7F3EE]'
                  : 'text-[#5B4638] hover:text-[#2A2421]'
              }`}
            >
              ⊞
            </button>
            <button
              onClick={() => setView('list')}
              title="Vista lista"
              className={`px-4 py-2 font-sans text-[10px] uppercase tracking-widest transition-colors border-l border-[#D7C6B2] ${
                view === 'list'
                  ? 'bg-[#2A2421] text-[#F7F3EE]'
                  : 'text-[#5B4638] hover:text-[#2A2421]'
              }`}
            >
              ☰
            </button>
          </div>
          <Button variant="primary" size="sm" onClick={openNew}>
            + Agregar Speaker
          </Button>
        </div>
      </div>

      {/* Grid view */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {speakers.map((sp, i) => (
            <div
              key={sp.id}
              className="border border-[#EAE1D6] bg-[#FDFAF7] p-6 hover:border-[#D7C6B2] transition-colors"
            >
              {/* Avatar placeholder (aspect-square feel with fixed size) */}
              <div
                className={`h-16 w-16 ${bgColors[i % bgColors.length]} flex items-center justify-center mb-5`}
              >
                <span className="font-sans text-lg font-medium text-[#F7F3EE]">
                  {initials(sp.name)}
                </span>
              </div>

              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm font-medium text-[#2A2421] leading-snug">{sp.name}</p>
                  <p className="font-sans text-[10px] uppercase tracking-wider text-[#5B4638] mt-0.5">{sp.title}</p>
                  <p className="font-sans text-[10px] text-[#A56E52] mt-0.5">{sp.organization}</p>
                </div>
                {sp.featured && (
                  <span className="border border-[#A56E52] px-2 py-0.5 font-sans text-[8px] uppercase tracking-widest text-[#A56E52] shrink-0">
                    Dest.
                  </span>
                )}
              </div>

              {/* Expertise tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {sp.expertise.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="border border-[#D7C6B2] px-2 py-0.5 font-sans text-[8px] uppercase tracking-wider text-[#5B4638]"
                  >
                    {tag}
                  </span>
                ))}
                {sp.expertise.length > 3 && (
                  <span className="px-2 py-0.5 font-sans text-[8px] uppercase tracking-wider text-[#5B4638]/50">
                    +{sp.expertise.length - 3}
                  </span>
                )}
              </div>

              <p className="font-sans text-[9px] uppercase tracking-wider text-[#5B4638]/60 mb-5">
                {sp.eventIds.length} evento{sp.eventIds.length !== 1 ? 's' : ''}
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(sp)}
                  className="flex-1 border border-[#D7C6B2] py-2 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] transition-colors"
                >
                  Editar
                </button>
                <button className="flex-1 border border-[#2A2421] py-2 font-sans text-[9px] uppercase tracking-widest text-[#2A2421] hover:bg-[#2A2421] hover:text-[#F7F3EE] transition-colors">
                  Ver perfil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="border border-[#EAE1D6] bg-[#FDFAF7] overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EAE1D6]">
                <th className="px-7 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">Nombre</th>
                <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden md:table-cell">Título</th>
                <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden lg:table-cell">Organización</th>
                <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden lg:table-cell">Expertise</th>
                <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden xl:table-cell">Eventos</th>
                <th className="px-7 py-5 text-right font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {speakers.map((sp, i) => (
                <tr
                  key={sp.id}
                  className="border-b border-[#EAE1D6]/60 hover:bg-[#F7F3EE] transition-colors"
                >
                  <td className="px-7 py-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-9 w-9 ${bgColors[i % bgColors.length]} flex items-center justify-center shrink-0`}
                      >
                        <span className="font-sans text-[10px] font-medium text-[#F7F3EE]">{initials(sp.name)}</span>
                      </div>
                      <div>
                        <p className="font-sans text-sm text-[#2A2421] font-medium">{sp.name}</p>
                        <p className="font-sans text-[10px] text-[#5B4638]">{sp.organization}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-6 hidden md:table-cell">
                    <p className="font-sans text-xs text-[#2A2421]">{sp.title}</p>
                  </td>
                  <td className="px-4 py-6 hidden lg:table-cell">
                    <p className="font-sans text-xs text-[#2A2421]">{sp.organization}</p>
                  </td>
                  <td className="px-4 py-6 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {sp.expertise.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="border border-[#D7C6B2] px-2 py-0.5 font-sans text-[8px] uppercase tracking-wider text-[#5B4638]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-6 hidden xl:table-cell">
                    <p className="font-sans text-xs text-[#5B4638]">{sp.eventIds.length}</p>
                  </td>
                  <td className="px-7 py-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(sp)}
                        className="border border-[#D7C6B2] px-3 py-1.5 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] transition-colors"
                      >
                        Editar
                      </button>
                      <button className="border border-[#D7C6B2] px-3 py-1.5 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] transition-colors">
                        Ver perfil
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
          <div
            className="absolute inset-0 bg-[#2A2421]/60 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg border border-[#EAE1D6] bg-[#FDFAF7] shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-[#EAE1D6] px-8 py-6 flex items-center justify-between">
              <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">
                {editSpeaker ? 'Editar Speaker' : 'Agregar Speaker'}
              </p>
              <button
                onClick={() => setModalOpen(false)}
                className="font-sans text-[#5B4638] hover:text-[#2A2421] transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div className="px-8 py-7 space-y-5">
              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors"
                />
              </div>
              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">
                  Cargo / Título
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors"
                />
              </div>
              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">
                  Organización
                </label>
                <input
                  type="text"
                  value={form.organization}
                  onChange={(e) => updateForm('organization', e.target.value)}
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors"
                />
              </div>
              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">
                  Bio
                </label>
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
                  placeholder="Liderazgo, Wellness, Innovacion"
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors"
                />
              </div>
            </div>
            <div className="border-t border-[#EAE1D6] px-8 py-5 flex items-center justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave}>
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
