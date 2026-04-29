'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { LayoutGrid, List, ArrowUp, ArrowDown, ChevronsUp, ChevronsDown } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import MediaPicker from '@/components/admin/MediaPicker';
import { getSpeakers, upsertSpeaker, deleteSpeaker, reorderSpeakers } from '@/app/actions/speakers';
import type { DBSpeaker } from '@/types/supabase';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { t, tr } from '@/lib/i18n/translations';

type ViewMode = 'grid' | 'list';

const emptyForm = {
  name: '', title: '', title_en: '', organization: '', bio: '', bio_en: '',
  expertise: '', instagram: '', featured: false, image_url: '',
};
type FormState = typeof emptyForm;

const bgColors = [
  'bg-[#A56E52]', 'bg-[#5B4638]', 'bg-[#2A2421]', 'bg-[#D7C6B2]',
  'bg-[#EAE1D6]', 'bg-[#A56E52]/70', 'bg-[#5B4638]/70', 'bg-[#2A2421]/80',
];

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

export default function AdminSpeakersPage() {
  const { lang } = useLanguage();
  const asp = t.adminSpeakers;

  const [speakers, setSpeakers]       = useState<DBSpeaker[]>([]);
  const [loading, setLoading]         = useState(true);
  const [view, setView]               = useState<ViewMode>('grid');
  const [modalOpen, setModalOpen]     = useState(false);
  const [editSpeaker, setEditSpeaker] = useState<DBSpeaker | null>(null);
  const [form, setForm]               = useState<FormState>(emptyForm);
  const [saving, setSaving]           = useState(false);
  const [toast, setToast]             = useState('');

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
      name:         sp.name,
      title:        sp.title ?? '',
      title_en:     sp.title_en ?? '',
      organization: sp.organization ?? '',
      bio:          sp.bio ?? '',
      bio_en:       sp.bio_en ?? '',
      expertise:    (sp.expertise ?? []).join(', '),
      instagram:    sp.instagram ?? '',
      featured:     sp.featured,
      image_url:    sp.image_url ?? '',
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const fd = new FormData();
    if (editSpeaker) fd.append('id', editSpeaker.id);
    fd.append('name',         form.name);
    fd.append('title',        form.title);
    fd.append('title_en',     form.title_en);
    fd.append('organization', form.organization);
    fd.append('bio',          form.bio);
    fd.append('bio_en',       form.bio_en);
    fd.append('expertise',    form.expertise);
    fd.append('instagram',    form.instagram);
    fd.append('featured',     String(form.featured));
    fd.append('image_url',    form.image_url);

    const result = await upsertSpeaker(fd);
    if (result?.error) {
      showToast(tr(asp.toastError, lang));
    } else {
      const { data } = await getSpeakers();
      setSpeakers(data as DBSpeaker[]);
      showToast(editSpeaker ? tr(asp.toastUpdated, lang) : tr(asp.toastCreated, lang));
      setModalOpen(false);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm(tr(asp.deleteConfirm, lang))) return;
    await deleteSpeaker(id);
    setSpeakers((prev) => prev.filter((s) => s.id !== id));
    showToast(tr(asp.toastDeleted, lang));
  }

  async function persistOrder(next: DBSpeaker[]) {
    setSpeakers(next);
    const result = await reorderSpeakers(next.map((s) => s.id));
    if (result?.error) {
      showToast(tr(asp.saveFailed, lang));
    } else {
      showToast(tr(asp.saved, lang));
    }
  }

  function moveSpeaker(index: number, direction: 'up' | 'down' | 'top' | 'bottom') {
    if (speakers.length < 2) return;
    const next = [...speakers];
    const [item] = next.splice(index, 1);
    let target = index;
    if (direction === 'up')      target = Math.max(0, index - 1);
    if (direction === 'down')    target = Math.min(next.length, index + 1);
    if (direction === 'top')     target = 0;
    if (direction === 'bottom')  target = next.length;
    next.splice(target, 0, item);
    void persistOrder(next);
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
          <h2 className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">{tr(asp.pageTitle, lang)}</h2>
          <p className="mt-1 font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">
            {loading ? tr(asp.loadingSpeakers, lang) : `${speakers.length} ${tr(asp.totalSpeakers, lang)}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border border-[#D7C6B2]">
            <button onClick={() => setView('grid')} aria-label={tr(asp.gridView, lang)}
              className={`flex items-center justify-center px-3 py-2 transition-colors ${view === 'grid' ? 'bg-[#2A2421] text-[#F7F3EE]' : 'text-[#5B4638] hover:text-[#2A2421]'}`}>
              <LayoutGrid size={14} strokeWidth={1.75} />
            </button>
            <button onClick={() => setView('list')} aria-label={tr(asp.listView, lang)}
              className={`flex items-center justify-center px-3 py-2 transition-colors border-l border-[#D7C6B2] ${view === 'list' ? 'bg-[#2A2421] text-[#F7F3EE]' : 'text-[#5B4638] hover:text-[#2A2421]'}`}>
              <List size={14} strokeWidth={1.75} />
            </button>
          </div>
          <Button variant="primary" size="sm" onClick={openNew}>{tr(asp.addSpeaker, lang)}</Button>
        </div>
      </div>

      {loading && (
        <p className="font-sans text-xs uppercase tracking-widest text-[#5B4638]/50 py-14 text-center">
          {tr(asp.loadingSpeakers, lang)}
        </p>
      )}

      {/* Grid view */}
      {!loading && view === 'grid' && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {speakers.length === 0 ? (
            <p className="col-span-3 font-sans text-xs uppercase tracking-widest text-[#5B4638]/50 py-14 text-center">
              {tr(asp.noSpeakers, lang)}
            </p>
          ) : speakers.map((sp, i) => (
            <div key={sp.id} className="border border-[#EAE1D6] bg-[#FDFAF7] p-6 hover:border-[#D7C6B2] transition-colors">
              {sp.image_url ? (
                <div className="relative h-16 w-16 overflow-hidden mb-5">
                  <Image src={sp.image_url} alt={sp.name} fill className="object-cover" sizes="64px" unoptimized />
                </div>
              ) : (
                <div className={`h-16 w-16 ${bgColors[i % bgColors.length]} flex items-center justify-center mb-5`}>
                  <span className="font-sans text-lg font-medium text-[#F7F3EE]">{initials(sp.name)}</span>
                </div>
              )}

              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm font-medium text-[#2A2421] leading-snug">{sp.name}</p>
                  <p className="font-sans text-[10px] uppercase tracking-wider text-[#5B4638] mt-0.5">{sp.title ?? ''}</p>
                  <p className="font-sans text-[10px] text-[#A56E52] mt-0.5">{sp.organization ?? ''}</p>
                </div>
                {sp.featured && (
                  <span className="border border-[#A56E52] px-2 py-0.5 font-sans text-[8px] uppercase tracking-widest text-[#A56E52] shrink-0">
                    {tr(asp.featuredBadge, lang)}
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
                <button onClick={() => openEdit(sp)}
                  className="flex-1 border border-[#D7C6B2] py-2.5 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] transition-colors">
                  {tr(asp.edit, lang)}
                </button>
                <button onClick={() => handleDelete(sp.id)}
                  className="flex-1 border border-[#D7C6B2] py-2.5 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-red-400 hover:text-red-500 transition-colors">
                  {tr(asp.delete, lang)}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view (with ordering controls) */}
      {!loading && view === 'list' && (
        <>
          <p className="mb-4 font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">
            {tr(asp.orderingHelp, lang)}
          </p>
          <div className="border border-[#EAE1D6] bg-[#FDFAF7] overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#EAE1D6]">
                  <th className="px-3 py-5 w-12 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">#</th>
                  <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">{tr(asp.nameCol, lang)}</th>
                  <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden md:table-cell">{tr(asp.titleCol, lang)}</th>
                  <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden lg:table-cell">{tr(asp.expertiseCol, lang)}</th>
                  <th className="px-4 py-5 text-center font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">{tr(asp.orderingTitle, lang)}</th>
                  <th className="px-7 py-5 text-right font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">{tr(asp.actionsCol, lang)}</th>
                </tr>
              </thead>
              <tbody>
                {speakers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-7 py-14 text-center font-sans text-xs uppercase tracking-widest text-[#5B4638]/50">
                      {tr(asp.noSpeakers, lang)}
                    </td>
                  </tr>
                ) : speakers.map((sp, i) => (
                  <tr key={sp.id} className="border-b border-[#EAE1D6]/60 hover:bg-[#F7F3EE] transition-colors">
                    <td className="px-3 py-5 font-sans text-[11px] tabular-nums text-[#5B4638]">
                      {i + 1}
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-4">
                        {sp.image_url ? (
                          <div className="relative h-9 w-9 shrink-0 overflow-hidden">
                            <Image src={sp.image_url} alt={sp.name} fill className="object-cover" sizes="36px" unoptimized />
                          </div>
                        ) : (
                          <div className={`h-9 w-9 ${bgColors[i % bgColors.length]} flex items-center justify-center shrink-0`}>
                            <span className="font-sans text-[10px] font-medium text-[#F7F3EE]">{initials(sp.name)}</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-sans text-sm text-[#2A2421] font-medium truncate">{sp.name}</p>
                          <p className="font-sans text-[10px] text-[#5B4638] truncate">{sp.organization ?? ''}</p>
                          {sp.featured && (
                            <span className="inline-block mt-1 border border-[#A56E52] px-1.5 py-0.5 font-sans text-[8px] uppercase tracking-widest text-[#A56E52]">
                              {tr(asp.featuredBadge, lang)}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 hidden md:table-cell">
                      <p className="font-sans text-xs text-[#2A2421]">{sp.title ?? '—'}</p>
                    </td>
                    <td className="px-4 py-5 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(sp.expertise ?? []).slice(0, 2).map((tag) => (
                          <span key={tag} className="border border-[#D7C6B2] px-2 py-0.5 font-sans text-[8px] uppercase tracking-wider text-[#5B4638]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveSpeaker(i, 'top')}
                          disabled={i === 0}
                          aria-label={tr(asp.moveTop, lang)}
                          title={tr(asp.moveTop, lang)}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center border border-[#D7C6B2] text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronsUp size={14} strokeWidth={1.75} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSpeaker(i, 'up')}
                          disabled={i === 0}
                          aria-label={tr(asp.moveUp, lang)}
                          title={tr(asp.moveUp, lang)}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center border border-[#D7C6B2] text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ArrowUp size={14} strokeWidth={1.75} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSpeaker(i, 'down')}
                          disabled={i === speakers.length - 1}
                          aria-label={tr(asp.moveDown, lang)}
                          title={tr(asp.moveDown, lang)}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center border border-[#D7C6B2] text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ArrowDown size={14} strokeWidth={1.75} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSpeaker(i, 'bottom')}
                          disabled={i === speakers.length - 1}
                          aria-label={tr(asp.moveBottom, lang)}
                          title={tr(asp.moveBottom, lang)}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center border border-[#D7C6B2] text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronsDown size={14} strokeWidth={1.75} />
                        </button>
                      </div>
                    </td>
                    <td className="px-7 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(sp)}
                          className="border border-[#D7C6B2] px-3 py-2 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] transition-colors">
                          {tr(asp.edit, lang)}
                        </button>
                        <button onClick={() => handleDelete(sp.id)}
                          className="border border-[#D7C6B2] px-3 py-2 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-red-400 hover:text-red-500 transition-colors">
                          {tr(asp.delete, lang)}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-[#2A2421]/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full sm:max-w-lg border border-[#EAE1D6] bg-[#FDFAF7] shadow-2xl mx-0 sm:mx-4 max-h-[92vh] overflow-y-auto rounded-t-lg sm:rounded-none">
            <div className="border-b border-[#EAE1D6] px-6 py-5 flex items-center justify-between">
              <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">
                {editSpeaker ? tr(asp.editModal, lang) : tr(asp.newModal, lang)}
              </p>
              <button onClick={() => setModalOpen(false)} className="font-sans text-[#5B4638] hover:text-[#2A2421] transition-colors text-xl leading-none p-1">×</button>
            </div>
            <div className="px-6 py-6 space-y-5">

              <MediaPicker
                value={form.image_url}
                onChange={(url) => updateForm('image_url', url)}
                accept="image"
                label={tr(asp.photoLbl, lang)}
              />

              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">{tr(asp.nameLbl, lang)}</label>
                <input type="text" value={form.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  placeholder="Ana García"
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors" />
              </div>

              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">{tr(asp.titleLbl, lang)}</label>
                <input type="text" value={form.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                  placeholder="CEO, Directora..."
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors" />
              </div>

              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">{tr(asp.titleEnLbl, lang)}</label>
                <input type="text" value={form.title_en}
                  onChange={(e) => updateForm('title_en', e.target.value)}
                  placeholder="CEO, Director..."
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors" />
              </div>

              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">{tr(asp.orgLbl, lang)}</label>
                <input type="text" value={form.organization}
                  onChange={(e) => updateForm('organization', e.target.value)}
                  placeholder="Nombre de organización"
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors" />
              </div>

              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">{tr(asp.instagramLbl, lang)}</label>
                <input type="text" value={form.instagram}
                  onChange={(e) => updateForm('instagram', e.target.value)}
                  placeholder="@handle"
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors" />
              </div>

              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">{tr(asp.bioLbl, lang)}</label>
                <textarea value={form.bio} onChange={(e) => updateForm('bio', e.target.value)} rows={3}
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors resize-none" />
              </div>

              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">{tr(asp.bioEnLbl, lang)}</label>
                <textarea value={form.bio_en} onChange={(e) => updateForm('bio_en', e.target.value)} rows={3}
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors resize-none" />
              </div>

              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">
                  {tr(asp.expertiseLbl, lang)}
                </label>
                <input type="text" value={form.expertise} onChange={(e) => updateForm('expertise', e.target.value)}
                  placeholder="Liderazgo, Wellness, Innovación"
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors" />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.featured}
                  onChange={(e) => updateForm('featured', e.target.checked)}
                  className="w-4 h-4 accent-[#A56E52]" />
                <span className="font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">{tr(asp.featuredToggle, lang)}</span>
              </label>
            </div>
            <div className="border-t border-[#EAE1D6] px-6 py-5 flex items-center justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>{tr(asp.cancel, lang)}</Button>
              <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
                {saving ? tr(asp.saving, lang) : tr(asp.saveSpeaker, lang)}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
