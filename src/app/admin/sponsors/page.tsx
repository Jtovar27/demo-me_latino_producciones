'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowUp, ArrowDown, ChevronsUp, ChevronsDown } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import MediaPicker from '@/components/admin/MediaPicker';
import { getSponsors, upsertSponsor, deleteSponsor, reorderSponsors } from '@/app/actions/sponsors';
import type { DBSponsor } from '@/types/supabase';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { t, tr } from '@/lib/i18n/translations';

type SponsorTier = 'platinum' | 'silver' | 'blue' | 'pink';

const tierOrder: SponsorTier[] = ['platinum', 'silver', 'blue', 'pink'];

const tierSectionLabel: Record<SponsorTier, string> = {
  platinum: 'Platinum',
  silver:   'Silver',
  blue:     'Blue',
  pink:     'Pink',
};

const tierBadgeVariant: Record<SponsorTier, SponsorTier> = {
  platinum: 'platinum',
  silver:   'silver',
  blue:     'blue',
  pink:     'pink',
};

const emptyForm = {
  name:           '',
  tier:           'pink' as SponsorTier,
  website:        '',
  description:    '',
  description_en: '',
  logo_url:       '',
};
type FormState = typeof emptyForm;

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

function safeTier(t: string): SponsorTier {
  return tierOrder.includes(t as SponsorTier) ? (t as SponsorTier) : 'pink';
}

export default function AdminSponsorsPage() {
  const { lang } = useLanguage();
  const asp = t.adminSponsors;

  const [sponsors, setSponsors]       = useState<DBSponsor[]>([]);
  const [loading, setLoading]         = useState(true);
  const [modalOpen, setModalOpen]     = useState(false);
  const [editSponsor, setEditSponsor] = useState<DBSponsor | null>(null);
  const [form, setForm]               = useState<FormState>(emptyForm);
  const [saving, setSaving]           = useState(false);
  const [toast, setToast]             = useState('');

  useEffect(() => {
    getSponsors().then(({ data }) => {
      setSponsors(data as DBSponsor[]);
      setLoading(false);
    });
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  }

  function openNew() {
    setEditSponsor(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(sp: DBSponsor) {
    setEditSponsor(sp);
    setForm({
      name:           sp.name,
      tier:           safeTier(sp.tier),
      website:        sp.website ?? '',
      description:    sp.description ?? '',
      description_en: sp.description_en ?? '',
      logo_url:       sp.logo_url ?? '',
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const fd = new FormData();
    if (editSponsor) fd.append('id', editSponsor.id);
    fd.append('name',           form.name);
    fd.append('tier',           form.tier);
    fd.append('website',        form.website);
    fd.append('description',    form.description);
    fd.append('description_en', form.description_en);
    fd.append('logo_url',       form.logo_url);

    const result = await upsertSponsor(fd);
    if (result?.error) {
      showToast(tr(asp.toastError, lang));
    } else {
      const { data } = await getSponsors();
      setSponsors(data as DBSponsor[]);
      showToast(editSponsor ? tr(asp.toastUpdated, lang) : tr(asp.toastCreated, lang));
      setModalOpen(false);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm(tr(asp.deleteConfirm, lang))) return;
    await deleteSponsor(id);
    setSponsors((prev) => prev.filter((s) => s.id !== id));
    showToast(tr(asp.toastDeleted, lang));
  }

  async function moveSponsor(tier: SponsorTier, sponsorId: string, direction: 'up' | 'down' | 'top' | 'bottom') {
    const tierSorted = sponsors
      .filter((s) => safeTier(s.tier) === tier)
      .slice()
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const index = tierSorted.findIndex((s) => s.id === sponsorId);
    if (index < 0 || tierSorted.length < 2) return;

    const next = [...tierSorted];
    const [item] = next.splice(index, 1);
    let target = index;
    if (direction === 'up')      target = Math.max(0, index - 1);
    if (direction === 'down')    target = Math.min(next.length, index + 1);
    if (direction === 'top')     target = 0;
    if (direction === 'bottom')  target = next.length;
    next.splice(target, 0, item);

    // Optimistic update — apply new sort_order to this tier in local state
    const reordered = next.map((s, i) => ({ ...s, sort_order: i }));
    setSponsors((prev) => {
      const others = prev.filter((s) => safeTier(s.tier) !== tier);
      return [...others, ...reordered];
    });

    const result = await reorderSponsors(tier, next.map((s) => s.id));
    if (result?.error) {
      showToast(tr(asp.saveFailed, lang));
    } else {
      showToast(tr(asp.saved, lang));
    }
  }

  function updateForm(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const sponsorsByTier = tierOrder
    .map((tier) => ({
      tier,
      items: sponsors
        .filter((s) => safeTier(s.tier) === tier)
        .slice()
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <AdminLayout>
      {toast && (
        <div className="fixed top-6 right-6 z-50 border border-[#A56E52] bg-[#FDFAF7] px-6 py-4 shadow-lg">
          <p className="font-sans text-xs uppercase tracking-widest text-[#A56E52]">{toast}</p>
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h2 className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">
            {tr(asp.pageTitle, lang)}
          </h2>
          <p className="mt-1 font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">
            {loading ? tr(asp.loading, lang) : `${sponsors.length} ${tr(asp.totalSponsors, lang)}`}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openNew}>
          {tr(asp.addSponsor, lang)}
        </Button>
      </div>

      {loading && (
        <p className="font-sans text-xs uppercase tracking-widest text-[#5B4638]/50 py-14 text-center">
          {tr(asp.loading, lang)}
        </p>
      )}

      {!loading && sponsors.length === 0 && (
        <div className="border border-dashed border-[#D7C6B2] py-20 text-center">
          <p className="font-sans text-xs uppercase tracking-widest text-[#5B4638]/50 mb-4">
            {tr(asp.noSponsors, lang)}
          </p>
          <Button variant="primary" size="sm" onClick={openNew}>{tr(asp.addFirst, lang)}</Button>
        </div>
      )}

      {!loading && sponsors.length > 0 && (
        <div className="space-y-10">
          <p className="font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">
            {tr(asp.orderingHelp, lang)}
          </p>
          {sponsorsByTier.map(({ tier, items }) => (
            <div key={tier}>
              <div className="flex items-center gap-4 mb-5">
                <Badge variant={tierBadgeVariant[tier]} />
                <div className="flex-1 h-px bg-[#EAE1D6]" />
                <span className="font-sans text-[9px] uppercase tracking-widest text-[#5B4638]/50">
                  {items.length} sponsor{items.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((sp, idx) => (
                  <div key={sp.id} className="border border-[#EAE1D6] bg-[#FDFAF7] p-5 sm:p-6 hover:border-[#D7C6B2] transition-colors flex flex-col">
                    <div className="flex items-center gap-4 mb-4">
                      {sp.logo_url ? (
                        <div className="relative h-12 w-12 overflow-hidden border border-[#EAE1D6] shrink-0">
                          <Image src={sp.logo_url} alt={sp.name} fill className="object-contain p-1" sizes="48px" unoptimized />
                        </div>
                      ) : (
                        <div className="h-12 w-12 border border-[#EAE1D6] bg-[#EAE1D6] flex items-center justify-center shrink-0">
                          <span className="font-sans text-xs font-semibold text-[#5B4638]">{initials(sp.name)}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm font-medium text-[#2A2421] leading-tight truncate">{sp.name}</p>
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          <Badge variant={tierBadgeVariant[safeTier(sp.tier)]} />
                          <span className="font-sans text-[9px] uppercase tracking-widest text-[#5B4638]">
                            #{idx + 1}
                          </span>
                        </div>
                      </div>
                    </div>

                    {sp.description && (
                      <p className="font-sans text-xs text-[#5B4638] leading-relaxed line-clamp-2 mb-3">
                        {sp.description}
                      </p>
                    )}
                    {sp.website && (
                      <p className="font-sans text-[9px] uppercase tracking-wider text-[#A56E52] mb-5 truncate">
                        {sp.website}
                      </p>
                    )}

                    {/* Per-tier ordering controls */}
                    <div className="flex gap-1 mb-3">
                      <button
                        type="button"
                        onClick={() => moveSponsor(tier, sp.id, 'top')}
                        disabled={idx === 0}
                        aria-label={tr(asp.moveTop, lang)}
                        title={tr(asp.moveTop, lang)}
                        className="min-h-[36px] flex-1 flex items-center justify-center border border-[#D7C6B2] text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronsUp size={14} strokeWidth={1.75} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSponsor(tier, sp.id, 'up')}
                        disabled={idx === 0}
                        aria-label={tr(asp.moveUp, lang)}
                        title={tr(asp.moveUp, lang)}
                        className="min-h-[36px] flex-1 flex items-center justify-center border border-[#D7C6B2] text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ArrowUp size={14} strokeWidth={1.75} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSponsor(tier, sp.id, 'down')}
                        disabled={idx === items.length - 1}
                        aria-label={tr(asp.moveDown, lang)}
                        title={tr(asp.moveDown, lang)}
                        className="min-h-[36px] flex-1 flex items-center justify-center border border-[#D7C6B2] text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ArrowDown size={14} strokeWidth={1.75} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSponsor(tier, sp.id, 'bottom')}
                        disabled={idx === items.length - 1}
                        aria-label={tr(asp.moveBottom, lang)}
                        title={tr(asp.moveBottom, lang)}
                        className="min-h-[36px] flex-1 flex items-center justify-center border border-[#D7C6B2] text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronsDown size={14} strokeWidth={1.75} />
                      </button>
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
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-[#2A2421]/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full sm:max-w-lg border border-[#EAE1D6] bg-[#FDFAF7] shadow-2xl mx-0 sm:mx-4 max-h-[92vh] overflow-y-auto rounded-t-lg sm:rounded-none">
            <div className="border-b border-[#EAE1D6] px-6 py-5 flex items-center justify-between">
              <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">
                {editSponsor ? tr(asp.editModal, lang) : tr(asp.newModal, lang)}
              </p>
              <button onClick={() => setModalOpen(false)}
                className="font-sans text-[#5B4638] hover:text-[#2A2421] transition-colors text-xl leading-none p-1">
                ×
              </button>
            </div>
            <div className="px-6 py-6 space-y-5">

              <MediaPicker
                value={form.logo_url}
                onChange={(url) => updateForm('logo_url', url)}
                accept="image"
                label={tr(asp.logoLbl, lang)}
              />

              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">{tr(asp.nameLbl, lang)}</label>
                <input type="text" value={form.name} onChange={(e) => updateForm('name', e.target.value)}
                  placeholder={tr(asp.nameLbl, lang)}
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors" />
              </div>
              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">{tr(asp.tierLbl, lang)}</label>
                <select value={form.tier} onChange={(e) => updateForm('tier', e.target.value)}
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors">
                  {tierOrder.map((t) => (
                    <option key={t} value={t}>{tierSectionLabel[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">{tr(asp.websiteLbl, lang)}</label>
                <input type="text" value={form.website} onChange={(e) => updateForm('website', e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors" />
              </div>
              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">{tr(asp.descLbl, lang)}</label>
                <textarea value={form.description} onChange={(e) => updateForm('description', e.target.value)} rows={3}
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors resize-none" />
              </div>
              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">{tr(asp.descEnLbl, lang)}</label>
                <textarea value={form.description_en} onChange={(e) => updateForm('description_en', e.target.value)} rows={3}
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors resize-none" />
              </div>
            </div>
            <div className="border-t border-[#EAE1D6] px-6 py-5 flex items-center justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>{tr(asp.cancel, lang)}</Button>
              <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
                {saving ? tr(asp.saving, lang) : tr(asp.saveSponsor, lang)}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
