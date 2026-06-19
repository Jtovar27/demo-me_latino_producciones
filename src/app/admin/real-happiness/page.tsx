'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUp, ArrowDown, ChevronsUp, ChevronsDown } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import MediaPicker from '@/components/admin/MediaPicker';
import {
  getAllRealHappinessSpeakers,
  upsertRealHappinessSpeaker,
  deleteRealHappinessSpeaker,
  reorderRealHappinessSpeakers,
  getAllRealHappinessHosts,
  upsertRealHappinessHost,
  deleteRealHappinessHost,
  reorderRealHappinessHosts,
} from '@/app/actions/realHappiness';
import type { DBRealHappinessSpeaker, DBRealHappinessHost } from '@/types/supabase';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { t, tr } from '@/lib/i18n/translations';

const emptyForm = {
  name:      '',
  topic_es:  '',
  topic_en:  '',
  image_url: '',
  active:    true,
};
type FormState = typeof emptyForm;

const emptyHostForm = {
  name:      '',
  role_es:   '',
  role_en:   '',
  bio_es:    '',
  bio_en:    '',
  image_url: '',
  active:    true,
};
type HostFormState = typeof emptyHostForm;

const bgColors = [
  'bg-[#A56E52]', 'bg-[#5B4638]', 'bg-[#2A2421]', 'bg-[#D7C6B2]',
  'bg-[#EAE1D6]', 'bg-[#A56E52]/70', 'bg-[#5B4638]/70', 'bg-[#2A2421]/80',
];

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

export default function AdminRealHappinessPage() {
  const { lang } = useLanguage();
  const arh = t.adminRealHappiness;

  const [speakers, setSpeakers]       = useState<DBRealHappinessSpeaker[]>([]);
  const [loading, setLoading]         = useState(true);
  const [modalOpen, setModalOpen]     = useState(false);
  const [editSpeaker, setEditSpeaker] = useState<DBRealHappinessSpeaker | null>(null);
  const [form, setForm]               = useState<FormState>(emptyForm);
  const [saving, setSaving]           = useState(false);
  const [toast, setToast]             = useState('');

  // Hosts (Conducción)
  const [hosts, setHosts]             = useState<DBRealHappinessHost[]>([]);
  const [hostsLoading, setHostsLoading] = useState(true);
  const [hostModalOpen, setHostModalOpen] = useState(false);
  const [editHost, setEditHost]       = useState<DBRealHappinessHost | null>(null);
  const [hostForm, setHostForm]       = useState<HostFormState>(emptyHostForm);
  const [hostSaving, setHostSaving]   = useState(false);

  useEffect(() => {
    getAllRealHappinessSpeakers().then(({ data }) => {
      setSpeakers(data);
      setLoading(false);
    });
    getAllRealHappinessHosts().then(({ data }) => {
      setHosts(data);
      setHostsLoading(false);
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

  function openEdit(sp: DBRealHappinessSpeaker) {
    setEditSpeaker(sp);
    setForm({
      name:      sp.name,
      topic_es:  sp.topic_es ?? '',
      topic_en:  sp.topic_en ?? '',
      image_url: sp.image_url ?? '',
      active:    sp.active,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      showToast(tr(arh.toastError, lang));
      return;
    }
    setSaving(true);
    const fd = new FormData();
    if (editSpeaker) fd.append('id', editSpeaker.id);
    fd.append('name',      form.name);
    fd.append('topic_es',  form.topic_es);
    fd.append('topic_en',  form.topic_en);
    fd.append('image_url', form.image_url);
    fd.append('active',    String(form.active));

    const result = await upsertRealHappinessSpeaker(fd);
    if (result?.error) {
      showToast(tr(arh.toastError, lang));
    } else {
      const { data } = await getAllRealHappinessSpeakers();
      setSpeakers(data);
      showToast(editSpeaker ? tr(arh.toastUpdated, lang) : tr(arh.toastCreated, lang));
      setModalOpen(false);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm(tr(arh.deleteConfirm, lang))) return;
    await deleteRealHappinessSpeaker(id);
    setSpeakers((prev) => prev.filter((s) => s.id !== id));
    showToast(tr(arh.toastDeleted, lang));
  }

  async function persistOrder(next: DBRealHappinessSpeaker[]) {
    setSpeakers(next);
    const result = await reorderRealHappinessSpeakers(next.map((s) => s.id));
    if (result?.error) {
      showToast(tr(arh.saveFailed, lang));
    } else {
      showToast(tr(arh.saved, lang));
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

  function updateForm<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // ── Host handlers ──────────────────────────────────────────────────────────

  function openNewHost() {
    setEditHost(null);
    setHostForm(emptyHostForm);
    setHostModalOpen(true);
  }

  function openEditHost(h: DBRealHappinessHost) {
    setEditHost(h);
    setHostForm({
      name:      h.name,
      role_es:   h.role_es ?? '',
      role_en:   h.role_en ?? '',
      bio_es:    h.bio_es ?? '',
      bio_en:    h.bio_en ?? '',
      image_url: h.image_url ?? '',
      active:    h.active,
    });
    setHostModalOpen(true);
  }

  async function handleSaveHost() {
    if (!hostForm.name.trim()) {
      showToast(tr(arh.toastError, lang));
      return;
    }
    setHostSaving(true);
    const fd = new FormData();
    if (editHost) fd.append('id', editHost.id);
    fd.append('name',      hostForm.name);
    fd.append('role_es',   hostForm.role_es);
    fd.append('role_en',   hostForm.role_en);
    fd.append('bio_es',    hostForm.bio_es);
    fd.append('bio_en',    hostForm.bio_en);
    fd.append('image_url', hostForm.image_url);
    fd.append('active',    String(hostForm.active));

    const result = await upsertRealHappinessHost(fd);
    if (result?.error) {
      showToast(tr(arh.toastError, lang));
    } else {
      const { data } = await getAllRealHappinessHosts();
      setHosts(data);
      showToast(editHost ? tr(arh.hostUpdated, lang) : tr(arh.hostCreated, lang));
      setHostModalOpen(false);
    }
    setHostSaving(false);
  }

  async function handleDeleteHost(id: string) {
    if (!confirm(tr(arh.deleteHostConfirm, lang))) return;
    await deleteRealHappinessHost(id);
    setHosts((prev) => prev.filter((h) => h.id !== id));
    showToast(tr(arh.hostDeleted, lang));
  }

  async function persistHostOrder(next: DBRealHappinessHost[]) {
    setHosts(next);
    const result = await reorderRealHappinessHosts(next.map((h) => h.id));
    if (result?.error) {
      showToast(tr(arh.saveFailed, lang));
    } else {
      showToast(tr(arh.saved, lang));
    }
  }

  function moveHost(index: number, direction: 'up' | 'down' | 'top' | 'bottom') {
    if (hosts.length < 2) return;
    const next = [...hosts];
    const [item] = next.splice(index, 1);
    let target = index;
    if (direction === 'up')      target = Math.max(0, index - 1);
    if (direction === 'down')    target = Math.min(next.length, index + 1);
    if (direction === 'top')     target = 0;
    if (direction === 'bottom')  target = next.length;
    next.splice(target, 0, item);
    void persistHostOrder(next);
  }

  function updateHostForm<K extends keyof HostFormState>(field: K, value: HostFormState[K]) {
    setHostForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <AdminLayout>
      {toast && (
        <div className="fixed top-6 right-6 z-50 border border-[#A56E52] bg-[#FDFAF7] px-6 py-4 shadow-lg">
          <p className="font-sans text-xs uppercase tracking-widest text-[#A56E52]">{toast}</p>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h2 className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">
          {tr(arh.pageTitle, lang)}
        </h2>
        <p className="mt-2 font-sans text-xs text-[#5B4638] max-w-2xl leading-relaxed">
          {tr(arh.description, lang)}
        </p>
      </div>

      {/* Venues notice — venues live in flagship_events, not here */}
      <div className="mb-10 border border-[#D7C6B2] bg-[#F7F3EE] p-5">
        <p className="font-sans text-[10px] uppercase tracking-widest text-[#A56E52]">
          {tr(arh.venuesNoticeTitle, lang)}
        </p>
        <p className="mt-2 font-sans text-xs leading-relaxed text-[#5B4638] max-w-3xl">
          {tr(arh.venuesNoticeBody, lang)}
        </p>
        <Link
          href="/admin/flagship"
          className="mt-3 inline-block font-sans text-[10px] uppercase tracking-widest text-[#2A2421] underline hover:text-[#A56E52] transition-colors"
        >
          {tr(arh.venuesNoticeCta, lang)}
        </Link>
      </div>

      {/* Hosts section */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">
            {tr(arh.hostsTitle, lang)}
          </h3>
          <p className="mt-1 font-sans text-[10px] text-[#5B4638] max-w-2xl">
            {tr(arh.hostsDesc, lang)}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openNewHost}>
          {tr(arh.addHost, lang)}
        </Button>
      </div>

      {hostsLoading && (
        <p className="font-sans text-xs uppercase tracking-widest text-[#5B4638]/50 py-14 text-center">
          {tr(arh.loading, lang)}
        </p>
      )}

      {!hostsLoading && (
        <div className="border border-[#EAE1D6] bg-[#FDFAF7] overflow-x-auto mb-12">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EAE1D6]">
                <th className="px-3 py-5 w-12 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">#</th>
                <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">{tr(arh.nameLbl, lang)}</th>
                <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden md:table-cell">{tr(arh.roleEsLbl, lang)}</th>
                <th className="px-4 py-5 text-center font-sans text-[10px] uppercase tracking-widest text-[#5B4638] whitespace-nowrap">↕</th>
                <th className="px-7 py-5 text-right font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">{tr(arh.edit, lang)} / {tr(arh.delete, lang)}</th>
              </tr>
            </thead>
            <tbody>
              {hosts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-7 py-14 text-center font-sans text-xs uppercase tracking-widest text-[#5B4638]/50">
                    {tr(arh.noHosts, lang)}
                  </td>
                </tr>
              ) : hosts.map((h, i) => (
                <tr key={h.id} className={`border-b border-[#EAE1D6]/60 hover:bg-[#F7F3EE] transition-colors ${!h.active ? 'opacity-60' : ''}`}>
                  <td className="px-3 py-5 font-sans text-[11px] tabular-nums text-[#5B4638]">{i + 1}</td>
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-4">
                      {h.image_url ? (
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden">
                          <Image src={h.image_url} alt={h.name} fill className="object-cover" sizes="36px" unoptimized />
                        </div>
                      ) : (
                        <div className={`h-9 w-9 ${bgColors[i % bgColors.length]} flex items-center justify-center shrink-0`}>
                          <span className="font-sans text-[10px] font-medium text-[#F7F3EE]">{initials(h.name)}</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-sans text-sm text-[#2A2421] font-medium truncate">{h.name}</p>
                        {!h.active && (
                          <span className="inline-block mt-1 border border-[#D7C6B2] px-1.5 py-0.5 font-sans text-[8px] uppercase tracking-widest text-[#5B4638]">
                            {tr(arh.inactiveOpt, lang)}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5 hidden md:table-cell">
                    <p className="font-sans text-xs text-[#5B4638] line-clamp-2 max-w-md">{h.role_es || '—'}</p>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center justify-center gap-1">
                      <button type="button" onClick={() => moveHost(i, 'top')} disabled={i === 0}
                        aria-label={tr(arh.moveTop, lang)} title={tr(arh.moveTop, lang)}
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center border border-[#D7C6B2] text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <ChevronsUp size={14} strokeWidth={1.75} />
                      </button>
                      <button type="button" onClick={() => moveHost(i, 'up')} disabled={i === 0}
                        aria-label={tr(arh.moveUp, lang)} title={tr(arh.moveUp, lang)}
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center border border-[#D7C6B2] text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <ArrowUp size={14} strokeWidth={1.75} />
                      </button>
                      <button type="button" onClick={() => moveHost(i, 'down')} disabled={i === hosts.length - 1}
                        aria-label={tr(arh.moveDown, lang)} title={tr(arh.moveDown, lang)}
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center border border-[#D7C6B2] text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <ArrowDown size={14} strokeWidth={1.75} />
                      </button>
                      <button type="button" onClick={() => moveHost(i, 'bottom')} disabled={i === hosts.length - 1}
                        aria-label={tr(arh.moveBottom, lang)} title={tr(arh.moveBottom, lang)}
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center border border-[#D7C6B2] text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <ChevronsDown size={14} strokeWidth={1.75} />
                      </button>
                    </div>
                  </td>
                  <td className="px-7 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" onClick={() => openEditHost(h)}
                        className="border border-[#D7C6B2] px-3 py-2 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] transition-colors">
                        {tr(arh.edit, lang)}
                      </button>
                      <button type="button" onClick={() => handleDeleteHost(h.id)}
                        className="border border-[#D7C6B2] px-3 py-2 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-red-400 hover:text-red-500 transition-colors">
                        {tr(arh.delete, lang)}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Speakers section */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">
            {tr(arh.speakersTitle, lang)}
          </h3>
          <p className="mt-1 font-sans text-[10px] text-[#5B4638] max-w-2xl">
            {tr(arh.speakersDesc, lang)}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openNew}>
          {tr(arh.addSpeaker, lang)}
        </Button>
      </div>

      {loading && (
        <p className="font-sans text-xs uppercase tracking-widest text-[#5B4638]/50 py-14 text-center">
          {tr(arh.loading, lang)}
        </p>
      )}

      {/* List */}
      {!loading && (
        <div className="border border-[#EAE1D6] bg-[#FDFAF7] overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EAE1D6]">
                <th className="px-3 py-5 w-12 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">#</th>
                <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">{tr(arh.nameLbl, lang)}</th>
                <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden md:table-cell">{tr(arh.topicEsLbl, lang)}</th>
                <th className="px-4 py-5 text-center font-sans text-[10px] uppercase tracking-widest text-[#5B4638] whitespace-nowrap">↕</th>
                <th className="px-7 py-5 text-right font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">{tr(arh.edit, lang)} / {tr(arh.delete, lang)}</th>
              </tr>
            </thead>
            <tbody>
              {speakers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-7 py-14 text-center font-sans text-xs uppercase tracking-widest text-[#5B4638]/50">
                    {tr(arh.noSpeakers, lang)}
                  </td>
                </tr>
              ) : speakers.map((sp, i) => (
                <tr key={sp.id} className={`border-b border-[#EAE1D6]/60 hover:bg-[#F7F3EE] transition-colors ${!sp.active ? 'opacity-60' : ''}`}>
                  <td className="px-3 py-5 font-sans text-[11px] tabular-nums text-[#5B4638]">{i + 1}</td>
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
                        {!sp.active && (
                          <span className="inline-block mt-1 border border-[#D7C6B2] px-1.5 py-0.5 font-sans text-[8px] uppercase tracking-widest text-[#5B4638]">
                            {tr(arh.inactiveOpt, lang)}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5 hidden md:table-cell">
                    <p className="font-sans text-xs text-[#5B4638] line-clamp-2 max-w-md">{sp.topic_es || '—'}</p>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center justify-center gap-1">
                      <button type="button" onClick={() => moveSpeaker(i, 'top')} disabled={i === 0}
                        aria-label={tr(arh.moveTop, lang)} title={tr(arh.moveTop, lang)}
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center border border-[#D7C6B2] text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <ChevronsUp size={14} strokeWidth={1.75} />
                      </button>
                      <button type="button" onClick={() => moveSpeaker(i, 'up')} disabled={i === 0}
                        aria-label={tr(arh.moveUp, lang)} title={tr(arh.moveUp, lang)}
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center border border-[#D7C6B2] text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <ArrowUp size={14} strokeWidth={1.75} />
                      </button>
                      <button type="button" onClick={() => moveSpeaker(i, 'down')} disabled={i === speakers.length - 1}
                        aria-label={tr(arh.moveDown, lang)} title={tr(arh.moveDown, lang)}
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center border border-[#D7C6B2] text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <ArrowDown size={14} strokeWidth={1.75} />
                      </button>
                      <button type="button" onClick={() => moveSpeaker(i, 'bottom')} disabled={i === speakers.length - 1}
                        aria-label={tr(arh.moveBottom, lang)} title={tr(arh.moveBottom, lang)}
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center border border-[#D7C6B2] text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <ChevronsDown size={14} strokeWidth={1.75} />
                      </button>
                    </div>
                  </td>
                  <td className="px-7 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(sp)}
                        className="border border-[#D7C6B2] px-3 py-2 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] transition-colors">
                        {tr(arh.edit, lang)}
                      </button>
                      <button onClick={() => handleDelete(sp.id)}
                        className="border border-[#D7C6B2] px-3 py-2 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-red-400 hover:text-red-500 transition-colors">
                        {tr(arh.delete, lang)}
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-[#2A2421]/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full sm:max-w-lg border border-[#EAE1D6] bg-[#FDFAF7] shadow-2xl mx-0 sm:mx-4 max-h-[92vh] overflow-y-auto rounded-t-lg sm:rounded-none">
            <div className="border-b border-[#EAE1D6] px-6 py-5 flex items-center justify-between">
              <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">
                {editSpeaker ? tr(arh.editModal, lang) : tr(arh.newModal, lang)}
              </p>
              <button onClick={() => setModalOpen(false)} className="font-sans text-[#5B4638] hover:text-[#2A2421] transition-colors text-xl leading-none p-1">×</button>
            </div>
            <div className="px-6 py-6 space-y-5">

              <MediaPicker
                value={form.image_url}
                onChange={(url) => updateForm('image_url', url)}
                accept="image"
                label={tr(arh.photoLbl, lang)}
              />

              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">{tr(arh.nameLbl, lang)}</label>
                <input type="text" value={form.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  placeholder="Nombre completo"
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors" />
              </div>

              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">{tr(arh.topicEsLbl, lang)}</label>
                <textarea value={form.topic_es} onChange={(e) => updateForm('topic_es', e.target.value)} rows={3}
                  placeholder="De qué van a hablar (en español)"
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors resize-none" />
              </div>

              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">{tr(arh.topicEnLbl, lang)}</label>
                <textarea value={form.topic_en} onChange={(e) => updateForm('topic_en', e.target.value)} rows={3}
                  placeholder="What they will talk about (in English)"
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors resize-none" />
              </div>

              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">{tr(arh.statusLbl, lang)}</label>
                <select value={form.active ? 'true' : 'false'}
                  onChange={(e) => updateForm('active', e.target.value === 'true')}
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors">
                  <option value="true">{tr(arh.activeOpt, lang)}</option>
                  <option value="false">{tr(arh.inactiveOpt, lang)}</option>
                </select>
              </div>
            </div>
            <div className="border-t border-[#EAE1D6] px-6 py-5 flex items-center justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>{tr(arh.cancel, lang)}</Button>
              <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
                {saving ? tr(arh.saving, lang) : tr(arh.saveSpeaker, lang)}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Host Modal */}
      {hostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-[#2A2421]/60 backdrop-blur-sm" onClick={() => setHostModalOpen(false)} />
          <div className="relative z-10 w-full sm:max-w-lg border border-[#EAE1D6] bg-[#FDFAF7] shadow-2xl mx-0 sm:mx-4 max-h-[92vh] overflow-y-auto rounded-t-lg sm:rounded-none">
            <div className="border-b border-[#EAE1D6] px-6 py-5 flex items-center justify-between">
              <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">
                {editHost ? tr(arh.editHostModal, lang) : tr(arh.newHostModal, lang)}
              </p>
              <button type="button" onClick={() => setHostModalOpen(false)} className="font-sans text-[#5B4638] hover:text-[#2A2421] transition-colors text-xl leading-none p-1">×</button>
            </div>
            <div className="px-6 py-6 space-y-5">

              <MediaPicker
                value={hostForm.image_url}
                onChange={(url) => updateHostForm('image_url', url)}
                accept="image"
                label={tr(arh.photoLbl, lang)}
              />

              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">{tr(arh.nameLbl, lang)}</label>
                <input type="text" value={hostForm.name}
                  onChange={(e) => updateHostForm('name', e.target.value)}
                  placeholder="Nombre completo"
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors" />
              </div>

              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">{tr(arh.roleEsLbl, lang)}</label>
                <input type="text" value={hostForm.role_es}
                  onChange={(e) => updateHostForm('role_es', e.target.value)}
                  placeholder="Ej. Host · El Sol Network TV Orlando"
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors" />
              </div>

              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">{tr(arh.roleEnLbl, lang)}</label>
                <input type="text" value={hostForm.role_en}
                  onChange={(e) => updateHostForm('role_en', e.target.value)}
                  placeholder="E.g. Host · El Sol Network TV Orlando"
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors" />
              </div>

              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">{tr(arh.bioEsLbl, lang)}</label>
                <textarea value={hostForm.bio_es} onChange={(e) => updateHostForm('bio_es', e.target.value)} rows={4}
                  placeholder="Descripción del host (en español)"
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors resize-none" />
              </div>

              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">{tr(arh.bioEnLbl, lang)}</label>
                <textarea value={hostForm.bio_en} onChange={(e) => updateHostForm('bio_en', e.target.value)} rows={4}
                  placeholder="Host description (in English)"
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors resize-none" />
              </div>

              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">{tr(arh.statusLbl, lang)}</label>
                <select value={hostForm.active ? 'true' : 'false'}
                  title={tr(arh.statusLbl, lang)}
                  onChange={(e) => updateHostForm('active', e.target.value === 'true')}
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors">
                  <option value="true">{tr(arh.activeOpt, lang)}</option>
                  <option value="false">{tr(arh.inactiveOpt, lang)}</option>
                </select>
              </div>
            </div>
            <div className="border-t border-[#EAE1D6] px-6 py-5 flex items-center justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => setHostModalOpen(false)}>{tr(arh.cancel, lang)}</Button>
              <Button variant="primary" size="sm" loading={hostSaving} onClick={handleSaveHost}>
                {hostSaving ? tr(arh.saving, lang) : tr(arh.saveHost, lang)}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
