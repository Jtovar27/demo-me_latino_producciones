'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Check, Image as ImageIcon, Video, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { DBGalleryItem } from '@/types/supabase';

interface MediaPickerProps {
  value: string;
  onChange: (url: string) => void;
  accept?: 'image' | 'video' | 'all';
  label?: string;
}

const BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET ?? 'meproducciones-media';

export default function MediaPicker({ value, onChange, accept = 'all', label = 'Imagen / Video' }: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<DBGalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<'browse' | 'upload'>('browse');
  const [search, setSearch] = useState('');
  const [uploadAlt, setUploadAlt] = useState('');
  const [toast, setToast] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  async function loadItems() {
    setLoading(true);
    const supabase = createClient();
    let q = supabase.from('gallery_items').select('*').order('created_at', { ascending: false });
    if (accept === 'image') q = q.eq('media_type', 'image');
    if (accept === 'video') q = q.eq('media_type', 'video');
    const { data } = await q;
    setItems(data ?? []);
    setLoading(false);
  }

  function openPicker() { setOpen(true); loadItems(); }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('alt', uploadAlt || file.name);
    const res = await fetch('/api/media/upload', { method: 'POST', body: fd });
    const json = await res.json();
    if (json.error) { showToast('Error al subir'); } else { showToast('Subido exitosamente'); loadItems(); setTab('browse'); }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  const filtered = items.filter(item =>
    !search || (item.alt ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Field preview */}
      <div className="flex flex-col gap-2">
        <label className="font-sans text-[9px] uppercase tracking-widest text-[#5B4638]">{label}</label>
        <div className="flex gap-2 items-start">
          {value ? (
            <div className="relative w-20 h-20 border border-[#D7C6B2] overflow-hidden shrink-0">
              {value.match(/\.(mp4|webm|mov)$/i) ? (
                <div className="w-full h-full bg-[#2A2421] flex items-center justify-center">
                  <Video size={20} className="text-[#A56E52]" />
                </div>
              ) : (
                <Image src={value} alt="preview" fill className="object-cover" sizes="80px" unoptimized />
              )}
              <button onClick={() => onChange('')} className="absolute top-0.5 right-0.5 bg-[#2A2421]/80 p-0.5">
                <X size={10} className="text-white" />
              </button>
            </div>
          ) : (
            <div className="w-20 h-20 border border-dashed border-[#D7C6B2] flex items-center justify-center shrink-0">
              <ImageIcon size={20} className="text-[#D7C6B2]" />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <button onClick={openPicker} type="button"
              className="border border-[#2A2421] px-4 py-2 font-sans text-[9px] uppercase tracking-widest text-[#2A2421] hover:bg-[#2A2421] hover:text-[#F7F3EE] transition-colors">
              Seleccionar de galería
            </button>
            <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="O pega un URL..."
              className="border border-[#D7C6B2] px-3 py-1.5 font-sans text-xs text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors w-64" />
          </div>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-[#2A2421]/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-3xl mx-4 bg-[#FDFAF7] border border-[#EAE1D6] shadow-2xl flex flex-col max-h-[85vh]">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#EAE1D6] px-6 py-4 shrink-0">
              <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">Galería de medios</p>
              <button onClick={() => setOpen(false)}><X size={16} className="text-[#5B4638] hover:text-[#2A2421]" /></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#EAE1D6] shrink-0">
              {(['browse', 'upload'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-6 py-3 font-sans text-[10px] uppercase tracking-widest transition-colors ${tab === t ? 'border-b-2 border-[#A56E52] text-[#2A2421]' : 'text-[#5B4638] hover:text-[#2A2421]'}`}>
                  {t === 'browse' ? 'Explorar' : 'Subir nuevo'}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {tab === 'browse' && (
                <>
                  <div className="flex items-center gap-2 mb-4 border border-[#D7C6B2] px-3 py-2">
                    <Search size={12} className="text-[#5B4638]" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre..."
                      className="flex-1 font-sans text-xs text-[#2A2421] outline-none bg-transparent" />
                  </div>
                  {loading ? (
                    <p className="text-center font-sans text-xs text-[#5B4638] py-12">Cargando...</p>
                  ) : filtered.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="font-sans text-xs text-[#5B4638]">No hay archivos en la galería.</p>
                      <button onClick={() => setTab('upload')} className="mt-3 font-sans text-[10px] uppercase tracking-widest text-[#A56E52] underline">Subir el primero</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {filtered.map(item => (
                        <button key={item.id} onClick={() => { onChange(item.public_url); setOpen(false); }} type="button"
                          className={`group relative aspect-square border-2 overflow-hidden transition-all ${value === item.public_url ? 'border-[#A56E52]' : 'border-[#D7C6B2] hover:border-[#A56E52]'}`}>
                          {item.media_type === 'video' ? (
                            <div className="w-full h-full bg-[#2A2421] flex flex-col items-center justify-center gap-1">
                              <Video size={20} className="text-[#A56E52]" />
                              <span className="font-sans text-[8px] uppercase tracking-widest text-[#5B4638]">Video</span>
                            </div>
                          ) : (
                            <Image src={item.public_url} alt={item.alt ?? ''} fill className="object-cover" sizes="120px" unoptimized />
                          )}
                          {value === item.public_url && (
                            <div className="absolute inset-0 bg-[#A56E52]/30 flex items-center justify-center">
                              <Check size={18} className="text-white" />
                            </div>
                          )}
                          <p className="absolute bottom-0 left-0 right-0 bg-[#2A2421]/60 px-1 py-0.5 font-sans text-[7px] truncate text-[#EAE1D6] opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.alt ?? item.storage_path.split('/').pop()}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {tab === 'upload' && (
                <div className="flex flex-col gap-5 max-w-md mx-auto">
                  <div>
                    <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">Descripción / Alt text</label>
                    <input value={uploadAlt} onChange={e => setUploadAlt(e.target.value)} placeholder="Nombre descriptivo del archivo..."
                      className="w-full border border-[#D7C6B2] px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors" />
                  </div>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-[#D7C6B2] hover:border-[#A56E52] transition-colors cursor-pointer p-10 flex flex-col items-center gap-3 text-center">
                    <Upload size={24} className="text-[#A56E52]" />
                    <p className="font-sans text-sm text-[#2A2421]">Haz clic para seleccionar</p>
                    <p className="font-sans text-xs text-[#5B4638]">JPG, PNG, WebP, MP4, WebM — máx 50MB</p>
                  </div>
                  <input ref={fileRef} type="file" className="hidden"
                    accept={accept === 'image' ? 'image/*' : accept === 'video' ? 'video/*' : 'image/*,video/*'}
                    onChange={handleUpload} />
                  {uploading && <p className="text-center font-sans text-xs text-[#A56E52]">Subiendo archivo...</p>}
                  {toast && <p className="text-center font-sans text-xs text-[#A56E52]">{toast}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
