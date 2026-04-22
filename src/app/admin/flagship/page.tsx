'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  getAllFlagshipEvents,
  createFlagshipEvent,
  updateFlagshipEvent,
  deleteFlagshipEvent,
} from '@/app/actions/flagship';
import type { DBFlagshipEvent, FlagshipVenue } from '@/types/supabase';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { t, tr } from '@/lib/i18n/translations';

// ── Style tokens ──────────────────────────────────────────────
const inp      = 'w-full border border-[#D7C6B2] bg-transparent px-4 py-3 text-sm text-[#2A2421] placeholder-[#5B4638]/40 focus:border-[#2A2421] focus:outline-none transition-colors duration-200';
const lbl      = 'block text-[10px] tracking-widest uppercase text-[#5B4638] mb-1.5';
const textarea = `${inp} resize-none`;
const btnPrimary   = 'border border-[#2A2421] bg-[#2A2421] px-6 py-2.5 font-sans text-[10px] tracking-widest uppercase text-[#F7F3EE] hover:bg-[#5B4638] transition-colors disabled:opacity-50';
const btnSecondary = 'border border-[#D7C6B2] px-6 py-2.5 font-sans text-[10px] tracking-widest uppercase text-[#5B4638] hover:border-[#5B4638] hover:text-[#2A2421] transition-colors';
const btnDanger    = 'border border-red-200 px-4 py-2 font-sans text-[10px] tracking-widest uppercase text-red-500 hover:bg-red-50 transition-colors';

// ── Blank form state ──────────────────────────────────────────
function emptyForm() {
  return {
    title:          '',
    description_es: '',
    description_en: '',
    sort_order:     0,
    active:         true,
    venues:         [] as FlagshipVenue[],
  };
}

function emptyVenue(): FlagshipVenue {
  return { city: '', region: '', date_es: '', date_en: '', tag_es: '', tag_en: '' };
}

// ── Field wrapper ─────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={lbl}>{label}</label>
      {children}
    </div>
  );
}

export default function AdminFlagshipPage() {
  const { lang } = useLanguage();
  const af = t.adminFlagship;

  const [events,  setEvents]  = useState<DBFlagshipEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState('');
  const [toastErr, setToastErr] = useState(false);

  // null = list view, 'new' = create form, uuid string = edit form
  const [editing, setEditing] = useState<'new' | string | null>(null);
  const [form,    setForm]    = useState(emptyForm());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // ── Load ─────────────────────────────────────────────────────
  useEffect(() => {
    getAllFlagshipEvents().then(({ data }) => {
      setEvents(data ?? []);
      setLoading(false);
    });
  }, []);

  function showToast(msg: string, isErr = false) {
    setToast(msg); setToastErr(isErr);
    setTimeout(() => setToast(''), 4000);
  }

  // ── Open forms ───────────────────────────────────────────────
  function openCreate() {
    setForm(emptyForm());
    setEditing('new');
  }

  function openEdit(ev: DBFlagshipEvent) {
    setForm({
      title:          ev.title,
      description_es: ev.description_es ?? '',
      description_en: ev.description_en ?? '',
      sort_order:     ev.sort_order,
      active:         ev.active,
      venues:         (ev.venues as FlagshipVenue[]) ?? [],
    });
    setEditing(ev.id);
  }

  function closeForm() { setEditing(null); }

  // ── Form field helpers ────────────────────────────────────────
  function set(key: string, value: unknown) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function addVenue() {
    setForm(prev => ({ ...prev, venues: [...prev.venues, emptyVenue()] }));
  }

  function removeVenue(i: number) {
    setForm(prev => ({ ...prev, venues: prev.venues.filter((_, idx) => idx !== i) }));
  }

  function updateVenue(i: number, field: keyof FlagshipVenue, value: string) {
    setForm(prev => {
      const venues = [...prev.venues];
      venues[i] = { ...venues[i], [field]: value };
      return { ...prev, venues };
    });
  }

  function buildFormData() {
    const fd = new FormData();
    fd.append('title',          form.title);
    fd.append('description_es', form.description_es);
    fd.append('description_en', form.description_en);
    fd.append('sort_order',     String(form.sort_order));
    fd.append('active',         String(form.active));
    fd.append('venues',         JSON.stringify(form.venues));
    return fd;
  }

  // ── Save ──────────────────────────────────────────────────────
  async function handleSave() {
    if (!form.title.trim()) { showToast(tr(af.toastValidation, lang), true); return; }
    setSaving(true);
    const fd  = buildFormData();
    const res = editing === 'new'
      ? await createFlagshipEvent(fd)
      : await updateFlagshipEvent(editing as string, fd);
    setSaving(false);
    if (res.error) { showToast('Error: ' + res.error, true); return; }
    showToast(editing === 'new' ? tr(af.toastCreated, lang) : tr(af.toastSaved, lang));
    const { data } = await getAllFlagshipEvents();
    setEvents(data ?? []);
    closeForm();
  }

  // ── Delete ────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    const res = await deleteFlagshipEvent(id);
    setConfirmDelete(null);
    if (res.error) { showToast('Error: ' + res.error, true); return; }
    showToast(tr(af.toastDeleted, lang));
    setEvents(prev => prev.filter(e => e.id !== id));
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <AdminLayout>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 border px-6 py-4 shadow-lg text-xs font-sans uppercase tracking-widest ${toastErr ? 'border-red-300 bg-red-50 text-red-700' : 'border-[#A56E52] bg-[#FDFAF7] text-[#A56E52]'}`}>
          {toast}
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-[#FDFAF7] border border-[#D7C6B2] p-8 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="font-serif text-lg text-[#2A2421] mb-2">{tr(af.deleteConfirmTitle, lang)}</h3>
            <p className="font-sans text-sm text-[#5B4638] mb-6">
              {tr(af.deleteConfirmBody, lang)}
            </p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(confirmDelete)} className="border border-red-400 bg-red-50 px-6 py-2.5 font-sans text-[10px] tracking-widest uppercase text-red-600 hover:bg-red-100 transition-colors">
                {tr(af.removeVenue, lang)}
              </button>
              <button onClick={() => setConfirmDelete(null)} className={btnSecondary}>
                {tr(af.cancel, lang)}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl">
        {/* ── Header ── */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl text-[#2A2421]">{tr(af.pageTitle, lang)}</h2>
            <p className="mt-1 text-sm text-[#5B4638]">
              {tr(af.description, lang)}
            </p>
          </div>
          {editing === null && (
            <button onClick={openCreate} className={btnPrimary}>
              {tr(af.newEvent, lang)}
            </button>
          )}
        </div>

        {/* ── Create / Edit form ── */}
        {editing !== null && (
          <div className="mb-10 border border-[#D7C6B2] bg-[#FDFAF7] p-6 md:p-8">
            <h3 className="font-serif text-lg text-[#2A2421] mb-6">
              {editing === 'new' ? tr(af.newModal, lang) : tr(af.editModal, lang)}
            </h3>

            <div className="space-y-6">
              {/* Title */}
              <Field label={tr(af.titleLbl, lang)}>
                <input
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  className={inp}
                  placeholder="The Real Happiness MasterClass Summit IV"
                />
              </Field>

              {/* Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label={tr(af.descEsLbl, lang)}>
                  <textarea
                    rows={3}
                    value={form.description_es}
                    onChange={e => set('description_es', e.target.value)}
                    className={textarea}
                    placeholder="Descripción en español…"
                  />
                </Field>
                <Field label={tr(af.descEnLbl, lang)}>
                  <textarea
                    rows={3}
                    value={form.description_en}
                    onChange={e => set('description_en', e.target.value)}
                    className={textarea}
                    placeholder="Description in English…"
                  />
                </Field>
              </div>

              {/* Sort order + Active */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field label={tr(af.sortOrderLbl, lang)}>
                  <input
                    type="number"
                    min={0}
                    value={form.sort_order}
                    onChange={e => set('sort_order', Number(e.target.value))}
                    className={inp}
                  />
                </Field>
                <Field label={tr(af.statusLbl, lang)}>
                  <select
                    value={form.active ? 'true' : 'false'}
                    onChange={e => set('active', e.target.value === 'true')}
                    className={inp}
                  >
                    <option value="true">{tr(af.activeOpt, lang)}</option>
                    <option value="false">{tr(af.inactiveOpt, lang)}</option>
                  </select>
                </Field>
              </div>

              {/* Venues */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className={lbl + ' mb-0'}>{tr(af.venuesSection, lang)}</p>
                  <button
                    type="button"
                    onClick={addVenue}
                    className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52] border border-[#A56E52]/40 px-3 py-1.5 hover:bg-[#A56E52]/5 transition-colors"
                  >
                    {tr(af.addVenue, lang)}
                  </button>
                </div>

                {form.venues.length === 0 && (
                  <p className="font-sans text-xs text-[#5B4638]/50 py-4 text-center border border-dashed border-[#D7C6B2]">
                    {tr(af.noVenues, lang)}
                  </p>
                )}

                <div className="space-y-4">
                  {form.venues.map((venue, i) => (
                    <div key={i} className="border border-[#D7C6B2] p-4 relative">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52]">
                          {tr(af.venueHeader, lang)} {String(i + 1).padStart(2, '0')}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeVenue(i)}
                          className={btnDanger}
                          aria-label={tr(af.removeVenue, lang)}
                        >
                          {tr(af.removeVenue, lang)}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <Field label={tr(af.cityLbl, lang)}>
                          <input value={venue.city} onChange={e => updateVenue(i, 'city', e.target.value)} className={inp} placeholder="Miami" />
                        </Field>
                        <Field label={tr(af.regionLbl, lang)}>
                          <input value={venue.region} onChange={e => updateVenue(i, 'region', e.target.value)} className={inp} placeholder="Florida, USA" />
                        </Field>
                        <Field label={tr(af.dateEsLbl, lang)}>
                          <input value={venue.date_es} onChange={e => updateVenue(i, 'date_es', e.target.value)} className={inp} placeholder="Agosto 29, 2026" />
                        </Field>
                        <Field label={tr(af.dateEnLbl, lang)}>
                          <input value={venue.date_en} onChange={e => updateVenue(i, 'date_en', e.target.value)} className={inp} placeholder="August 29, 2026" />
                        </Field>
                        <Field label={tr(af.tagEsLbl, lang)}>
                          <input value={venue.tag_es} onChange={e => updateVenue(i, 'tag_es', e.target.value)} className={inp} placeholder="Primera sede" />
                        </Field>
                        <Field label={tr(af.tagEnLbl, lang)}>
                          <input value={venue.tag_en} onChange={e => updateVenue(i, 'tag_en', e.target.value)} className={inp} placeholder="1st venue" />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form actions */}
              <div className="flex items-center gap-4 pt-4 border-t border-[#EAE1D6]">
                <button onClick={handleSave} disabled={saving} className={btnPrimary}>
                  {saving ? tr(af.saving, lang) : editing === 'new' ? tr(af.createEvent, lang) : tr(af.saveChanges, lang)}
                </button>
                <button onClick={closeForm} className={btnSecondary}>
                  {tr(af.cancel, lang)}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Event list ── */}
        {loading ? (
          <p className="font-sans text-xs uppercase tracking-widest text-[#5B4638]/50 py-8">{tr(af.loading, lang)}</p>
        ) : events.length === 0 ? (
          <div className="border border-dashed border-[#D7C6B2] py-16 text-center">
            <p className="font-sans text-sm text-[#5B4638]">{tr(af.noEvents, lang)}</p>
          </div>
        ) : (
          <div className="divide-y divide-[#EAE1D6] border border-[#EAE1D6]">
            {events.map(ev => (
              <div key={ev.id} className="flex items-start justify-between gap-4 px-6 py-5 hover:bg-[#FDFAF7]/60">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-serif text-base text-[#2A2421] truncate">{ev.title}</span>
                    <span className={`font-sans text-[9px] uppercase tracking-widest px-2 py-0.5 ${ev.active ? 'bg-[#A56E52]/10 text-[#A56E52]' : 'bg-[#EAE1D6] text-[#5B4638]'}`}>
                      {ev.active ? tr(af.activeOpt, lang) : tr(af.inactiveOpt, lang)}
                    </span>
                  </div>
                  <p className="font-sans text-xs text-[#5B4638]/70">
                    {(ev.venues as FlagshipVenue[])?.length ?? 0} {tr(af.venuesSection, lang).toLowerCase()} · {tr(af.sortOrderLbl, lang)}: {ev.sort_order}
                  </p>
                  {ev.description_es && (
                    <p className="font-sans text-xs text-[#5B4638]/50 mt-0.5 truncate max-w-md">
                      {ev.description_es}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(ev)} className={btnSecondary}>
                    {tr(af.editModal, lang)}
                  </button>
                  <button onClick={() => setConfirmDelete(ev.id)} className={btnDanger}>
                    {tr(af.removeVenue, lang)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
