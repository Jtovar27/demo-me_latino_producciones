'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Button from '@/components/ui/Button';
import { getReviews, upsertReview, deleteReview } from '@/app/actions/reviews';
import type { DBReview } from '@/types/supabase';

// ── Helpers ──────────────────────────────────────

type ReviewStatus = 'published' | 'hidden' | 'pending';

const statusConfig: Record<ReviewStatus, { label: string; styles: string }> = {
  published: { label: 'Publicado',  styles: 'border-[#A56E52] text-[#A56E52]' },
  hidden:    { label: 'Oculto',     styles: 'border-[#D7C6B2] text-[#5B4638]' },
  pending:   { label: 'Pendiente',  styles: 'border-[#2A2421] text-[#2A2421]' },
};

const emptyForm = {
  name: '', role: '', company: '', quote: '',
  rating: '5', eventName: '', status: 'pending' as ReviewStatus,
  featured: false,
};

type FormState = typeof emptyForm;
type FilterStatus = 'all' | ReviewStatus;

const filterOptions: { value: FilterStatus; label: string }[] = [
  { value: 'all',       label: 'Todos' },
  { value: 'published', label: 'Publicados' },
  { value: 'hidden',    label: 'Ocultos' },
  { value: 'pending',   label: 'Pendientes' },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={10}
          strokeWidth={1.5}
          className={n <= rating ? 'text-[#A56E52] fill-[#A56E52]' : 'text-[#D7C6B2]'}
        />
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────

export default function AdminReviewsPage() {
  const [reviews, setReviews]       = useState<DBReview[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState<FilterStatus>('all');
  const [modalOpen, setModalOpen]   = useState(false);
  const [editReview, setEditReview] = useState<DBReview | null>(null);
  const [form, setForm]             = useState<FormState>(emptyForm);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState('');

  useEffect(() => {
    getReviews().then(({ data }) => {
      setReviews(data as DBReview[]);
      setLoading(false);
    });
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  }

  const filtered = filter === 'all' ? reviews : reviews.filter((r) => r.status === filter);

  const counts = {
    published: reviews.filter((r) => r.status === 'published').length,
    hidden:    reviews.filter((r) => r.status === 'hidden').length,
    pending:   reviews.filter((r) => r.status === 'pending').length,
  };

  function openNew() {
    setEditReview(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(r: DBReview) {
    setEditReview(r);
    setForm({
      name: r.name,
      role: r.role ?? '',
      company: r.company ?? '',
      quote: r.text ?? '',
      rating: String(r.rating ?? 5),
      eventName: r.event_name ?? '',
      status: (r.status as ReviewStatus) || 'pending',
      featured: r.featured,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const fd = new FormData();
    if (editReview) fd.append('id', editReview.id);
    fd.append('name', form.name);
    fd.append('role', form.role);
    fd.append('company', form.company);
    fd.append('quote', form.quote);
    fd.append('rating', form.rating);
    fd.append('eventName', form.eventName);
    fd.append('status', form.status);
    fd.append('featured', String(form.featured));

    const result = await upsertReview(fd);
    if (result?.error) {
      showToast('Error al guardar');
    } else {
      const { data } = await getReviews();
      setReviews(data as DBReview[]);
      showToast(editReview ? 'Review actualizado' : 'Review agregado');
      setModalOpen(false);
    }
    setSaving(false);
  }

  async function toggleStatus(id: string, status: ReviewStatus) {
    const fd = new FormData();
    const review = reviews.find((r) => r.id === id);
    if (!review) return;
    fd.append('id', id);
    fd.append('name', review.name);
    fd.append('status', status);
    fd.append('featured', String(review.featured));
    fd.append('rating', String(review.rating ?? 5));
    await upsertReview(fd);
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    showToast(status === 'published' ? 'Review publicado' : 'Review ocultado');
  }

  async function toggleFeatured(id: string) {
    const review = reviews.find((r) => r.id === id);
    if (!review) return;
    const fd = new FormData();
    fd.append('id', id);
    fd.append('name', review.name);
    fd.append('status', review.status ?? 'pending');
    fd.append('featured', String(!review.featured));
    fd.append('rating', String(review.rating ?? 5));
    await upsertReview(fd);
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, featured: !r.featured } : r));
  }

  async function handleDelete(id: string) {
    await deleteReview(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
    showToast('Review eliminado');
  }

  function updateForm(field: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

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
          <h2 className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">Reviews</h2>
          <p className="mt-1 font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">
            {loading ? 'Cargando...' : `${reviews.length} reviews en total`}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openNew}>
          + Agregar Review
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {(Object.entries(counts) as [ReviewStatus, number][]).map(([status, count]) => (
          <div
            key={status}
            onClick={() => setFilter(filter === status ? 'all' : status)}
            className={`border bg-[#FDFAF7] px-6 py-5 cursor-pointer transition-colors ${
              filter === status ? 'border-[#2A2421]' : 'border-[#EAE1D6] hover:border-[#D7C6B2]'
            }`}
          >
            <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-[#5B4638]">
              {statusConfig[status].label}
            </p>
            <p className="mt-2 font-sans text-3xl font-light text-[#2A2421]">{count}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-0 mb-6">
        {filterOptions.map((opt) => {
          const count = opt.value === 'all' ? reviews.length : counts[opt.value as ReviewStatus];
          return (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={[
                'px-4 py-2.5 border font-sans text-[10px] uppercase tracking-widest transition-colors -ml-px first:ml-0',
                filter === opt.value
                  ? 'border-[#2A2421] bg-[#2A2421] text-[#F7F3EE] z-10 relative'
                  : 'border-[#D7C6B2] text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421]',
              ].join(' ')}
            >
              {opt.label}
              <span className="ml-1.5 opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="border border-[#EAE1D6] bg-[#FDFAF7] overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#EAE1D6]">
              <th className="px-7 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">Persona</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden md:table-cell">Testimonio</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden lg:table-cell">Evento</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">Estado</th>
              <th className="px-4 py-5 text-left font-sans text-[10px] uppercase tracking-widest text-[#5B4638] hidden xl:table-cell">Dest.</th>
              <th className="px-7 py-5 text-right font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-7 py-14 text-center font-sans text-xs uppercase tracking-widest text-[#5B4638]/50">
                  Cargando reviews...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-7 py-14 text-center font-sans text-xs uppercase tracking-widest text-[#5B4638]/50">
                  Sin reviews para este filtro
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const sc = statusConfig[(r.status as ReviewStatus)] ?? statusConfig.pending;
                return (
                  <tr key={r.id} className="border-b border-[#EAE1D6]/60 hover:bg-[#F7F3EE] transition-colors">
                    <td className="px-7 py-6">
                      <p className="font-sans text-sm text-[#2A2421] font-medium">{r.name}</p>
                      <p className="font-sans text-[10px] text-[#5B4638] mt-0.5">{r.role ?? '—'}</p>
                      <p className="font-sans text-[10px] text-[#A56E52]">{r.company ?? ''}</p>
                      <div className="mt-1.5">
                        <StarRating rating={r.rating ?? 5} />
                      </div>
                    </td>
                    <td className="px-4 py-6 hidden md:table-cell">
                      <p className="font-sans text-xs text-[#5B4638] max-w-[260px] line-clamp-2 italic">
                        &ldquo;{r.text ?? ''}&rdquo;
                      </p>
                    </td>
                    <td className="px-4 py-6 hidden lg:table-cell">
                      <p className="font-sans text-xs text-[#2A2421] max-w-[160px] truncate">{r.event_name ?? '—'}</p>
                    </td>
                    <td className="px-4 py-6">
                      <span className={`border px-2.5 py-1 font-sans text-[9px] uppercase tracking-widest ${sc.styles}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-6 hidden xl:table-cell">
                      <button
                        onClick={() => toggleFeatured(r.id)}
                        className={`transition-colors ${
                          r.featured ? 'text-[#A56E52]' : 'text-[#D7C6B2] hover:text-[#A56E52]'
                        }`}
                        title={r.featured ? 'Quitar destacado' : 'Destacar'}
                      >
                        <Star size={14} strokeWidth={1.5} className={r.featured ? 'fill-[#A56E52]' : ''} />
                      </button>
                    </td>
                    <td className="px-7 py-6">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        {r.status === 'published' ? (
                          <button
                            onClick={() => toggleStatus(r.id, 'hidden')}
                            className="border border-[#D7C6B2] px-3 py-1.5 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] transition-colors"
                          >
                            Ocultar
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleStatus(r.id, 'published')}
                            className="border border-[#A56E52] px-3 py-1.5 font-sans text-[9px] uppercase tracking-widest text-[#A56E52] hover:bg-[#A56E52] hover:text-white transition-colors"
                          >
                            Publicar
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(r)}
                          className="border border-[#D7C6B2] px-3 py-1.5 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-[#2A2421] hover:text-[#2A2421] transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="border border-[#D7C6B2] px-3 py-1.5 font-sans text-[9px] uppercase tracking-widest text-[#5B4638] hover:border-red-400 hover:text-red-500 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 font-sans text-[10px] uppercase tracking-widest text-[#5B4638]/50">
        {filtered.length} review{filtered.length !== 1 ? 's' : ''} mostrados
      </p>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#2A2421]/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg border border-[#EAE1D6] bg-[#FDFAF7] shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-[#EAE1D6] px-8 py-6 flex items-center justify-between">
              <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#2A2421]">
                {editReview ? 'Editar Review' : 'Agregar Review'}
              </p>
              <button onClick={() => setModalOpen(false)} className="text-[#5B4638] hover:text-[#2A2421] text-xl leading-none">×</button>
            </div>
            <div className="px-8 py-7 space-y-5">
              {[
                { field: 'name',      label: 'Nombre completo',    placeholder: 'Ana García' },
                { field: 'role',      label: 'Cargo / Rol',        placeholder: 'CEO, Directora...' },
                { field: 'company',   label: 'Empresa',            placeholder: 'Nombre de empresa' },
                { field: 'eventName', label: 'Evento relacionado', placeholder: 'The Real Happiness...' },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">{label}</label>
                  <input
                    type="text"
                    value={form[field as keyof FormState] as string}
                    onChange={(e) => updateForm(field as keyof FormState, e.target.value)}
                    placeholder={placeholder}
                    className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">Testimonio</label>
                <textarea
                  value={form.quote}
                  onChange={(e) => updateForm('quote', e.target.value)}
                  rows={4}
                  placeholder="Escribe el testimonio..."
                  className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">Rating (1–5)</label>
                  <select
                    value={form.rating}
                    onChange={(e) => updateForm('rating', e.target.value)}
                    className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors"
                  >
                    {[5,4,3,2,1].map((n) => <option key={n} value={n}>{n} estrella{n !== 1 ? 's' : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-sans text-[9px] uppercase tracking-widest text-[#5B4638] mb-2">Estado</label>
                  <select
                    value={form.status}
                    onChange={(e) => updateForm('status', e.target.value as ReviewStatus)}
                    className="w-full border border-[#D7C6B2] bg-white px-4 py-3 font-sans text-sm text-[#2A2421] outline-none focus:border-[#A56E52] transition-colors"
                  >
                    <option value="published">Publicado</option>
                    <option value="hidden">Oculto</option>
                    <option value="pending">Pendiente</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => updateForm('featured', e.target.checked)}
                  className="w-4 h-4 accent-[#A56E52]"
                />
                <span className="font-sans text-[10px] uppercase tracking-widest text-[#5B4638]">Destacar este review</span>
              </label>
            </div>
            <div className="border-t border-[#EAE1D6] px-8 py-5 flex items-center justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>Guardar</Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
