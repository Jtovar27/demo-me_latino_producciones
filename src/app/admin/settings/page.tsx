'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import { useState, useEffect } from 'react';
import { getSiteConfig, updateSiteConfig } from '@/app/actions/settings';

type ProfileForm = {
  site_name:     string;
  site_tagline:  string;
  contact_email: string;
  instagram_url: string;
  linkedin_url:  string;
  facebook_url:  string;
};

const emptyProfile: ProfileForm = {
  site_name:     '',
  site_tagline:  '',
  contact_email: '',
  instagram_url: '',
  linkedin_url:  '',
  facebook_url:  '',
};

function inputClass() {
  return 'w-full border border-[#D7C6B2] bg-transparent px-4 py-3 text-sm text-[#2A2421] placeholder-[#5B4638]/50 focus:border-[#2A2421] focus:outline-none transition-colors duration-200';
}

function labelClass() {
  return 'block text-[10px] tracking-widest uppercase text-[#5B4638] mb-1.5';
}

export default function AdminSettingsPage() {
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState('');
  const [toastErr, setToastErr] = useState(false);
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSiteConfig().then(({ data }) => {
      if (data) {
        setProfile({
          site_name:     data.site_name     ?? '',
          site_tagline:  data.site_tagline  ?? '',
          contact_email: data.contact_email ?? '',
          instagram_url: data.instagram_url ?? '',
          linkedin_url:  data.linkedin_url  ?? '',
          facebook_url:  data.facebook_url  ?? '',
        });
      }
      setLoading(false);
    });
  }, []);

  function showToast(msg: string, isErr = false) {
    setToast(msg);
    setToastErr(isErr);
    setTimeout(() => setToast(''), 3000);
  }

  async function handleSave() {
    setSaving(true);
    const fd = new FormData();
    Object.entries(profile).forEach(([k, v]) => fd.append(k, v));
    const res = await updateSiteConfig(fd);
    setSaving(false);
    if (res?.error) {
      showToast('Error al guardar: ' + res.error, true);
    } else {
      showToast('Cambios guardados. Ya se ven reflejados en el sitio.');
    }
  }

  return (
    <AdminLayout>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 border px-6 py-4 shadow-lg ${toastErr ? 'border-red-300 bg-red-50 text-red-700' : 'border-[#A56E52] bg-[#FDFAF7] text-[#A56E52]'}`}>
          <p className="font-sans text-xs uppercase tracking-widest">{toast}</p>
        </div>
      )}

      <div className="max-w-4xl">
        <div className="mb-8">
          <h2 className="font-serif text-2xl text-[#2A2421]">Configuración</h2>
          <p className="mt-1 text-sm text-[#5B4638]">
            Los cambios aquí se reflejan automáticamente en el sitio web.
          </p>
        </div>

        {loading ? (
          <p className="font-sans text-xs uppercase tracking-widest text-[#5B4638]/50 py-8">Cargando...</p>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className={labelClass()}>Nombre de empresa</label>
                <input
                  value={profile.site_name}
                  onChange={(e) => setProfile((p) => ({ ...p, site_name: e.target.value }))}
                  className={inputClass()}
                  placeholder="ME Producciones"
                />
              </div>
              <div>
                <label className={labelClass()}>Email de contacto</label>
                <input
                  type="email"
                  value={profile.contact_email}
                  onChange={(e) => setProfile((p) => ({ ...p, contact_email: e.target.value }))}
                  className={inputClass()}
                  placeholder="hola@melatinopr.com"
                />
              </div>
              <div>
                <label className={labelClass()}>Instagram URL</label>
                <input
                  value={profile.instagram_url}
                  onChange={(e) => setProfile((p) => ({ ...p, instagram_url: e.target.value }))}
                  className={inputClass()}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className={labelClass()}>LinkedIn URL</label>
                <input
                  value={profile.linkedin_url}
                  onChange={(e) => setProfile((p) => ({ ...p, linkedin_url: e.target.value }))}
                  className={inputClass()}
                  placeholder="https://linkedin.com/company/..."
                />
              </div>
              <div>
                <label className={labelClass()}>Facebook URL</label>
                <input
                  value={profile.facebook_url}
                  onChange={(e) => setProfile((p) => ({ ...p, facebook_url: e.target.value }))}
                  className={inputClass()}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass()}>Tagline del sitio</label>
                <textarea
                  value={profile.site_tagline}
                  onChange={(e) => setProfile((p) => ({ ...p, site_tagline: e.target.value }))}
                  rows={3}
                  className={inputClass()}
                  placeholder="Eventos que inspiran. Experiencias que perduran."
                />
                <p className="mt-1.5 text-[10px] text-[#5B4638]/60">Aparece en el footer del sitio.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="border border-[#2A2421] bg-[#2A2421] px-8 py-3 text-[10px] tracking-widest uppercase text-[#F7F3EE] transition-all hover:bg-[#5B4638] disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
