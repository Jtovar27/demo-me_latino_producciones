'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import { useState, useEffect } from 'react';
import { getSiteConfig, updateSiteConfig } from '@/app/actions/settings';
import type { DBSiteConfig } from '@/types/supabase';

type Tab = 'identity' | 'stats' | 'hero' | 'brand' | 'social';

const TABS: { id: Tab; label: string }[] = [
  { id: 'identity', label: 'Identidad' },
  { id: 'stats',    label: 'Estadísticas' },
  { id: 'hero',     label: 'Hero / Portada' },
  { id: 'brand',    label: 'Frase de marca' },
  { id: 'social',   label: 'Redes sociales' },
];

const inp = 'w-full border border-[#D7C6B2] bg-transparent px-4 py-3 text-sm text-[#2A2421] placeholder-[#5B4638]/40 focus:border-[#2A2421] focus:outline-none transition-colors duration-200';
const lbl = 'block text-[10px] tracking-widest uppercase text-[#5B4638] mb-1.5';
const hint = 'mt-1.5 text-[10px] text-[#5B4638]/55';
const textarea = `${inp} resize-none`;

function Field({
  label, hint: hintText, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={lbl}>{label}</label>
      {children}
      {hintText && <p className={hint}>{hintText}</p>}
    </div>
  );
}

function BilingualFields({
  labelEs, labelEn, nameEs, nameEn,
  valueEs, valueEn,
  onChange, rows = 1, hintEs, hintEn,
}: {
  labelEs: string; labelEn: string;
  nameEs: string;  nameEn: string;
  valueEs: string; valueEn: string;
  onChange: (name: string, val: string) => void;
  rows?: number;
  hintEs?: string; hintEn?: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label={labelEs} hint={hintEs}>
        {rows > 1
          ? <textarea rows={rows} name={nameEs} value={valueEs} onChange={e => onChange(nameEs, e.target.value)} className={textarea} />
          : <input name={nameEs} value={valueEs} onChange={e => onChange(nameEs, e.target.value)} className={inp} />
        }
      </Field>
      <Field label={labelEn} hint={hintEn}>
        {rows > 1
          ? <textarea rows={rows} name={nameEn} value={valueEn} onChange={e => onChange(nameEn, e.target.value)} className={textarea} />
          : <input name={nameEn} value={valueEn} onChange={e => onChange(nameEn, e.target.value)} className={inp} />
        }
      </Field>
    </div>
  );
}

type FormState = Partial<Record<keyof DBSiteConfig, string>>;

export default function AdminSettingsPage() {
  const [tab,      setTab]      = useState<Tab>('identity');
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState('');
  const [toastErr, setToastErr] = useState(false);
  const [form,     setForm]     = useState<FormState>({});
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getSiteConfig().then(({ data }) => {
      if (data) {
        const mapped: FormState = {};
        for (const [k, v] of Object.entries(data)) {
          mapped[k as keyof DBSiteConfig] = v !== null && v !== undefined ? String(v) : '';
        }
        setForm(mapped);
      }
      setLoading(false);
    });
  }, []);

  function set(name: string, value: string) {
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function showToast(msg: string, isErr = false) {
    setToast(msg); setToastErr(isErr);
    setTimeout(() => setToast(''), 4000);
  }

  async function handleSave() {
    setSaving(true);
    const fd = new FormData();
    for (const [k, v] of Object.entries(form)) {
      if (v !== undefined) fd.append(k, v);
    }
    const res = await updateSiteConfig(fd);
    setSaving(false);
    if (res?.error) showToast('Error: ' + res.error, true);
    else showToast('Cambios guardados y publicados en el sitio.');
  }

  const v = (key: keyof DBSiteConfig) => form[key] ?? '';

  return (
    <AdminLayout>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 border px-6 py-4 shadow-lg text-xs font-sans uppercase tracking-widest ${toastErr ? 'border-red-300 bg-red-50 text-red-700' : 'border-[#A56E52] bg-[#FDFAF7] text-[#A56E52]'}`}>
          {toast}
        </div>
      )}

      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h2 className="font-serif text-2xl text-[#2A2421]">Configuración del sitio</h2>
          <p className="mt-1 text-sm text-[#5B4638]">
            Todos los cambios se publican automáticamente en el sitio web.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-[#D7C6B2] mb-8 overflow-x-auto">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`shrink-0 px-5 py-3 font-sans text-[10px] uppercase tracking-widest transition-colors border-b-2 -mb-px ${
                tab === id
                  ? 'border-[#A56E52] text-[#A56E52]'
                  : 'border-transparent text-[#5B4638] hover:text-[#2A2421]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="font-sans text-xs uppercase tracking-widest text-[#5B4638]/50 py-8">Cargando…</p>
        ) : (
          <div className="space-y-6">

            {/* ── IDENTITY ── */}
            {tab === 'identity' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Nombre de empresa">
                    <input value={v('site_name')} onChange={e => set('site_name', e.target.value)} className={inp} placeholder="ME Producciones" />
                  </Field>
                  <Field label="Email de contacto">
                    <input type="email" value={v('contact_email')} onChange={e => set('contact_email', e.target.value)} className={inp} placeholder="hola@melatinopr.com" />
                  </Field>
                  <Field label="Tagline del sitio" hint="Aparece en el footer." >
                    <input value={v('site_tagline')} onChange={e => set('site_tagline', e.target.value)} className={inp} placeholder="Experiencias que transforman." />
                  </Field>
                </div>
              </div>
            )}

            {/* ── STATS ── */}
            {tab === 'stats' && (
              <div className="space-y-4">
                <p className="font-sans text-xs text-[#5B4638] mb-4">Estos números aparecen en la portada y en la sección de métricas.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {(
                    [
                      { key: 'total_events',    label: 'Eventos producidos' },
                      { key: 'total_attendees', label: 'Asistentes totales' },
                      { key: 'total_speakers',  label: 'Speakers' },
                      { key: 'cities_reached',  label: 'Ciudades' },
                      { key: 'years_active',    label: 'Años de trayectoria' },
                      { key: 'satisfaction',    label: 'Satisfacción (%)' },
                    ] as { key: keyof DBSiteConfig; label: string }[]
                  ).map(({ key, label }) => (
                    <Field key={key} label={label}>
                      <input
                        type="number"
                        min={0}
                        value={v(key)}
                        onChange={e => set(key as string, e.target.value)}
                        className={inp}
                      />
                    </Field>
                  ))}
                </div>
              </div>
            )}

            {/* ── HERO ── */}
            {tab === 'hero' && (
              <div className="space-y-8">
                <p className="font-sans text-xs text-[#5B4638]">
                  El contenido de la sección hero/portada. Edita ambos idiomas.
                </p>
                <BilingualFields labelEs="Badge / Eyebrow (ES)" labelEn="Badge / Eyebrow (EN)" nameEs="hero_badge_es" nameEn="hero_badge_en" valueEs={v('hero_badge_es')} valueEn={v('hero_badge_en')} onChange={set} />
                <BilingualFields labelEs="Titular principal (ES)" labelEn="Titular principal (EN)" nameEs="hero_headline_es" nameEn="hero_headline_en" valueEs={v('hero_headline_es')} valueEn={v('hero_headline_en')} onChange={set} rows={2} hintEs="Máx. ~60 caracteres recomendado." hintEn="Max ~60 characters recommended." />
                <BilingualFields labelEs="Subtítulo / Descripción (ES)" labelEn="Subtítulo / Descripción (EN)" nameEs="hero_body_es" nameEn="hero_body_en" valueEs={v('hero_body_es')} valueEn={v('hero_body_en')} onChange={set} rows={3} />

                <div className="border-t border-[#D7C6B2] pt-6 space-y-4">
                  <p className={lbl}>CTA principal</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="Etiqueta (ES)">
                      <input value={v('hero_cta_primary_label_es')} onChange={e => set('hero_cta_primary_label_es', e.target.value)} className={inp} />
                    </Field>
                    <Field label="Etiqueta (EN)">
                      <input value={v('hero_cta_primary_label_en')} onChange={e => set('hero_cta_primary_label_en', e.target.value)} className={inp} />
                    </Field>
                    <Field label="URL / Enlace" hint="Ej: /experiences">
                      <input value={v('hero_cta_primary_href')} onChange={e => set('hero_cta_primary_href', e.target.value)} className={inp} placeholder="/experiences" />
                    </Field>
                  </div>
                </div>

                <div className="border-t border-[#D7C6B2] pt-6 space-y-4">
                  <p className={lbl}>CTA secundario</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="Etiqueta (ES)">
                      <input value={v('hero_cta_secondary_label_es')} onChange={e => set('hero_cta_secondary_label_es', e.target.value)} className={inp} />
                    </Field>
                    <Field label="Etiqueta (EN)">
                      <input value={v('hero_cta_secondary_label_en')} onChange={e => set('hero_cta_secondary_label_en', e.target.value)} className={inp} />
                    </Field>
                    <Field label="URL / Enlace" hint="Ej: /events">
                      <input value={v('hero_cta_secondary_href')} onChange={e => set('hero_cta_secondary_href', e.target.value)} className={inp} placeholder="/events" />
                    </Field>
                  </div>
                </div>
              </div>
            )}

            {/* ── BRAND STATEMENT ── */}
            {tab === 'brand' && (
              <div className="space-y-8">
                <p className="font-sans text-xs text-[#5B4638]">
                  La frase insignia y párrafo descriptivo que aparecen en la sección de identidad de la portada.
                </p>
                <BilingualFields labelEs='Frase principal (ES)' labelEn='Frase principal (EN)' nameEs="brand_quote_es" nameEn="brand_quote_en" valueEs={v('brand_quote_es')} valueEn={v('brand_quote_en')} onChange={set} rows={2} hintEs='Ej: "No producimos eventos. Producimos posibilidad."' />
                <BilingualFields labelEs="Párrafo descriptivo (ES)" labelEn="Párrafo descriptivo (EN)" nameEs="brand_body_es" nameEn="brand_body_en" valueEs={v('brand_body_es')} valueEn={v('brand_body_en')} onChange={set} rows={4} />
              </div>
            )}

            {/* ── SOCIAL ── */}
            {tab === 'social' && (
              <div className="space-y-4">
                <p className="font-sans text-xs text-[#5B4638] mb-4">URLs completas de cada red social. Dejar en blanco para ocultar.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(
                    [
                      { key: 'instagram_url', label: 'Instagram', placeholder: 'https://instagram.com/...' },
                      { key: 'facebook_url',  label: 'Facebook',  placeholder: 'https://facebook.com/...' },
                      { key: 'linkedin_url',  label: 'LinkedIn',  placeholder: 'https://linkedin.com/company/...' },
                      { key: 'twitter_url',   label: 'X / Twitter', placeholder: 'https://x.com/...' },
                      { key: 'youtube_url',   label: 'YouTube',   placeholder: 'https://youtube.com/...' },
                      { key: 'tiktok_url',    label: 'TikTok',    placeholder: 'https://tiktok.com/@...' },
                      { key: 'whatsapp_url',  label: 'WhatsApp',  placeholder: 'https://wa.me/...' },
                    ] as { key: keyof DBSiteConfig; label: string; placeholder: string }[]
                  ).map(({ key, label, placeholder }) => (
                    <Field key={key} label={label}>
                      <input type="url" value={v(key)} onChange={e => set(key as string, e.target.value)} className={inp} placeholder={placeholder} />
                    </Field>
                  ))}
                </div>
              </div>
            )}

            {/* Save button */}
            <div className="flex items-center gap-4 pt-4 border-t border-[#EAE1D6]">
              <button
                onClick={handleSave}
                disabled={saving}
                className="border border-[#2A2421] bg-[#2A2421] px-8 py-3 font-sans text-[10px] tracking-widest uppercase text-[#F7F3EE] transition-all hover:bg-[#5B4638] disabled:opacity-50"
              >
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
              <p className="font-sans text-[10px] text-[#5B4638]/60">Los cambios se reflejan inmediatamente en el sitio.</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
