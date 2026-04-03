'use client';

import { useState, useRef } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import { galleryItems, type GalleryCategory } from '@/lib/data';

type FilterCat = 'all' | GalleryCategory;

const categoryConfig: Record<
  GalleryCategory,
  { label: string; bg: string; text: string }
> = {
  stage: { label: 'Stage', bg: 'bg-[#2A2421]', text: 'text-[#F7F3EE]' },
  moments: { label: 'Moments', bg: 'bg-[#A56E52]', text: 'text-[#F7F3EE]' },
  backstage: { label: 'Backstage', bg: 'bg-[#5B4638]', text: 'text-[#F7F3EE]' },
  audience: { label: 'Audience', bg: 'bg-[#D7C6B2]', text: 'text-[#2A2421]' },
  details: { label: 'Details', bg: 'bg-[#EAE1D6]', text: 'text-[#5B4638]' },
};

const filterOptions: { value: FilterCat; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'stage', label: 'Stage' },
  { value: 'moments', label: 'Moments' },
  { value: 'backstage', label: 'Backstage' },
  { value: 'audience', label: 'Audience' },
  { value: 'details', label: 'Details' },
];

export default function AdminMediaPage() {
  const [filter, setFilter] = useState<FilterCat>('all');
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeItems = galleryItems.filter((item) => !deletedIds.has(item.id));
  const filtered = activeItems.filter(
    (item) => filter === 'all' || item.category === filter
  );

  function handleDelete(id: string) {
    setDeletedIds((prev) => new Set([...prev, id]));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file.name);
      setTimeout(() => setUploadedFile(null), 3000);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const viewingItem = galleryItems.find((m) => m.id === viewItem);

  return (
    <AdminLayout>
      {/* Upload notification strip */}
      {uploadedFile && (
        <div className="fixed top-6 right-6 z-50 border border-[#A56E52] bg-[#FDFAF7] px-6 py-4 shadow-lg max-w-xs">
          <p className="font-sans text-[9px] uppercase tracking-widest text-[#5B4638]">
            Archivo seleccionado (demo)
          </p>
          <p className="font-sans text-xs text-[#2A2421] mt-1 truncate">{uploadedFile}</p>
        </div>
      )}

      {/* View modal */}
      {viewItem && viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-[#2A2421]/80 backdrop-blur-sm"
            onClick={() => setViewItem(null)}
          />
          <div className="relative z-10 w-full max-w-lg border border-[#EAE1D6] bg-[#FDFAF7] shadow-2xl mx-4">
            <div className="border-b border-[#EAE1D6] px-8 py-5 flex items-center justify-between">
              <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#2A2421]">
                Vista previa
              </p>
              <button
                onClick={() => setViewItem(null)}
                className="font-sans text-[#5B4638] hover:text-[#2A2421] text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div
                className={`h-64 w-full ${categoryConfig[viewingItem.category].bg} flex items-center justify-center`}
              >
                <div className="text-center px-6">
                  <span
                    className={`font-sans text-[10px] uppercase tracking-widest ${categoryConfig[viewingItem.category].text} opacity-60`}
                  >
                    {categoryConfig[viewingItem.category].label}
                  </span>
                  <p
                    className={`mt-2 font-sans text-xs ${categoryConfig[viewingItem.category].text} opacity-80 leading-relaxed`}
                  >
                    {viewingItem.alt}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="font-sans text-[9px] uppercase tracking-widest text-[#5B4638]">
                  ID: {viewingItem.id}
                </p>
                <p className="font-sans text-xs text-[#2A2421] mt-1 leading-relaxed">
                  {viewingItem.alt}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="border border-[#D7C6B2] px-2 py-0.5 font-sans text-[8px] uppercase tracking-widest text-[#5B4638]">
                    {categoryConfig[viewingItem.category].label}
                  </span>
                  {viewingItem.featured && (
                    <span className="border border-[#A56E52] px-2 py-0.5 font-sans text-[8px] uppercase tracking-widest text-[#A56E52]">
                      Destacado
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h2 className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">Media</h2>
          <p className="mt-1 font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">
            {activeItems.length} ítem{activeItems.length !== 1 ? 's' : ''} en la galería
          </p>
        </div>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*"
            className="hidden"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            + Subir Archivos
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={[
              'px-4 py-2 border font-sans text-[10px] uppercase tracking-widest transition-colors',
              filter === opt.value
                ? 'border-[#2A2421] bg-[#2A2421] text-[#F7F3EE]'
                : 'border-[#D7C6B2] text-[#5B4638] hover:border-[#5B4638]',
            ].join(' ')}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Media grid */}
      {filtered.length === 0 ? (
        <div className="border border-[#EAE1D6] bg-[#FDFAF7] py-20 text-center">
          <p className="font-sans text-xs uppercase tracking-widest text-[#5B4638]/50">
            Sin ítems en esta categoría
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => {
            const cat = categoryConfig[item.category];
            return (
              <div
                key={item.id}
                className="group relative border border-[#EAE1D6] bg-[#FDFAF7] overflow-hidden"
              >
                {/* Colored placeholder (aspect-video) */}
                <div
                  className={`${cat.bg} aspect-video w-full flex items-center justify-center relative`}
                >
                  <span
                    className={`font-sans text-[9px] uppercase tracking-widest ${cat.text} opacity-50`}
                  >
                    {cat.label}
                  </span>
                  {item.featured && (
                    <div className="absolute top-2 right-2">
                      <span className="border border-[#A56E52] bg-[#FDFAF7]/90 px-1.5 py-0.5 font-sans text-[7px] uppercase tracking-widest text-[#A56E52]">
                        ★
                      </span>
                    </div>
                  )}
                  {/* Hover overlay with buttons */}
                  <div className="absolute inset-0 bg-[#2A2421]/0 group-hover:bg-[#2A2421]/50 transition-colors flex items-center justify-center gap-2">
                    <button
                      onClick={() => setViewItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 border border-[#F7F3EE] px-3 py-1.5 font-sans text-[8px] uppercase tracking-widest text-[#F7F3EE] hover:bg-[#F7F3EE] hover:text-[#2A2421] transition-all"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="opacity-0 group-hover:opacity-100 border border-red-300 px-3 py-1.5 font-sans text-[8px] uppercase tracking-widest text-red-300 hover:bg-red-400 hover:text-white transition-all"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                {/* Category label overlay at bottom */}
                <div className="px-3 py-3">
                  <span className="border border-[#D7C6B2] px-1.5 py-0.5 font-sans text-[8px] uppercase tracking-widest text-[#5B4638]">
                    {cat.label}
                  </span>
                  <p className="mt-1.5 font-sans text-[9px] text-[#5B4638] leading-snug line-clamp-2">
                    {item.alt}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-6 font-sans text-[10px] uppercase tracking-widest text-[#5B4638]/40">
        {filtered.length} ítem{filtered.length !== 1 ? 's' : ''} mostrados — hover para acciones
      </p>
    </AdminLayout>
  );
}
