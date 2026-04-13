'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Upload, X, Check, Image as ImageIcon, Video, Search, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { DBGalleryItem } from '@/types/supabase';

interface MediaPickerProps {
  value: string;
  onChange: (url: string) => void;
  accept?: 'image' | 'video' | 'all';
  label?: string;
}

export default function MediaPicker({
  value,
  onChange,
  accept = 'all',
  label = 'Imagen / Video',
}: MediaPickerProps) {
  const [open, setOpen]           = useState(false);
  const [items, setItems]         = useState<DBGalleryItem[]>([]);
  const [loading, setLoading]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab]             = useState<'browse' | 'upload'>('browse');
  const [search, setSearch]       = useState('');
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploadCat, setUploadCat] = useState('moments');
  const [toastMsg, setToastMsg]   = useState('');
  const [toastErr, setToastErr]   = useState(false);
  const [mounted,  setMounted]    = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  function showToast(msg: string, isError = false) {
    setToastMsg(msg);
    setToastErr(isError);
    setTimeout(() => setToastMsg(''), 3000);
  }

  async function loadItems() {
    setLoading(true);
    try {
      const supabase = createClient();
      let q = supabase
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (accept === 'image') q = q.eq('media_type', 'image');
      if (accept === 'video') q = q.eq('media_type', 'video');
      const { data, error } = await q;
      if (error) throw error;
      setItems(data ?? []);
    } catch {
      showToast('Error al cargar galería', true);
    } finally {
      setLoading(false);
    }
  }

  function openPicker() {
    setOpen(true);
    loadItems();
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('alt', uploadAlt || file.name);
      fd.append('category', uploadCat);

      const res = await fetch('/api/media/upload', { method: 'POST', body: fd });

      // Safely parse JSON — if server returns non-JSON, catch it below
      let json: { error?: string; item?: { public_url: string } };
      try {
        json = await res.json();
      } catch {
        throw new Error(`Error del servidor (${res.status})`);
      }

      if (!res.ok || json.error) {
        throw new Error(json.error ?? `Error ${res.status}`);
      }

      showToast('Imagen subida exitosamente');
      setUploadAlt('');
      loadItems();
      setTab('browse');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al subir';
      showToast(
        msg.includes('Bucket not found') || msg.includes('bucket')
          ? 'El bucket de almacenamiento no existe. Créalo en Supabase Storage.'
          : msg.includes('413') || msg.includes('large')
          ? 'Archivo demasiado grande (máx 50MB)'
          : `Error: ${msg}`,
        true,
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  const filtered = items.filter(
    (item) => !search || (item.alt ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  const acceptAttr =
    accept === 'image' ? 'image/*' : accept === 'video' ? 'video/*' : 'image/*,video/*';

  const categoryOptions = ['stage', 'moments', 'backstage', 'audience', 'details'];

  return (
    <>
      {/* ── Field preview ─────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <label className="font-sans text-[9px] uppercase tracking-widest text-brown">{label}</label>
        <div className="flex flex-col sm:flex-row gap-3 items-start">
          {/* Thumbnail */}
          {value ? (
            <div className="relative w-full sm:w-24 h-24 border border-beige overflow-hidden shrink-0">
              {value.match(/\.(mp4|webm|mov)$/i) ? (
                <div className="w-full h-full bg-charcoal flex items-center justify-center">
                  <Video size={24} className="text-terracotta" />
                </div>
              ) : (
                <Image
                  src={value}
                  alt="preview"
                  fill
                  className="object-contain"
                  sizes="96px"
                  unoptimized
                />
              )}
              <button
                type="button"
                onClick={() => onChange('')}
                aria-label="Quitar imagen"
                className="absolute top-1 right-1 bg-charcoal/80 p-1 min-w-[28px] min-h-[28px] flex items-center justify-center"
              >
                <X size={12} className="text-white" />
              </button>
            </div>
          ) : (
            <div className="w-full sm:w-24 h-24 border-2 border-dashed border-beige flex items-center justify-center shrink-0 bg-ivory">
              <ImageIcon size={24} className="text-beige" />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={openPicker}
              className="min-h-[44px] border border-charcoal px-4 py-2 font-sans text-[10px] uppercase tracking-widest text-charcoal hover:bg-charcoal hover:text-ivory transition-colors cursor-pointer"
            >
              {value ? 'Cambiar imagen' : 'Seleccionar de galería'}
            </button>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="O pega una URL..."
              className="border border-beige px-3 py-2.5 font-sans text-xs text-charcoal outline-none focus:border-terracotta transition-colors w-full min-h-[44px]"
            />
          </div>
        </div>
      </div>

      {/* ── Picker modal ──────────────────────────────────────── */}
      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-charcoal/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full sm:max-w-3xl mx-0 sm:mx-4 bg-warm-white border border-sand shadow-2xl flex flex-col max-h-[90vh] rounded-t-xl sm:rounded-none">

            {/* Toast inside picker */}
            {toastMsg && (
              <div className={`absolute top-16 left-4 right-4 z-10 flex items-center gap-2 px-4 py-3 border shadow-md ${toastErr ? 'border-red-300 bg-red-50 text-red-700' : 'border-terracotta bg-warm-white text-terracotta'}`}>
                {toastErr && <AlertCircle size={14} />}
                <p className="font-sans text-xs">{toastMsg}</p>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between border-b border-sand px-5 py-4 shrink-0">
              <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-charcoal">
                Galería de medios
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar galería"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-brown hover:text-charcoal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-sand shrink-0">
              {(['browse', 'upload'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`flex-1 sm:flex-none px-6 py-3.5 font-sans text-[10px] uppercase tracking-widest transition-colors ${
                    tab === t
                      ? 'border-b-2 border-terracotta text-charcoal'
                      : 'text-brown hover:text-charcoal'
                  }`}
                >
                  {t === 'browse' ? 'Explorar galería' : 'Subir nuevo'}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* Browse tab */}
              {tab === 'browse' && (
                <>
                  <div className="flex items-center gap-2 mb-4 border border-beige px-3 py-2.5 min-h-[44px]">
                    <Search size={14} className="text-brown shrink-0" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar por nombre..."
                      className="flex-1 font-sans text-sm text-charcoal outline-none bg-transparent"
                    />
                  </div>

                  {loading ? (
                    <div className="py-16 text-center space-y-3">
                      <div className="w-8 h-8 border-2 border-beige border-t-terracotta rounded-full animate-spin mx-auto" />
                      <p className="font-sans text-xs text-brown">Cargando galería...</p>
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="py-16 text-center">
                      <ImageIcon size={32} className="text-beige mx-auto mb-3" />
                      <p className="font-sans text-xs text-brown">
                        {search ? 'No hay resultados para tu búsqueda' : 'La galería está vacía'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setTab('upload')}
                        className="mt-4 font-sans text-[10px] uppercase tracking-widest text-terracotta underline"
                      >
                        Subir el primero
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {filtered.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => { onChange(item.public_url); setOpen(false); }}
                          className={`group relative aspect-square border-2 overflow-hidden transition-all ${
                            value === item.public_url
                              ? 'border-terracotta'
                              : 'border-beige hover:border-terracotta'
                          }`}
                        >
                          {item.media_type === 'video' ? (
                            <div className="w-full h-full bg-charcoal flex flex-col items-center justify-center gap-1">
                              <Video size={20} className="text-terracotta" />
                              <span className="font-sans text-[8px] uppercase tracking-widest text-brown">
                                Video
                              </span>
                            </div>
                          ) : (
                            <Image
                              src={item.public_url}
                              alt={item.alt ?? ''}
                              fill
                              className="object-contain"
                              sizes="120px"
                              unoptimized
                            />
                          )}
                          {value === item.public_url && (
                            <div className="absolute inset-0 bg-terracotta/30 flex items-center justify-center">
                              <Check size={20} className="text-white" />
                            </div>
                          )}
                          <p className="absolute bottom-0 left-0 right-0 bg-charcoal/60 px-1 py-0.5 font-sans text-[7px] truncate text-ivory opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.alt ?? item.storage_path.split('/').pop()}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Upload tab */}
              {tab === 'upload' && (
                <div className="flex flex-col gap-5 max-w-sm mx-auto">
                  <div>
                    <label className="block font-sans text-[9px] uppercase tracking-widest text-brown mb-2">
                      Descripción (alt text)
                    </label>
                    <input
                      value={uploadAlt}
                      onChange={(e) => setUploadAlt(e.target.value)}
                      placeholder="Ej: Foto del evento Miami 2025"
                      className="w-full border border-beige px-4 py-3 font-sans text-sm text-charcoal outline-none focus:border-terracotta transition-colors min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block font-sans text-[9px] uppercase tracking-widest text-brown mb-2">
                      Categoría
                    </label>
                    <select
                      value={uploadCat}
                      onChange={(e) => setUploadCat(e.target.value)}
                      className="w-full border border-beige bg-white px-4 py-3 font-sans text-sm text-charcoal outline-none focus:border-terracotta transition-colors min-h-[44px]"
                    >
                      {categoryOptions.map((c) => (
                        <option key={c} value={c} className="capitalize">{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Drop/tap zone */}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="border-2 border-dashed border-beige hover:border-terracotta transition-colors cursor-pointer p-10 flex flex-col items-center gap-3 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <>
                        <div className="w-8 h-8 border-2 border-beige border-t-terracotta rounded-full animate-spin" />
                        <p className="font-sans text-sm text-brown">Subiendo...</p>
                        <p className="font-sans text-xs text-brown/60">No cierres esta ventana</p>
                      </>
                    ) : (
                      <>
                        <Upload size={28} className="text-terracotta" />
                        <p className="font-sans text-sm text-charcoal font-medium">
                          Toca para seleccionar archivo
                        </p>
                        <p className="font-sans text-xs text-brown">
                          Desde galería o cámara
                        </p>
                        <p className="font-sans text-[10px] text-brown/50">
                          JPG, PNG, WebP, MP4, WebM — máx 50MB
                        </p>
                      </>
                    )}
                  </button>

                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    accept={acceptAttr}
                    onChange={handleUpload}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      , document.body)}
    </>
  );
}
