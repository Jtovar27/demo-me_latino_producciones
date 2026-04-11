'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Video } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import { getGalleryItems, uploadMediaFile, deleteMediaFile, updateGalleryItem } from '@/app/actions/gallery';
import type { DBGalleryItem } from '@/types/supabase';

type FilterCat = 'all' | string;

const categoryConfig: Record<string, { label: string; bg: string; text: string }> = {
  stage:     { label: 'Stage',     bg: 'bg-[#2A2421]', text: 'text-[#F7F3EE]' },
  moments:   { label: 'Moments',   bg: 'bg-[#A56E52]', text: 'text-[#F7F3EE]' },
  backstage: { label: 'Backstage', bg: 'bg-[#5B4638]', text: 'text-[#F7F3EE]' },
  audience:  { label: 'Audience',  bg: 'bg-[#D7C6B2]', text: 'text-[#2A2421]' },
  details:   { label: 'Details',   bg: 'bg-[#EAE1D6]', text: 'text-[#5B4638]' },
};

const filterOptions = [
  { value: 'all',       label: 'Todos' },
  { value: 'stage',     label: 'Stage' },
  { value: 'moments',   label: 'Moments' },
  { value: 'backstage', label: 'Backstage' },
  { value: 'audience',  label: 'Audience' },
  { value: 'details',   label: 'Details' },
];

function getCatConfig(cat: string | null) {
  return categoryConfig[cat ?? ''] ?? { label: cat ?? 'Media', bg: 'bg-[#EAE1D6]', text: 'text-[#5B4638]' };
}

export default function AdminMediaPage() {
  const [items, setItems]         = useState<DBGalleryItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter]       = useState<FilterCat>('all');
  const [viewItem, setViewItem]   = useState<DBGalleryItem | null>(null);
  const [toast, setToast]         = useState('');
  const [uploadCat, setUploadCat] = useState('moments');
  const [uploadAlt, setUploadAlt] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function loadItems() {
    setLoading(true);
    const { data } = await getGalleryItems();
    setItems(data as DBGalleryItem[]);
    setLoading(false);
  }

  useEffect(() => { loadItems(); }, []);

  const filtered = items.filter(
    (item) => filter === 'all' || item.category === filter
  );

  async function handleDelete(item: DBGalleryItem) {
    const res = await deleteMediaFile(item.id, item.storage_path);
    if (res?.error) {
      showToast('Error al eliminar');
    } else {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      showToast('Archivo eliminado');
    }
  }

  async function handleToggleFeatured(item: DBGalleryItem) {
    const res = await updateGalleryItem(item.id, { featured: !item.featured });
    if (!res?.error) {
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, featured: !i.featured } : i));
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('alt', uploadAlt || file.name);
    fd.append('category', uploadCat);
    const res = await uploadMediaFile(fd);
    if (res?.error) {
      showToast(`Error: ${res.error}`);
    } else {
      showToast('Archivo subido');
      setUploadAlt('');
      setShowUploadForm(false);
      loadItems();
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <AdminLayout>
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 border border-[#A56E52] bg-[#FDFAF7] px-6 py-4 shadow-lg max-w-xs">
          <p className="font-sans text-xs uppercase tracking-widest text-[#A56E52]">{toast}</p>
        </div>
      )}

      {/* View modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#2A2421]/80 backdrop-blur-sm" onClick={() => setViewItem(null)} />
          <div className="relative z-10 w-full max-w-lg border border-[#EAE1D6] bg-[#FDFAF7] shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-[#EAE1D6] px-6 py-5 flex items-center justify-between">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#2A2421]">Vista previa</p>
              <button onClick={() => setViewItem(null)} className="text-[#5B4638] hover:text-[#2A2421] text-xl leading-none p-1">×</button>
            </div>
            <div className="p-6">
              {viewItem.media_type === 'video' ? (
                <div className="h-64 w-full bg-[#2A2421] flex items-center justify-center">
                  <Video size={40} className="text-[#A56E52]" />
                </div>
              ) : (
                <div className="relative h-64 w-full overflow-hidden bg-[#EAE1D6]">
                  <Image src={viewItem.public_url} alt={viewItem.alt ?? ''} fill className="object-cover" sizes="512px" unoptimized />
                </div>
              )}
              <div className="mt-4 space-y-2">
                <p className="font-sans text-[9px] uppercase tracking-widest text-[#5B4638]">Descripción</p>
                <p className="font-sans text-sm text-[#2A2421]">{viewItem.alt ?? '—'}</p>
                <div className="flex items-center gap-3 pt-2">
                  <span className="border border-[#D7C6B2] px-2 py-0.5 font-sans text-[8px] uppercase tracking-widest text-[#5B4638]">
                    {getCatConfig(viewItem.category).label}
                  </span>
                  {viewItem.featured && (
                    <span className="border border-[#A56E52] px-2 py-0.5 font-sans text-[8px] uppercase tracking-widest text-[#A56E52]">
                      Destacado
                    </span>
                  )}
                  <span className="border border-[#D7C6B2] px-2 py-0.5 font-sans text-[8px] uppercase tracking-widest text-[#5B4638]">
                    {viewItem.media_type}
                  </span>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => { handleToggleFeatured(viewItem); setViewItem(null); }}
                  className="flex-1 border border-[#D7C6B2] py-2.5 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-[#A56E52] hover:text-[#A56E52] transition-colors">
                  {viewItem.featured ? 'Quitar destacado' : '★ Destacar'}
                </button>
                <button
                  onClick={() => { handleDelete(viewItem); setViewItem(null); }}
                  className="flex-1 border border-[#D7C6B2] py-2.5 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-red-400 hover:text-red-500 transition-colors">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload panel */}
      {showUploadForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-[#2A2421]/60 backdrop-blur-sm" onClick={() => setShowUploadForm(false)} />
          <div className="relative z-10 w-full sm:max-w-md border border-[#EAE1D6] bg-[#FDFAF7] shadow-2xl mx-0 sm:mx-4 rounded-t-lg sm:rounded-none">
            <div className="border-b border-[#EAE1D6] px-6 py-5 flex items-center justify-between">
              <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">Subir archivo</p>
              <button onClick={() => setShowUploadForm(false)} className="text-[#5B4638] hover:text-[#2A2421] text-xl leading-none p-1">×</button>
            </div>
            <div className="px-6 py-6 space-y-5">
              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">Descripción (alt text)</label>
                <input type="text" value={uploadAlt} onChange={(e) => setUploadAlt(e.target.value)}
                  placeholder="Descripción del archivo..."
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors" />
              </div>
              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">Categoría</label>
                <select value={uploadCat} onChange={(e) => setUploadCat(e.target.value)}
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors">
                  {Object.entries(categoryConfig).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full border-2 border-dashed border-[#D7C6B2] hover:border-[#A56E52] transition-colors py-10 flex flex-col items-center gap-3 disabled:opacity-50">
                {uploading ? (
                  <p className="font-sans text-xs uppercase tracking-widest text-[#A56E52]">Subiendo...</p>
                ) : (
                  <>
                    <svg className="w-7 h-7 text-[#A56E52]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <p className="font-sans text-sm text-[#2A2421]">Toca para seleccionar archivo</p>
                    <p className="font-sans text-xs text-[#5B4638]">Imagen o video — máx 50MB</p>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h2 className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">Media</h2>
          <p className="mt-1 font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">
            {loading ? 'Cargando...' : `${items.length} archivo${items.length !== 1 ? 's' : ''} en la galería`}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowUploadForm(true)}>
          + Subir Archivos
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filterOptions.map((opt) => (
          <button key={opt.value} onClick={() => setFilter(opt.value)}
            className={[
              'px-4 py-2 border font-sans text-[10px] uppercase tracking-widest transition-colors',
              filter === opt.value
                ? 'border-[#2A2421] bg-[#2A2421] text-[#F7F3EE]'
                : 'border-[#D7C6B2] text-[#5B4638] hover:border-[#5B4638]',
            ].join(' ')}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="border border-[#EAE1D6] bg-[#FDFAF7] py-20 text-center">
          <p className="font-sans text-xs uppercase tracking-widest text-[#5B4638]/50">Cargando galería...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="border border-dashed border-[#D7C6B2] py-20 text-center">
          <p className="font-sans text-xs uppercase tracking-widest text-[#5B4638]/50 mb-4">
            {filter === 'all' ? 'Galería vacía — sube tu primer archivo' : 'Sin ítems en esta categoría'}
          </p>
          {filter === 'all' && (
            <Button variant="primary" size="sm" onClick={() => setShowUploadForm(true)}>+ Subir archivo</Button>
          )}
        </div>
      )}

      {/* Media grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => {
            const cat = getCatConfig(item.category);
            return (
              <div key={item.id} className="border border-[#EAE1D6] bg-[#FDFAF7] overflow-hidden">
                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-[#EAE1D6]">
                  {item.media_type === 'video' ? (
                    <div className={`${cat.bg} w-full h-full flex items-center justify-center`}>
                      <Video size={24} className={cat.text} />
                    </div>
                  ) : (
                    <Image
                      src={item.public_url}
                      alt={item.alt ?? ''}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      unoptimized
                    />
                  )}
                  {item.featured && (
                    <div className="absolute top-1.5 left-1.5">
                      <span className="border border-[#A56E52] bg-[#FDFAF7]/90 px-1.5 py-0.5 font-sans text-[7px] uppercase tracking-widest text-[#A56E52]">
                        ★
                      </span>
                    </div>
                  )}
                </div>

                {/* Info + actions */}
                <div className="px-3 py-3">
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="border border-[#D7C6B2] px-1.5 py-0.5 font-sans text-[8px] uppercase tracking-widest text-[#5B4638]">
                      {cat.label}
                    </span>
                    {item.media_type === 'video' && (
                      <span className="border border-[#D7C6B2] px-1.5 py-0.5 font-sans text-[8px] uppercase tracking-widest text-[#5B4638]">
                        Video
                      </span>
                    )}
                  </div>
                  {item.alt && (
                    <p className="font-sans text-[9px] text-[#5B4638] leading-snug line-clamp-1 mb-2">
                      {item.alt}
                    </p>
                  )}
                  {/* Action buttons — always visible for mobile */}
                  <div className="flex gap-1.5">
                    <button onClick={() => setViewItem(item)}
                      className="flex-1 border border-[#D7C6B2] py-2 font-sans text-[8px] uppercase tracking-widest text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] transition-colors">
                      Ver
                    </button>
                    <button onClick={() => handleToggleFeatured(item)}
                      className={['flex-1 border py-2 font-sans text-[8px] uppercase tracking-widest transition-colors',
                        item.featured
                          ? 'border-[#A56E52] text-[#A56E52]'
                          : 'border-[#D7C6B2] text-[#5B4638] hover:border-[#A56E52] hover:text-[#A56E52]',
                      ].join(' ')}>
                      {item.featured ? '★' : '☆'}
                    </button>
                    <button onClick={() => handleDelete(item)}
                      className="flex-1 border border-[#D7C6B2] py-2 font-sans text-[8px] uppercase tracking-widest text-[#5B4638] hover:border-red-400 hover:text-red-500 transition-colors">
                      ×
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <p className="mt-6 font-sans text-[10px] uppercase tracking-widest text-[#5B4638]/40">
          {filtered.length} ítem{filtered.length !== 1 ? 's' : ''} mostrados
        </p>
      )}
    </AdminLayout>
  );
}
