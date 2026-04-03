'use client';

import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { sponsors, type Sponsor, type SponsorTier } from '@/lib/data';

const tierOrder: SponsorTier[] = ['platinum', 'gold', 'silver', 'partner'];

const tierSectionLabel: Record<SponsorTier, string> = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  partner: 'Partner',
};

const tierBadgeVariant: Record<SponsorTier, 'platinum' | 'gold' | 'silver' | 'partner'> = {
  platinum: 'platinum',
  gold: 'gold',
  silver: 'silver',
  partner: 'partner',
};

const emptyForm = {
  name: '',
  tier: 'silver' as SponsorTier,
  website: '',
  description: '',
};
type FormState = typeof emptyForm;

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function AdminSponsorsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editSponsor, setEditSponsor] = useState<Sponsor | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [toast, setToast] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  }

  function openNew() {
    setEditSponsor(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(sp: Sponsor) {
    setEditSponsor(sp);
    setForm({
      name: sp.name,
      tier: sp.tier,
      website: sp.website,
      description: sp.description,
    });
    setModalOpen(true);
  }

  function handleSave() {
    setModalOpen(false);
    showToast(editSponsor ? 'Sponsor actualizado (demo)' : 'Sponsor agregado (demo)');
  }

  function updateForm(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const sponsorsByTier = tierOrder
    .map((tier) => ({
      tier,
      items: sponsors.filter((s) => s.tier === tier),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <AdminLayout>
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 border border-[#A56E52] bg-[#FDFAF7] px-6 py-4 shadow-lg">
          <p className="font-sans text-xs uppercase tracking-widest text-[#A56E52]">{toast}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h2 className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">
            Sponsors &amp; Partners
          </h2>
          <p className="mt-1 font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">
            {sponsors.length} en total —{' '}
            {tierOrder
              .filter((t) => sponsors.some((s) => s.tier === t))
              .map((t) => `${sponsors.filter((s) => s.tier === t).length} ${tierSectionLabel[t]}`)
              .join(' · ')}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openNew}>
          + Agregar Sponsor
        </Button>
      </div>

      {/* Grouped by tier */}
      <div className="space-y-10">
        {sponsorsByTier.map(({ tier, items }) => (
          <div key={tier}>
            {/* Tier heading */}
            <div className="flex items-center gap-4 mb-5">
              <Badge variant={tierBadgeVariant[tier]} />
              <div className="flex-1 h-px bg-[#EAE1D6]" />
              <span className="font-sans text-[9px] uppercase tracking-widest text-[#5B4638]/50">
                {items.length} sponsor{items.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Sponsor cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((sp) => (
                <div
                  key={sp.id}
                  className="border border-[#EAE1D6] bg-[#FDFAF7] p-6 hover:border-[#D7C6B2] transition-colors"
                >
                  <div className="flex items-center gap-4 mb-4">
                    {/* Logo placeholder */}
                    <div className="h-12 w-12 border border-[#EAE1D6] bg-[#EAE1D6] flex items-center justify-center shrink-0">
                      <span className="font-sans text-xs font-semibold text-[#5B4638]">
                        {initials(sp.name)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm font-medium text-[#2A2421] leading-tight">{sp.name}</p>
                      <div className="mt-1">
                        <Badge variant={tierBadgeVariant[sp.tier]} />
                      </div>
                    </div>
                  </div>

                  <p className="font-sans text-xs text-[#5B4638] leading-relaxed line-clamp-2 mb-3">
                    {sp.description}
                  </p>
                  <p className="font-sans text-[9px] uppercase tracking-wider text-[#A56E52] mb-5">
                    {sp.website}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(sp)}
                      className="flex-1 border border-[#D7C6B2] py-2 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => showToast(`Contactando a ${sp.name}... (demo)`)}
                      className="flex-1 border border-[#2A2421] py-2 font-sans text-[9px] uppercase tracking-widest text-[#2A2421] hover:bg-[#2A2421] hover:text-[#F7F3EE] transition-colors"
                    >
                      Contactar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-[#2A2421]/60 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg border border-[#EAE1D6] bg-[#FDFAF7] shadow-2xl mx-4">
            <div className="border-b border-[#EAE1D6] px-8 py-6 flex items-center justify-between">
              <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">
                {editSponsor ? 'Editar Sponsor' : 'Agregar Sponsor'}
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
                  Nombre
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
                  Tier
                </label>
                <select
                  value={form.tier}
                  onChange={(e) => updateForm('tier', e.target.value)}
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors"
                >
                  {tierOrder.map((t) => (
                    <option key={t} value={t}>{tierSectionLabel[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">
                  Website
                </label>
                <input
                  type="text"
                  value={form.website}
                  onChange={(e) => updateForm('website', e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors"
                />
              </div>
              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">
                  Descripción
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  rows={3}
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors resize-none"
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
